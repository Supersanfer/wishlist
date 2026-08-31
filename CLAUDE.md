# Wishlist — reglas del proyecto

App web privada de wishlist para parejas. Next.js 16 (App Router) + TypeScript +
Tailwind v4 + Supabase (Postgres, Auth, RLS). PWA. Deploy en Vercel.

## Stack y límites

- Sin backend propio: todo pasa por Supabase. No añadir ORM, ni capa de API
  intermedia, ni librería de estado global.
- Dependencias: pedir antes de añadir cualquiera. Se resuelve con Next, React,
  Tailwind y `@supabase/*` salvo justificación explícita.
- PWA hecha a mano (`public/manifest.webmanifest` + `public/sw.js`). No usar
  `next-pwa` ni similares.

## Seguridad (no negociable)

- **RLS activada en toda tabla**, en la misma migración que la crea, junto con
  sus políticas. Una tabla sin RLS es un bug de seguridad, no una tarea pendiente.
- Las reservas de regalos son secretas para el dueño del deseo. Cuatro reglas
  que no se rompen (ver `supabase/README.md` antes de tocar `gift_reservations`):
  no denormalizar estado de reserva sobre `wishlist_items`; no crear vistas sin
  `security_invoker`; no añadir `gift_reservations` a la publicación de Realtime;
  y no consultar reservas desde la pantalla de la wishlist propia, ni siquiera
  sabiendo que RLS devolvería cero filas.
- La autorización vive en Postgres. El filtrado en cliente es UX, nunca seguridad.
- Sólo la `anon key` llega al navegador. La `service_role` no se usa en este
  repo; si algún día hace falta, sólo en Route Handler server-only.
- En servidor, la identidad se obtiene con `supabase.auth.getUser()`.
  Nunca con `getSession()` (no verifica el JWT).
- Nunca commitear `.env.local` ni claves reales.

## Convenciones de código

- Server Components por defecto. `"use client"` sólo en hojas que necesiten
  estado, efectos o eventos.
- Las consultas viven en `src/lib/queries/`, no repartidas por las páginas.
- Las rutas de la app con sesión y pareja van dentro del grupo `src/app/(app)/`,
  que aporta la barra de navegación inferior. `requirePairedUser()` es su puerta.
- Mutaciones vía Server Actions; Route Handlers sólo para webhooks y callbacks.
- Cliente Supabase: `@/lib/supabase/client` (browser) y `@/lib/supabase/server`
  (servidor, uno por request — no cachear en módulo). El refresco de sesión lo
  hace `src/proxy.ts`.
- Variables de entorno sólo a través de `@/lib/env`.
- `src/types/database.ts` es generado: no editarlo a mano.
- Imports con alias `@/`. Sin rutas relativas que suban de directorio.

## Next.js 16

- `middleware.ts` ya no existe: el fichero es `src/proxy.ts` y exporta `proxy`.
- Request APIs son async: `await cookies()`, `await headers()`, `await params`,
  `await searchParams`.
- Ante cualquier duda de API, consultar `node_modules/next/dist/docs/` antes de
  escribir código. La memoria sobre versiones previas de Next no aplica.

## UI

- Mobile-first estricto: diseñar a 375px y escalar hacia arriba con `sm:`/`md:`.
- Targets táctiles ≥ 44px. Respetar `env(safe-area-inset-*)`.
- Sólo utilidades Tailwind. Sin CSS-in-JS ni ficheros `.module.css`.

## Verificación

Antes de dar por terminado un cambio: `npm run lint`, `npx tsc --noEmit` y
`npm run build`.

- Si el cambio toca `supabase/migrations/`, además `npm run test:db` (banco de
  pruebas de RLS sobre Postgres real; añadir casos al añadir tablas o políticas).
- `npm run test:e2e` recorre el MVP entero en un navegador real. Crea dos
  usuarios de prueba en Supabase que hay que borrar a mano, así que se ejecuta
  a propósito, no en cada cambio.

@AGENTS.md
