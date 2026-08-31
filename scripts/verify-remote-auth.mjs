/**
 * Verificacion end-to-end de Auth + emparejamiento contra el proyecto Supabase
 * remoto, usando solo la anon key (nunca service_role).
 *
 *   node --env-file=.env.local scripts/verify-remote-auth.mjs
 *
 * CUIDADO: crea tres usuarios de prueba reales en el proyecto
 * (wishlist-verify-<timestamp>-*@example.com) y no puede borrarlos, porque eso
 * exige service_role. Borralos a mano desde Authentication > Users al terminar.
 * El prefijo `wishlist-verify-` los deja localizables con el buscador.
 *
 * Requiere que "Confirm email" este DESACTIVADO en el dashboard; con la
 * confirmacion activada el script no puede continuar y te lo dira.
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  process.exit(1);
}

const stamp = Date.now();

/**
 * Dominio de los usuarios de prueba. `example.com` esta reservado por la RFC
 * 2606 (nunca llega a nadie) y el validador de Supabase lo acepta; los TLD
 * `.test` / `.invalid` los rechaza con "Email address is invalid".
 */
const TEST_EMAIL_DOMAIN = "example.com";
const TEST_EMAIL_PREFIX = "wishlist-verify";
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
function check(name, condition, detail = "") {
  if (condition) ok(name);
  else fail(name, detail);
}

/** Cada persona usa su propio cliente, como si fuese un navegador distinto. */
function browser() {
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function signUp(client, name) {
  const email = `${TEST_EMAIL_PREFIX}-${stamp}-${name.toLowerCase()}@${TEST_EMAIL_DOMAIN}`;
  const { data, error } = await client.auth.signUp({
    email,
    password: "wishlist-verify-2026",
    options: { data: { display_name: name } },
  });
  if (error) {
    if (/rate limit/i.test(error.message)) {
      throw new Error(
        "Supabase ha agotado su limite de envio de correos. Solo intenta enviarlos " +
          "porque 'Confirm email' esta activado: desactivalo en Authentication > " +
          "Sign In / Providers > Email y vuelve a lanzar la verificacion.",
      );
    }
    throw new Error(`registro de ${name}: ${error.message}`);
  }
  if (!data.session) {
    throw new Error(
      "El proyecto exige confirmar el correo. Desactiva Authentication > Sign In / Providers > Email > Confirm email para poder ejecutar esta verificacion.",
    );
  }
  return { email, id: data.user.id };
}

console.log(`Proyecto: ${url}\n`);

console.log("== registro y perfil ==");
const anguita = browser();
const bianca = browser();
const carlos = browser();

const a = await signUp(anguita, "Anguita");
ok("registro de Anguita crea sesion");
const b = await signUp(bianca, "Bianca");
ok("registro de Bianca crea sesion");
const c = await signUp(carlos, "Carlos");
ok("registro de Carlos crea sesion");

{
  const { data, error } = await anguita.from("profiles").select("id, display_name");
  check(
    "el trigger crea el perfil con el nombre del registro",
    !error && data?.length === 1 && data[0].display_name === "Anguita",
    error?.message ?? JSON.stringify(data),
  );
}

console.log("\n== login y logout ==");
{
  const fresh = browser();
  const { error } = await fresh.auth.signInWithPassword({
    email: a.email,
    password: "wishlist-verify-2026",
  });
  check("login con credenciales correctas", !error, error?.message ?? "");

  const bad = await fresh.auth.signInWithPassword({
    email: a.email,
    password: "contrasena-incorrecta",
  });
  check("login con contraseña incorrecta falla", Boolean(bad.error), "no dio error");

  await fresh.auth.signOut();
  const { data } = await fresh.auth.getUser();
  check("logout deja la sesion vacia", data.user === null, "sigue habiendo usuario");
}

console.log("\n== crear pareja e invitar ==");
{
  const { error } = await anguita.rpc("create_couple");
  check("Anguita crea pareja", !error, error?.message ?? "");
}
{
  const { error } = await anguita.rpc("create_couple");
  check("no puede crear una segunda pareja", Boolean(error), "no dio error");
}

let code = null;
{
  const { data, error } = await anguita.rpc("create_couple_invitation");
  code = data?.code ?? null;
  check(
    "genera invitacion con codigo de 32 hex",
    !error && typeof code === "string" && /^[0-9a-f]{32}$/.test(code),
    error?.message ?? String(code),
  );
}
{
  const { data } = await carlos.from("couple_invitations").select("code");
  check("un tercero no ve la invitacion", data?.length === 0, JSON.stringify(data));
}

console.log("\n== aceptar invitacion ==");
{
  const { error } = await bianca.rpc("redeem_couple_invitation", { p_code: code });
  check("Bianca acepta la invitacion", !error, error?.message ?? "");
}
{
  const { error } = await carlos.rpc("redeem_couple_invitation", { p_code: code });
  check("la invitacion usada ya no sirve", Boolean(error), "no dio error");
}
{
  const { error } = await bianca.rpc("redeem_couple_invitation", { p_code: code });
  check("quien ya tiene pareja no puede unirse a otra", Boolean(error), "no dio error");
}
{
  const { error } = await carlos.rpc("redeem_couple_invitation", {
    p_code: "0".repeat(32),
  });
  check("un codigo inexistente falla", Boolean(error), "no dio error");
}
{
  const { error } = await anguita.rpc("create_couple_invitation");
  check("con la pareja completa no se generan invitaciones", Boolean(error), "no dio error");
}

console.log("\n== estado de emparejamiento ==");
{
  const { data } = await anguita.from("couple_members").select("couple_id, user_id");
  check("Anguita ve los dos miembros de su pareja", data?.length === 2, JSON.stringify(data));
}
{
  const { data } = await anguita.from("profiles").select("id, display_name");
  const names = (data ?? []).map((p) => p.display_name).sort();
  check(
    "ve su perfil y el de Bianca, y ninguno mas",
    names.length === 2 && names[0] === "Anguita" && names[1] === "Bianca",
    JSON.stringify(names),
  );
}
{
  const { data } = await carlos.from("couple_members").select("couple_id");
  check("Carlos sigue sin pareja", data?.length === 0, JSON.stringify(data));
}

console.log(`\n${pass} comprobaciones ok, ${failures.length} fallos`);
console.log(
  `\nUsuarios de prueba creados (borralos en Authentication > Users):\n  ${a.email}\n  ${b.email}\n  ${c.email}`,
);
if (failures.length) {
  console.log("\nFALLOS:");
  for (const f of failures) console.log(" - " + f);
  process.exit(1);
}
