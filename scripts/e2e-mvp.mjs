/**
 * Recorrido completo del MVP con dos usuarios emparejados, en un navegador real.
 * Sin dependencias: pilota Edge por CDP con el WebSocket nativo de Node.
 *
 *   npm run build && npx next start -p 3126
 *   node --env-file=.env.local scripts/e2e-mvp.mjs http://localhost:3126
 *
 * CUIDADO: crea dos usuarios reales (wishlist-e2e-<timestamp>-*@example.com) en
 * el proyecto Supabase y no puede borrarlos, porque eso exige service_role.
 * Borralos a mano desde Authentication > Users al terminar.
 *
 * El navegador se toma de BROWSER_PATH si esta definida.
 */
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const BASE = process.argv[2] ?? "http://localhost:3126";
const URL_SB = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const PASSWORD = "wishlist-e2e-2026";
const stamp = Date.now();

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

async function api(pathname, { token, body, method = "POST" } = {}) {
  const res = await fetch(`${URL_SB}${pathname}`, {
    method,
    headers: {
      apikey: KEY,
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  return { status: res.status, json: text ? JSON.parse(text) : null };
}

console.log("== preparar pareja via API ==");
async function signUp(name) {
  const email = `wishlist-e2e-${stamp}-${name}@example.com`;
  const r = await api("/auth/v1/signup", {
    body: { email, password: PASSWORD, data: { display_name: name } },
  });
  if (!r.json?.access_token) throw new Error(`registro de ${name}: ${JSON.stringify(r.json)}`);
  return { email, token: r.json.access_token, name };
}

const alba = await signUp("Alba");
const bruno = await signUp("Bruno");
ok("dos cuentas creadas");

const couple = await api("/rest/v1/rpc/create_couple", { token: alba.token });
check("Alba crea pareja", couple.status === 200, JSON.stringify(couple.json));
const invite = await api("/rest/v1/rpc/create_couple_invitation", { token: alba.token });
const code = invite.json?.code;
check("invitacion generada", Boolean(code), JSON.stringify(invite.json));
const redeem = await api("/rest/v1/rpc/redeem_couple_invitation", {
  token: bruno.token,
  body: { p_code: code },
});
check("Bruno acepta la invitacion", redeem.status === 200, JSON.stringify(redeem.json));

// ---------------------------------------------------------------------------
// Navegador
// ---------------------------------------------------------------------------
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9444;
const profile = mkdtempSync(path.join(tmpdir(), "cdp-"));
const edge = spawn(
  EDGE,
  [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-gpu",
    "about:blank",
  ],
  { stdio: "ignore" },
);

let wsUrl;
for (let i = 0; i < 60; i++) {
  try {
    const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
    if (r.ok) {
      wsUrl = (await r.json()).webSocketDebuggerUrl;
      break;
    }
  } catch {}
  await new Promise((r) => setTimeout(r, 500));
}
const ws = new WebSocket(wsUrl);
await new Promise((res, rej) => {
  ws.onopen = res;
  ws.onerror = rej;
});

let nextId = 1;
const pending = new Map();
ws.onmessage = (m) => {
  const msg = JSON.parse(m.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(new Error(JSON.stringify(msg.error)));
    else resolve(msg.result);
  }
};
const send = (method, params = {}, sessionId) =>
  new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params, sessionId }));
  });

/** Cada persona usa su propio contexto: cookies aisladas, como dos moviles. */
async function newSession() {
  const { browserContextId } = await send("Target.createBrowserContext");
  const { targetId } = await send("Target.createTarget", { url: "about:blank", browserContextId });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  const S = (m, p) => send(m, p, sessionId);
  await S("Page.enable");
  await S("Runtime.enable");

  const evaluate = async (expression) => {
    const r = await S("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
    return r.result.value;
  };

  const goto = async (url) => {
    await S("Page.navigate", { url });
    for (let i = 0; i < 80; i++) {
      const href = await evaluate("document.readyState === 'complete' ? location.href : null");
      if (href) return href;
      await new Promise((x) => setTimeout(x, 250));
    }
    throw new Error("timeout " + url);
  };

  /**
   * Espera a que la pantalla se asiente tras una accion. Ignora los estados de
   * carga: si no, se comprobaria el esqueleto en vez del contenido real.
   */
  const settle = async (predicate) => {
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 500));
      const snap = JSON.parse(
        await evaluate(`JSON.stringify({
          url: location.href,
          text: document.body.innerText,
          alert: document.querySelector('[role=alert]')?.textContent ?? null
        })`),
      );
      if (snap.text.includes("Cargando")) continue;
      if (predicate(snap)) return snap;
    }
    return JSON.parse(
      await evaluate(`JSON.stringify({
        url: location.href,
        text: document.body.innerText,
        alert: document.querySelector('[role=alert]')?.textContent ?? null
      })`),
    );
  };

  return { evaluate, goto, settle };
}

/**
 * El formulario lo maneja React: pulsar antes de que hidrate no hace nada. En
 * produccion la hidratacion tarda mas que en local, asi que se reintenta.
 */
async function login(session, user) {
  await session.goto(`${BASE}/login`);

  const fill = `(() => {
    const set = (sel, v) => {
      const el = document.querySelector(sel);
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, v);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    };
    set('input[name=email]', ${JSON.stringify(user.email)});
    set('input[name=password]', ${JSON.stringify(PASSWORD)});
    document.querySelector('form button[type=submit]').click();
    return true;
  })()`;

  for (let attempt = 0; attempt < 4; attempt++) {
    await new Promise((r) => setTimeout(r, 1200));
    await session.evaluate(fill);

    const snap = await session.settle((s) => !s.url.endsWith("/login") || Boolean(s.alert));
    if (!snap.url.endsWith("/login")) return snap;
    if (snap.alert) return snap;
  }

  return session.settle(() => true);
}

console.log("\n== Alba: login y wishlist personal ==");
const a = await newSession();
const afterLogin = await login(a, alba);
check("Alba entra y aterriza en /wishlist", afterLogin.url.endsWith("/wishlist"), afterLogin.url);
check("estado vacio de la wishlist", afterLogin.text.includes("Tu lista está en blanco"), "");

await a.goto(`${BASE}/occasions/new`);
await a.evaluate(`(() => {
  const set = (sel, v) => {
    const el = document.querySelector(sel);
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  };
  set('input[name=name]', 'Mi cumpleaños');
  set('input[name=occasion_date]', '2026-11-02');
  document.querySelector('form button[type=submit]').click();
})()`);
const occ = await a.settle((s) => s.url.includes("/occasions?"));
check("Alba crea una ocasion", occ.text.includes("Mi cumpleaños"), occ.text.slice(0, 120));

await a.goto(`${BASE}/wishlist/new`);
await a.evaluate(`(() => {
  const set = (sel, v) => {
    const el = document.querySelector(sel);
    const proto = el.tagName === 'SELECT' ? HTMLSelectElement.prototype
      : el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  };
  set('input[name=title]', 'AirPods Pro');
  set('textarea[name=description]', 'Los blancos');
  set('input[name=price]', '199.00');
  set('input[name=url]', 'https://example.com/airpods');
  set('select[name=priority]', 'high');
  const occ = document.querySelector('select[name=occasion_id]');
  if (occ.options.length > 1) set('select[name=occasion_id]', occ.options[1].value);
  document.querySelector('form button[type=submit]').click();
})()`);
const created = await a.settle((s) => s.url.includes("/wishlist?"));
check("Alba crea un deseo", created.text.includes("AirPods Pro"), created.text.slice(0, 160));
check("la tarjeta muestra precio", created.text.includes("199"), created.text.slice(0, 160));
check("la tarjeta muestra la ocasion", created.text.includes("Mi cumpleaños"), created.text.slice(0, 200));

console.log("\n== Bruno: ve la lista de Alba y reserva ==");
const b = await newSession();
await login(b, bruno);
const partnerView = await b.goto(`${BASE}/partner`).then(() =>
  b.settle((s) => s.text.includes("AirPods") || s.text.includes("todavía no")),
);
check("Bruno ve la wishlist de Alba", partnerView.text.includes("AirPods Pro"), partnerView.text.slice(0, 160));
check("la cabecera nombra a Alba", partnerView.text.includes("Alba"), partnerView.text.slice(0, 80));
check("hay boton de reservar", partnerView.text.includes("Reservar"), "");

await b.evaluate(`[...document.querySelectorAll('button')].find(x => x.textContent.trim() === 'Reservar').click()`);
const reserved = await b.settle((s) => /reservado por ti/i.test(s.text));
check("Bruno reserva el regalo", /reservado por ti/i.test(reserved.text), reserved.text.slice(0, 200));

console.log("\n== el secreto se mantiene ==");
const albaAfter = await a.goto(`${BASE}/wishlist`).then(() => a.settle(() => true));
check(
  "Alba NO ve rastro de la reserva en su lista",
  !/reservad|comprad|Reservado/i.test(albaAfter.text),
  albaAfter.text.slice(0, 200),
);
const albaApi = await api(`/rest/v1/gift_reservations?select=*`, {
  token: alba.token,
  method: "GET",
});
check("la API tampoco le devuelve reservas", Array.isArray(albaApi.json) && albaApi.json.length === 0, JSON.stringify(albaApi.json));
const brunoApi = await api(`/rest/v1/gift_reservations?select=*`, {
  token: bruno.token,
  method: "GET",
});
check("Bruno si ve la suya", Array.isArray(brunoApi.json) && brunoApi.json.length === 1, JSON.stringify(brunoApi.json));

console.log("\n== filtro y compra ==");
const filtered = await b.goto(`${BASE}/partner?filtro=mios`).then(() => b.settle(() => true));
check("el filtro muestra lo reservado", filtered.text.includes("AirPods Pro"), filtered.text.slice(0, 160));

await b.evaluate(`[...document.querySelectorAll('button')].find(x => x.textContent.trim() === 'Comprado').click()`);
await new Promise((r) => setTimeout(r, 400));
await b.evaluate(`[...document.querySelectorAll('button')].find(x => x.textContent.trim() === 'Sí').click()`);
const purchased = await b.settle((s) => /comprado por ti/i.test(s.text));
check("Bruno marca el regalo como comprado", /comprado por ti/i.test(purchased.text), purchased.text.slice(0, 200));

const albaAfter2 = await a.goto(`${BASE}/wishlist`).then(() => a.settle(() => true));
check(
  "Alba sigue sin ver nada tras la compra",
  !/reservad|comprad/i.test(albaAfter2.text),
  albaAfter2.text.slice(0, 200),
);

console.log("\n== lista conjunta ==");
await a.goto(`${BASE}/shared/new`);
await a.evaluate(`(() => {
  const el = document.querySelector('input[name=title]');
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, 'Viaje a Japón');
  el.dispatchEvent(new Event('input', { bubbles: true }));
  document.querySelector('form button[type=submit]').click();
})()`);
const shared = await a.settle((s) => s.url.includes("/shared?"));
check("Alba crea un elemento conjunto", shared.text.includes("Viaje a Japón"), shared.text.slice(0, 160));

const brunoShared = await b.goto(`${BASE}/shared`).then(() => b.settle(() => true));
check("Bruno ve la lista conjunta", brunoShared.text.includes("Viaje a Japón"), brunoShared.text.slice(0, 160));

console.log("\n== ocasiones de la pareja y perfil ==");
const brunoOcc = await b.goto(`${BASE}/occasions`).then(() => b.settle(() => true));
check("Bruno ve la ocasion de Alba como contexto", brunoOcc.text.includes("Mi cumpleaños"), brunoOcc.text.slice(0, 200));

const mePage = await b.goto(`${BASE}/me`).then(() => b.settle(() => true));
check("/me muestra nombre y pareja", mePage.text.includes("Bruno") && mePage.text.includes("Alba"), mePage.text.slice(0, 200));
check("/me muestra el email", mePage.text.toLowerCase().includes(bruno.email.toLowerCase()), mePage.text.slice(0, 250));

console.log("\n== navegacion inferior ==");
const nav = await a.goto(`${BASE}/wishlist`).then(() => a.settle(() => true));
check(
  "la barra tiene los cuatro destinos",
  ["Mi lista", "Su lista", "Juntos", "Yo"].every((l) => nav.text.includes(l)),
  nav.text.slice(-120),
);
const navActive = await a.evaluate(
  `document.querySelector('nav[aria-label=Secciones] a[aria-current=page]')?.textContent ?? null`,
);
check("marca la seccion activa", (navActive ?? "").includes("Mi lista"), String(navActive));

console.log(`\n${pass} comprobaciones ok, ${failures.length} fallos`);
console.log(`\nUsuarios de prueba creados:\n  ${alba.email}\n  ${bruno.email}`);
if (failures.length) {
  console.log("\nFALLOS:");
  for (const f of failures) console.log(" - " + f);
}
ws.close();
edge.kill();
process.exit(failures.length ? 1 : 0);
