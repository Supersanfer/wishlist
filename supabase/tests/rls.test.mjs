// Banco de pruebas de RLS contra Postgres real (PGlite / PG18).
// Reproduce el entorno de Supabase: esquema auth, auth.uid(), roles anon y
// authenticated, y los mismos GRANT por defecto.
import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MIGRATIONS = fileURLToPath(new URL("../migrations", import.meta.url));

const db = await PGlite.create();

let pass = 0;
const failures = [];

function ok(name) {
  pass++;
  console.log(`  ok   ${name}`);
}
function fail(name, detail) {
  failures.push(`${name}: ${detail}`);
  console.log(`  FAIL ${name} -- ${detail}`);
}

/** Ejecuta `fn` como el usuario dado (rol authenticated + claim sub). */
async function as(uid, fn) {
  await db.exec("begin");
  try {
    await db.query("select set_config('request.jwt.claims', $1, true)", [
      JSON.stringify({ sub: uid, role: "authenticated" }),
    ]);
    await db.exec("set local role authenticated");
    const result = await fn();
    await db.exec("reset role");
    await db.exec("commit");
    return result;
  } catch (e) {
    await db.exec("rollback");
    await db.exec("reset role");
    throw e;
  }
}

async function expectOk(name, uid, fn) {
  try {
    const r = await as(uid, fn);
    ok(name);
    return r;
  } catch (e) {
    fail(name, `esperaba exito, dio error: ${e.message}`);
    return null;
  }
}

async function expectDenied(name, uid, fn) {
  try {
    const r = await as(uid, fn);
    // RLS deniega de dos formas: error, o silenciosamente 0 filas.
    if (r && r.affectedRows === 0 && (r.rows?.length ?? 0) === 0)
      ok(`${name}  [0 filas]`);
    else fail(name, "esperaba fallo/denegacion, pero funciono");
  } catch (e) {
    ok(`${name}  [${e.message.split("\n")[0].slice(0, 70)}]`);
  }
}

/** Para DML que RLS convierte en "0 filas afectadas" en vez de en un error. */
async function expectNoRowsAffected(name, uid, sql, params = []) {
  const r = await as(uid, () => db.query(sql, params));
  if (r.affectedRows === 0) ok(`${name}  [0 filas afectadas]`);
  else fail(name, `afecto a ${r.affectedRows} filas`);
}

// ---------------------------------------------------------------------------
// Entorno Supabase simulado
// ---------------------------------------------------------------------------
await db.exec(`
  create schema if not exists auth;
  create role anon nologin;
  create role authenticated nologin;
  grant usage on schema public to anon, authenticated;
  alter default privileges in schema public
    grant all on tables to anon, authenticated;
  alter default privileges in schema public
    grant all on functions to anon, authenticated;

  create table auth.users (
    id uuid primary key default gen_random_uuid(),
    email text unique,
    raw_user_meta_data jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
  );

  create or replace function auth.uid() returns uuid
  language sql stable as $$
    select nullif(
      current_setting('request.jwt.claims', true)::jsonb ->> 'sub', ''
    )::uuid
  $$;
  grant usage on schema auth to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;
`);

// ---------------------------------------------------------------------------
// Migraciones del proyecto
// ---------------------------------------------------------------------------
const files = readdirSync(MIGRATIONS).filter((f) => f.endsWith(".sql")).sort();
for (const f of files) {
  process.stdout.write(`migracion ${f} ... `);
  await db.exec(readFileSync(path.join(MIGRATIONS, f), "utf8"));
  console.log("aplicada");
}
console.log();

// ---------------------------------------------------------------------------
// Usuarios
// ---------------------------------------------------------------------------
async function signup(email, name) {
  const r = await db.query(
    `insert into auth.users (email, raw_user_meta_data)
     values ($1, jsonb_build_object('display_name', $2::text)) returning id`,
    [email, name],
  );
  return r.rows[0].id;
}
const anguita = await signup("anguita@example.com", "Anguita");
const bianca = await signup("bianca@example.com", "Bianca");
const carlos = await signup("carlos@example.com", "Carlos");
const dana = await signup("dana@example.com", "Dana");

console.log("== perfiles ==");
{
  const r = await db.query("select id, display_name from public.profiles order by display_name");
  if (r.rows.length === 4 && r.rows[0].display_name === "Anguita")
    ok("el trigger de auth.users crea los perfiles");
  else fail("trigger de perfiles", JSON.stringify(r.rows));
}

console.log("\n== emparejamiento ==");
await expectOk("Anguita crea pareja", anguita, () =>
  db.query("select public.create_couple()"),
);
await expectDenied("Anguita no puede crear una segunda pareja", anguita, () =>
  db.query("select public.create_couple()"),
);
// Id real de la pareja de Anguita, leido saltando RLS para poder atacarla.
const coupleAB = (await db.query("select id from public.couples limit 1")).rows[0].id;
await expectDenied("insert directo en couple_members denegado", carlos, () =>
  db.query(
    `insert into public.couple_members (couple_id, user_id, member_slot)
     values ($1, $2, 2)`,
    [coupleAB, carlos],
  ),
);
await expectDenied("insert directo en couples denegado", carlos, () =>
  db.query("insert into public.couples (created_by) values ($1)", [carlos]),
);
await expectDenied("no se puede unir con un codigo inventado", bianca, () =>
  db.query("select public.redeem_couple_invitation($1)", ["0".repeat(32)]),
);

const inv = await expectOk("Anguita genera invitacion", anguita, () =>
  db.query("select * from public.create_couple_invitation()"),
);
const code = inv.rows[0].code;
if (/^[0-9a-f]{32}$/.test(code)) ok(`codigo aleatorio de 128 bits (${code})`);
else fail("formato del codigo", code);

await expectDenied("Carlos no puede leer la invitacion ajena", carlos, async () => {
  const r = await db.query("select * from public.couple_invitations");
  if (r.rows.length === 0) throw new Error("0 filas visibles");
  return r;
});

await expectOk("Bianca canjea la invitacion", bianca, () =>
  db.query("select public.redeem_couple_invitation($1)", [code]),
);
await expectDenied("la invitacion es de un solo uso", carlos, () =>
  db.query("select public.redeem_couple_invitation($1)", [code]),
);
await expectDenied("Bianca ya emparejada no puede canjear otra", bianca, () =>
  db.query("select public.redeem_couple_invitation($1)", [code]),
);
await expectDenied("no se generan invitaciones con la pareja completa", anguita, () =>
  db.query("select public.create_couple_invitation()"),
);

// Tercer miembro, forzado como superusuario (salta RLS): debe frenarlo una constraint.
{
  const couple = (
    await db.query("select couple_id from public.couple_members limit 1")
  ).rows[0].couple_id;
  try {
    await db.query(
      `insert into public.couple_members (couple_id, user_id, member_slot)
       values ($1, $2, 3)`,
      [couple, carlos],
    );
    fail("tercer miembro", "la constraint no lo impidio");
  } catch (e) {
    ok(`tercer miembro imposible incluso saltando RLS  [${e.message.slice(0, 45)}]`);
  }
}

// Segunda pareja de control.
await expectOk("Carlos crea su pareja", carlos, () =>
  db.query("select public.create_couple()"),
);
const inv2 = await as(carlos, () =>
  db.query("select * from public.create_couple_invitation()"),
);
await as(dana, () =>
  db.query("select public.redeem_couple_invitation($1)", [inv2.rows[0].code]),
);

console.log("\n== profiles ==");
{
  const r = await as(anguita, () =>
    db.query("select display_name from public.profiles order by display_name"),
  );
  const names = r.rows.map((x) => x.display_name);
  if (names.length === 2 && names.includes("Anguita") && names.includes("Bianca"))
    ok("Anguita solo ve su perfil y el de Bianca");
  else fail("visibilidad de profiles", JSON.stringify(names));
}
await expectOk("Anguita edita su perfil", anguita, () =>
  db.query("update public.profiles set display_name = 'Anguita R.' where id = $1", [
    anguita,
  ]),
);
await expectNoRowsAffected(
  "Anguita no puede editar el perfil de Bianca",
  anguita,
  "update public.profiles set display_name = 'hackeada' where id = $1",
  [bianca],
);

console.log("\n== ocasiones ==");
const occB = (
  await as(bianca, () =>
    db.query(
      `insert into public.occasions (owner_id, name, occasion_date)
       values ($1, 'Cumpleanos', '2026-11-02') returning id`,
      [bianca],
    ),
  )
).rows[0].id;
ok("Bianca crea una ocasion");
{
  const r = await as(anguita, () => db.query("select name from public.occasions"));
  if (r.rows.length === 1 && r.rows[0].name === "Cumpleanos")
    ok("Anguita ve las ocasiones de Bianca");
  else fail("ocasiones de la pareja", JSON.stringify(r.rows));
}
await expectNoRowsAffected(
  "Anguita no puede borrar ocasiones de Bianca",
  anguita,
  "delete from public.occasions where id = $1",
  [occB],
);
await expectDenied("Anguita no puede crear ocasiones a nombre de Bianca", anguita, () =>
  db.query(
    `insert into public.occasions (owner_id, name, occasion_date)
     values ($1, 'Falsa', '2026-01-01')`,
    [bianca],
  ),
);
// CRUD completo de las ocasiones propias.
await expectOk("Bianca edita su ocasion", bianca, () =>
  db.query("update public.occasions set name = 'Cumple de Bianca' where id = $1", [occB]),
);
{
  const r = await as(bianca, () =>
    db.query("select name from public.occasions where id = $1", [occB]),
  );
  if (r.rows[0]?.name === "Cumple de Bianca") ok("la edicion de la ocasion persiste");
  else fail("persistencia de la ocasion", JSON.stringify(r.rows));
}
await expectNoRowsAffected(
  "Anguita no puede editar ocasiones de Bianca",
  anguita,
  "update public.occasions set name = 'Robada' where id = $1",
  [occB],
);
{
  const throwaway = (
    await as(bianca, () =>
      db.query(
        `insert into public.occasions (owner_id, name, occasion_date)
         values ($1, 'Temporal', '2027-01-01') returning id`,
        [bianca],
      ),
    )
  ).rows[0].id;
  const r = await as(bianca, () =>
    db.query("delete from public.occasions where id = $1", [throwaway]),
  );
  if (r.affectedRows === 1) ok("Bianca borra su propia ocasion");
  else fail("borrado de ocasion propia", `afectadas ${r.affectedRows}`);
}
{
  const r = await as(dana, () => db.query("select * from public.occasions"));
  if (r.rows.length === 0) ok("otra pareja no ve las ocasiones ajenas");
  else fail("aislamiento de ocasiones", JSON.stringify(r.rows));
}

console.log("\n== wishlist personal ==");
const itemB = (
  await as(bianca, () =>
    db.query(
      `insert into public.wishlist_items (owner_id, occasion_id, title, price_cents, priority)
       values ($1, $2, 'AirPods Pro', 19900, 'high') returning id`,
      [bianca, occB],
    ),
  )
).rows[0].id;
ok("Bianca crea un deseo asociado a su ocasion");

await expectDenied("no se puede asociar un deseo a la ocasion de la pareja", anguita, () =>
  db.query(
    `insert into public.wishlist_items (owner_id, occasion_id, title)
     values ($1, $2, 'Robado')`,
    [anguita, occB],
  ),
);
await expectDenied("Anguita no puede crear deseos a nombre de Bianca", anguita, () =>
  db.query("insert into public.wishlist_items (owner_id, title) values ($1, 'Falso')", [
    bianca,
  ]),
);
{
  const r = await as(anguita, () => db.query("select title from public.wishlist_items"));
  if (r.rows.length === 1 && r.rows[0].title === "AirPods Pro")
    ok("Anguita ve la wishlist de Bianca");
  else fail("lectura de la wishlist de la pareja", JSON.stringify(r.rows));
}
await expectNoRowsAffected(
  "Anguita no puede editar deseos de Bianca",
  anguita,
  "update public.wishlist_items set title = 'Calcetines' where id = $1",
  [itemB],
);
await expectNoRowsAffected(
  "Anguita no puede borrar deseos de Bianca",
  anguita,
  "delete from public.wishlist_items where id = $1",
  [itemB],
);
{
  const r = await as(dana, () => db.query("select * from public.wishlist_items"));
  if (r.rows.length === 0) ok("Dana (otra pareja) no ve nada");
  else fail("aislamiento entre parejas", JSON.stringify(r.rows));
}

// El dueno gestiona lo suyo de punta a punta (crear / editar / borrar).
await expectOk("Bianca edita su propio deseo", bianca, () =>
  db.query("update public.wishlist_items set title = 'AirPods Pro 2', price_cents = 24900 where id = $1", [
    itemB,
  ]),
);
{
  const r = await as(bianca, () =>
    db.query("select title, price_cents from public.wishlist_items where id = $1", [itemB]),
  );
  if (r.rows[0]?.title === "AirPods Pro 2" && r.rows[0]?.price_cents === 24900)
    ok("la edicion del dueno persiste");
  else fail("persistencia de la edicion", JSON.stringify(r.rows));
}
await expectOk("Bianca cambia la prioridad de su deseo", bianca, () =>
  db.query("update public.wishlist_items set priority = 'low' where id = $1", [itemB]),
);
// El WITH CHECK de la politica impide regalarle un deseo a la pareja.
await expectDenied("no se puede cambiar el owner_id de un deseo propio", bianca, () =>
  db.query("update public.wishlist_items set owner_id = $1 where id = $2", [anguita, itemB]),
);
// Peticion manipulada: Anguita apunta al deseo de Bianca sin filtrar por owner.
await expectNoRowsAffected(
  "un update manipulado sobre un deseo ajeno no afecta a nada",
  anguita,
  "update public.wishlist_items set title = 'Calcetines'",
);
await expectNoRowsAffected(
  "un delete manipulado sobre un deseo ajeno no afecta a nada",
  anguita,
  "delete from public.wishlist_items",
);
{
  // El dueno si puede borrar el suyo. Se recrea para no alterar lo que sigue.
  const throwaway = (
    await as(bianca, () =>
      db.query(
        "insert into public.wishlist_items (owner_id, title) values ($1, 'Prueba de borrado') returning id",
        [bianca],
      ),
    )
  ).rows[0].id;
  const r = await as(bianca, () =>
    db.query("delete from public.wishlist_items where id = $1", [throwaway]),
  );
  if (r.affectedRows === 1) ok("Bianca borra su propio deseo");
  else fail("borrado del dueno", `afectadas ${r.affectedRows}`);
}
// La ocasion de la pareja sigue sin poder colarse por un update.
await expectDenied("no se puede mover un deseo a la ocasion de la pareja", anguita, async () => {
  const mine = await db.query(
    "insert into public.wishlist_items (owner_id, title) values ($1, 'Mio') returning id",
    [anguita],
  );
  return db.query("update public.wishlist_items set occasion_id = $1 where id = $2", [
    occB,
    mine.rows[0].id,
  ]);
});

console.log("\n== wishlist conjunta ==");
const sharedId = (
  await as(anguita, () =>
    db.query(
      `insert into public.shared_wishlist_items (couple_id, created_by, title)
       values (public.current_couple_id(), $1, 'Viaje a Japon') returning id`,
      [anguita],
    ),
  )
).rows[0].id;
ok("Anguita crea un item conjunto");
await expectOk("Bianca edita el item conjunto de Anguita", bianca, () =>
  db.query("update public.shared_wishlist_items set title = 'Viaje a Japon 2027' where id = $1", [
    sharedId,
  ]),
);
{
  const r = await as(dana, () => db.query("select * from public.shared_wishlist_items"));
  if (r.rows.length === 0) ok("Dana no ve la wishlist conjunta ajena");
  else fail("aislamiento de la wishlist conjunta", JSON.stringify(r.rows));
}
await expectDenied("no se puede insertar en la pareja ajena", dana, () =>
  db.query(
    `insert into public.shared_wishlist_items (couple_id, created_by, title)
     values ($1, $2, 'Intruso')`,
    [coupleAB, dana],
  ),
);
// Sin propietario: quien no lo creo tambien puede crear, editar y borrar.
{
  const byBianca = (
    await as(bianca, () =>
      db.query(
        `insert into public.shared_wishlist_items (couple_id, created_by, title)
         values (public.current_couple_id(), $1, 'Cena de aniversario') returning id`,
        [bianca],
      ),
    )
  ).rows[0].id;
  ok("Bianca tambien crea en la lista conjunta");

  const upd = await as(anguita, () =>
    db.query("update public.shared_wishlist_items set price_cents = 8000 where id = $1", [
      byBianca,
    ]),
  );
  if (upd.affectedRows === 1) ok("Anguita edita lo que creo Bianca");
  else fail("edicion cruzada en la conjunta", `afectadas ${upd.affectedRows}`);

  const del = await as(anguita, () =>
    db.query("delete from public.shared_wishlist_items where id = $1", [byBianca]),
  );
  if (del.affectedRows === 1) ok("Anguita borra lo que creo Bianca");
  else fail("borrado cruzado en la conjunta", `afectadas ${del.affectedRows}`);
}
await expectNoRowsAffected(
  "otra pareja no puede editar la lista conjunta ajena",
  dana,
  "update public.shared_wishlist_items set title = 'Intruso'",
);
await expectNoRowsAffected(
  "otra pareja no puede borrar la lista conjunta ajena",
  dana,
  "delete from public.shared_wishlist_items",
);

console.log("\n== reservas de regalos (secreto) ==");
const resId = (
  await as(anguita, () =>
    db.query(
      `insert into public.gift_reservations (wishlist_item_id, item_owner_id, reserver_id)
       values ($1, $2, $3) returning id`,
      [itemB, bianca, anguita],
    ),
  )
).rows[0].id;
ok("Anguita reserva el deseo de Bianca");

{
  const r = await as(bianca, () => db.query("select * from public.gift_reservations"));
  if (r.rows.length === 0) ok("Bianca NO ve la reserva (select directo)");
  else fail("FUGA: select directo", JSON.stringify(r.rows));
}
{
  const r = await as(bianca, () =>
    db.query("select count(*)::int as n from public.gift_reservations"),
  );
  if (r.rows[0].n === 0) ok("Bianca NO ve la reserva (count agregado)");
  else fail("FUGA: count", JSON.stringify(r.rows));
}
{
  const r = await as(bianca, () =>
    db.query(
      `select i.title, r.id as reserva
       from public.wishlist_items i
       left join public.gift_reservations r on r.wishlist_item_id = i.id
       where i.owner_id = $1`,
      [bianca],
    ),
  );
  if (r.rows.length === 1 && r.rows[0].reserva === null)
    ok("Bianca NO ve la reserva (join desde su wishlist)");
  else fail("FUGA: join", JSON.stringify(r.rows));
}
{
  const r = await as(bianca, () =>
    db.query(
      `select exists (
         select 1 from public.gift_reservations where wishlist_item_id = $1
       ) as reservado`,
      [itemB],
    ),
  );
  if (r.rows[0].reservado === false) ok("Bianca NO ve la reserva (EXISTS)");
  else fail("FUGA: exists", JSON.stringify(r.rows));
}
{
  // Sondeo por colision de la constraint: Bianca intenta reservar su propio deseo.
  // Debe fallar por RLS, nunca por unique violation (que revelaria la reserva).
  try {
    await as(bianca, () =>
      db.query(
        `insert into public.gift_reservations (wishlist_item_id, item_owner_id, reserver_id)
         values ($1, $2, $3)`,
        [itemB, bianca, bianca],
      ),
    );
    fail("sondeo por constraint", "Bianca pudo reservar su propio deseo");
  } catch (e) {
    if (/unique|duplicate/i.test(e.message))
      fail("FUGA: sondeo por constraint", `unique violation revela la reserva: ${e.message}`);
    else ok(`Bianca no puede sondear la reserva reservando su deseo  [${e.message.slice(0, 40)}]`);
  }
}
{
  const r = await as(anguita, () => db.query("select * from public.gift_reservations"));
  if (r.rows.length === 1) ok("Anguita SI ve su propia reserva");
  else fail("lectura de reserva propia", JSON.stringify(r.rows));
}
await expectDenied("no se puede reservar en nombre de la pareja", anguita, () =>
  db.query(
    `insert into public.gift_reservations (wishlist_item_id, item_owner_id, reserver_id)
     values ($1, $2, $3)`,
    [itemB, bianca, bianca],
  ),
);
// Dana pertenece a otra pareja: el deseo de Bianca le es completamente ajeno.
await expectDenied("no se puede reservar un deseo de otra pareja", dana, () =>
  db.query(
    `insert into public.gift_reservations (wishlist_item_id, item_owner_id, reserver_id)
     values ($1, $2, $3)`,
    [itemB, bianca, dana],
  ),
);
{
  const r = await as(dana, () =>
    db.query("select * from public.gift_reservations where wishlist_item_id = $1", [itemB]),
  );
  if (r.rows.length === 0) ok("otra pareja no ve las reservas ajenas");
  else fail("FUGA: reservas visibles a otra pareja", JSON.stringify(r.rows));
}
// La FK compuesta ata item_owner_id al dueño real del deseo: mentir no cuela.
await expectDenied("no se puede falsear el item_owner_id de la reserva", anguita, () =>
  db.query(
    `insert into public.gift_reservations (wishlist_item_id, item_owner_id, reserver_id)
     values ($1, $2, $3)`,
    [itemB, anguita, anguita],
  ),
);
await expectNoRowsAffected(
  "Bianca no puede modificar la reserva de Anguita",
  bianca,
  "update public.gift_reservations set status = 'purchased', purchased_at = now() where id = $1",
  [resId],
);
await expectNoRowsAffected(
  "Bianca no puede borrar la reserva de Anguita",
  bianca,
  "delete from public.gift_reservations where id = $1",
  [resId],
);
await expectDenied("no se puede reasignar una reserva a otra persona", anguita, () =>
  db.query("update public.gift_reservations set reserver_id = $1 where id = $2", [
    bianca,
    resId,
  ]),
);
await expectOk("Anguita marca su reserva como comprada", anguita, () =>
  db.query(
    "update public.gift_reservations set status = 'purchased', purchased_at = now() where id = $1",
    [resId],
  ),
);
await expectDenied("status 'purchased' exige purchased_at", anguita, () =>
  db.query(
    "update public.gift_reservations set status = 'purchased', purchased_at = null where id = $1",
    [resId],
  ),
);

// Doble reserva activa.
{
  const otherItem = (
    await as(bianca, () =>
      db.query(
        "insert into public.wishlist_items (owner_id, title) values ($1, 'Libro') returning id",
        [bianca],
      ),
    )
  ).rows[0].id;
  try {
    await as(anguita, () =>
      db.query(
        `insert into public.gift_reservations (wishlist_item_id, item_owner_id, reserver_id)
         values ($1, $2, $3)`,
        [itemB, bianca, anguita],
      ),
    );
    fail("doble reserva activa", "se permitieron dos reservas activas");
  } catch (e) {
    ok(`doble reserva activa bloqueada  [${e.message.slice(0, 40)}]`);
  }
  await expectOk("Anguita reserva un segundo deseo", anguita, () =>
    db.query(
      `insert into public.gift_reservations (wishlist_item_id, item_owner_id, reserver_id)
       values ($1, $2, $3)`,
      [otherItem, bianca, anguita],
    ),
  );
}

// Cancelar libera el hueco.
await expectOk("Anguita cancela su reserva", anguita, () =>
  db.query("update public.gift_reservations set cancelled_at = now() where id = $1", [resId]),
);
await expectOk("tras cancelar se puede volver a reservar", anguita, () =>
  db.query(
    `insert into public.gift_reservations (wishlist_item_id, item_owner_id, reserver_id)
     values ($1, $2, $3)`,
    [itemB, bianca, anguita],
  ),
);

console.log("\n== fugas indirectas ==");
{
  // Si el borrado del deseo fallara (FK RESTRICT), Bianca deduciria la reserva.
  const r = await as(bianca, () =>
    db.query("delete from public.wishlist_items where id = $1", [itemB]),
  );
  if (r.affectedRows === 1) ok("Bianca borra su deseo reservado sin error (cascade, no leak)");
  else fail("FUGA: borrado", `afectadas ${r.affectedRows}`);
  const left = await db.query(
    "select count(*)::int as n from public.gift_reservations where wishlist_item_id = $1",
    [itemB],
  );
  if (left.rows[0].n === 0) ok("las reservas del deseo se borran en cascada");
  else fail("cascade de reservas", JSON.stringify(left.rows));
}
{
  // Borrar la ocasion no debe arrastrar los deseos.
  const before = await db.query("select count(*)::int as n from public.wishlist_items");
  await as(bianca, () => db.query("delete from public.occasions where id = $1", [occB]));
  const after = await db.query(
    "select count(*)::int as n, count(occasion_id)::int as con_ocasion from public.wishlist_items",
  );
  if (after.rows[0].n === before.rows[0].n && after.rows[0].con_ocasion === 0)
    ok("borrar la ocasion anula occasion_id sin borrar los deseos");
  else fail("on delete set null (occasion_id)", JSON.stringify(after.rows));
}
{
  // Ninguna vista debe exponer gift_reservations.
  const r = await db.query(`
    select table_name from information_schema.views where table_schema = 'public'
  `);
  if (r.rows.length === 0) ok("no hay vistas en public que puedan saltarse RLS");
  else fail("vistas en public", JSON.stringify(r.rows));
}
{
  // Toda tabla de public con RLS activada.
  const r = await db.query(`
    select relname from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity
  `);
  if (r.rows.length === 0) ok("todas las tablas de public tienen RLS activada");
  else fail("tablas sin RLS", JSON.stringify(r.rows.map((x) => x.relname)));
}
{
  // Toda tabla con RLS debe tener al menos una politica.
  const r = await db.query(`
    select c.relname from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r' and c.relrowsecurity
      and not exists (select 1 from pg_policy p where p.polrelid = c.oid)
  `);
  if (r.rows.length === 0) ok("ninguna tabla con RLS se ha quedado sin politicas");
  else fail("tablas con RLS y sin politicas", JSON.stringify(r.rows.map((x) => x.relname)));
}
{
  // Ninguna funcion SECURITY DEFINER sin search_path fijado.
  const r = await db.query(`
    select p.proname from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.prosecdef
      and (p.proconfig is null or not exists (
        select 1 from unnest(p.proconfig) cfg where cfg like 'search_path=%'
      ))
  `);
  if (r.rows.length === 0) ok("toda funcion SECURITY DEFINER fija search_path");
  else fail("SECURITY DEFINER sin search_path", JSON.stringify(r.rows.map((x) => x.proname)));
}
{
  // anon no debe poder ejecutar las RPC de emparejamiento.
  const r = await db.query(`
    select p.proname from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in ('create_couple','create_couple_invitation','redeem_couple_invitation',
                        'current_couple_id','partner_id')
      and has_function_privilege('anon', p.oid, 'execute')
  `);
  if (r.rows.length === 0) ok("anon no puede ejecutar ninguna RPC de emparejamiento");
  else fail("RPC accesibles a anon", JSON.stringify(r.rows.map((x) => x.proname)));
}

console.log(`\n${pass} comprobaciones ok, ${failures.length} fallos`);
if (failures.length) {
  console.log("\nFALLOS:");
  for (const f of failures) console.log(" - " + f);
  process.exit(1);
}
