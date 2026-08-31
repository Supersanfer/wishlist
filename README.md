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

Convenciones y reglas del proyecto: ver `CLAUDE.md`.
Esquema y migraciones: ver `supabase/README.md`.
