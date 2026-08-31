# Wishlist

App web privada de wishlist para parejas. Mobile-first, instalable como PWA.

Stack: Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Supabase
(PostgreSQL + Auth + RLS) · Vercel.

## Puesta en marcha

```bash
cp .env.example .env.local   # rellenar con los datos del proyecto Supabase
npm run dev
```

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Comprobación de tipos |

## Despliegue en Vercel

1. Importar el repositorio. Vercel detecta Next.js solo; no hace falta tocar los
   comandos de build.
2. **Antes del primer despliegue**, dar de alta en Settings > Environment
   Variables las dos variables de `.env.example`, en Production, Preview y
   Development. El build falla a proposito si falta alguna
   (ver `src/lib/env.ts`): mejor romper el build que desplegar una app que
   revienta en la primera peticion.
3. En Supabase, Authentication > URL Configuration: poner el dominio de Vercel
   como Site URL y añadirlo a Redirect URLs como `https://<dominio>/**`, o el
   enlace de confirmacion de correo no volvera a la app.

Convenciones y reglas del proyecto: ver `CLAUDE.md`.
Esquema y migraciones: ver `supabase/README.md`.
