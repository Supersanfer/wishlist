# Wishlist

Una lista privada para dos: apunta lo que te hace ilusión y reserva su regalo
sin que la otra persona se entere.

## Qué es

Regalar bien es difícil por dos motivos opuestos. Si no preguntas, aciertas poco.
Si preguntas, pierdes la sorpresa.

Wishlist resuelve las dos mitades a la vez. Cada miembro de la pareja mantiene su
propia lista de deseos, y ve la de la otra persona. Cuando eliges qué regalar, lo
reservas — y **esa reserva es invisible para el dueño del deseo**. Él sigue viendo
su lista exactamente igual que antes, sin marcas, sin contadores y sin errores que
delaten nada. No es que la interfaz lo esconda: la base de datos no se lo cuenta.

Está pensada para dos personas concretas, no para escalar. Por eso no tiene
amigos, ni feed, ni recomendaciones, ni notificaciones.

## Funcionalidades

- **Wishlist personal** — nombre, precio, enlace, prioridad, ocasión e imagen.
- **Wishlist de la pareja** — en solo lectura; es donde eliges el regalo.
- **Reservas privadas** — reservar, cancelar y marcar como comprado, siempre en
  secreto para quien recibe.
- **Wishlist conjunta** — viajes, planes y cosas para casa, sin propietario.
- **Ocasiones** — cumpleaños, aniversarios y fechas señaladas, con la cuenta
  atrás y compartidas con la pareja como contexto.
- **Perfil** — nombre editable; el email es de solo lectura.
- **PWA** — instalable, con salida offline propia.

## Capturas

_Pendientes._ La aplicación es privada y las capturas requieren datos reales;
se añadirán con contenido de ejemplo.

## Stack

Next.js 16 (App Router, Server Components y Server Actions) · React 19 ·
TypeScript · Tailwind CSS v4 · Supabase (PostgreSQL, Auth y RLS) · Vercel.

Sin librería de componentes, sin librería de iconos y sin librería de PWA: la
iconografía son SVG propios y el service worker son 80 líneas.

## Seguridad

La autorización vive en Postgres, no en React. El filtrado en cliente es
presentación; lo que decide quién ve qué son las políticas de Row Level Security.

- **Supabase Auth** con email y contraseña. La sesión se refresca en `src/proxy.ts`
  y la identidad se comprueba siempre con `getUser()`, que valida el JWT, nunca
  con `getSession()`.
- **RLS activa en las ocho tablas**, definida en la misma migración que las crea.
- **Las reservas son secretas** y se apoyan en cuatro decisiones, no en una:
  `gift_reservations` solo tiene política de lectura para quien reserva; nada de
  su estado se denormaliza sobre el deseo; la clave foránea es `on delete cascade`
  para que borrar un deseo reservado no falle y delate la reserva; y el dueño no
  puede insertar reservas sobre sus propios deseos, así que nunca ve la violación
  de unicidad que revelaría una existente. No hay vistas en `public`, que se
  saltarían las políticas.
- **La `service_role` no existe en este repositorio.** La aplicación entera
  funciona con la clave pública; si algún día hiciera falta, sería solo en
  servidor y jamás en el cliente.

Detalle del modelo y del razonamiento: [`supabase/README.md`](supabase/README.md).

## Desarrollo

```bash
git clone https://github.com/Supersanfer/wishlist.git
cd wishlist
npm install
cp .env.example .env.local   # rellenar con los datos del proyecto Supabase
npm run dev
```

Hacen falta dos variables, ambas públicas, de Supabase → Project Settings → API:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

El arranque falla a propósito si falta alguna, en lugar de romper en la primera
petición.

Aplicar el esquema a un proyecto Supabase nuevo:

```bash
npx supabase link --project-ref <ref>
npx supabase db push
```

### Comandos

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Comprobación de tipos |
| `npm run test:db` | 79 comprobaciones de RLS sobre Postgres real (PGlite, sin Docker) |
| `npm run test:e2e` | Recorrido completo en un navegador real (crea usuarios de prueba) |

`test:db` levanta Postgres 17 en WebAssembly, simula el entorno de Supabase
(esquema `auth`, `auth.uid()`, roles `anon`/`authenticated`), aplica las
migraciones y comprueba los permisos con cuatro usuarios en dos parejas. No
necesita Docker ni conexión.

## Deploy

Vercel detecta Next.js sin configuración. Antes del primer despliegue hay que dar
de alta las dos variables de entorno en Settings → Environment Variables, y en
Supabase apuntar Site URL y Redirect URLs (`https://<dominio>/**`) al dominio de
Vercel, o el enlace de confirmación de correo no vuelve a la aplicación.

## Roadmap

- Subida de imágenes desde el móvil con Supabase Storage, en lugar de pegar una URL.
- Recuperación de contraseña (requiere SMTP propio).

## Licencia

Sin licencia. Todos los derechos reservados.
