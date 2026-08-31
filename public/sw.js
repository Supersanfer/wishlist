// Service worker mínimo: hace instalable la PWA y da una salida digna sin red.
// No cachea nada de Supabase: son datos privados y con sesión.
const CACHE = "wishlist-shell-v2";
const OFFLINE_URL = "/offline";

// Último recurso si ni siquiera el fallback está en caché. Sin esto,
// respondWith() recibiría undefined y el navegador enseñaría su propio error.
const BARE_OFFLINE = `<!doctype html><html lang="es"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Sin conexión</title>
<style>body{margin:0;min-height:100dvh;display:grid;place-content:center;text-align:center;
padding:2rem;background:#fbf7f1;color:#221d1a;font:15px/1.5 system-ui,sans-serif}
h1{font:500 24px/1.3 Georgia,serif;margin:0 0 .5rem}p{margin:0;color:#6b6058;max-width:28ch}
@media(prefers-color-scheme:dark){body{background:#131110;color:#f2ebe3}p{color:#a2968c}}</style>
<h1>Sin conexión</h1><p>Tu wishlist vive en la nube. Vuelve a intentarlo cuando tengas red.</p>`;

/** Guarda la página offline junto con las hojas de estilo que necesita. */
async function precacheOffline() {
  const cache = await caches.open(CACHE);
  const response = await fetch(OFFLINE_URL, { cache: "reload" });
  const html = await response.clone().text();

  const styles = [...html.matchAll(/href="(\/_next\/static\/[^"]+\.css)"/g)].map((m) => m[1]);

  await cache.put(OFFLINE_URL, response);
  await Promise.all(
    styles.map((href) => cache.add(href).catch(() => {})),
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(precacheOffline().catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Los estáticos del build se guardan según se usan, para que la página
  // offline conserve sus estilos aunque cambie el hash con cada despliegue.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ??
          fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
            return response;
          }),
      ),
    );
    return;
  }

  if (request.mode !== "navigate") return;

  event.respondWith(
    fetch(request).catch(async () => {
      const cached = await caches.match(OFFLINE_URL);
      return (
        cached ??
        new Response(BARE_OFFLINE, { headers: { "Content-Type": "text/html; charset=utf-8" } })
      );
    }),
  );
});
