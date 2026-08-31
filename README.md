# Wishlist

**Una lista privada para dos.** Apunta lo que te hace ilusión, mira lo que le
hace ilusión a tu pareja y reserva su regalo sin que se entere.

<p>
  <img src="docs/screenshots/wishlist.png" alt="Lista personal" width="30%">
  <img src="docs/screenshots/partner.png" alt="Lista de la pareja con un regalo reservado" width="30%">
  <img src="docs/screenshots/occasions.png" alt="Ocasiones" width="30%">
</p>

## El problema

Regalar bien es difícil por dos motivos opuestos. Si no preguntas, aciertas poco.
Si preguntas, pierdes la sorpresa.

Wishlist resuelve las dos mitades a la vez: cada persona mantiene su lista y ve la
de la otra, y cuando eliges qué regalar lo reservas **sin que quien lo recibe pueda
descubrirlo**. Su lista sigue exactamente igual que antes.

Está pensada para dos personas concretas, no para escalar. No tiene amigos, ni
feed, ni recomendaciones, ni notificaciones.

## Funcionalidades

- **Lista personal** — nombre, precio, enlace, prioridad, ocasión e imagen.
- **Lista de la pareja** — en solo lectura; es donde eliges el regalo.
- **Reservas privadas** — reservar, cancelar y marcar como comprado, en secreto.
- **Lista conjunta** — viajes, planes y cosas para casa, sin propietario.
- **Ocasiones** — cumpleaños y aniversarios, con cuenta atrás, compartidas con la
  pareja como contexto.
- **PWA** — instalable, con salida offline propia.

## Lo interesante: el secreto es del esquema, no de la interfaz

Esconder algo en React es trivial y no vale nada: basta abrir la pestaña de red.
Aquí el dueño de un deseo **no puede** ver sus reservas porque la base de datos no
se las devuelve, y eso se apoya en cuatro decisiones que se sostienen entre sí:

1. `gift_reservations` tiene una única política de lectura, `reserver_id = auth.uid()`.
   El dueño obtiene cero filas en `select`, en `count(*)`, en `exists` y en
   cualquier `join` desde su propia lista.
2. **Nada se denormaliza sobre el deseo.** No hay `is_reserved`, y reservar no toca
   su `updated_at`: el deseo es idéntico byte a byte antes y después.
3. La clave foránea es `on delete cascade`. Con `restrict`, borrar un deseo
   reservado fallaría — y ese fallo, por sí solo, delataría la reserva.
4. El dueño **no puede sondear el índice único**: la política de inserción le
   impide reservar sus propios deseos, así que nunca ve la violación de unicidad
   que revelaría una reserva existente.

No hay vistas en `public`: una vista sin `security_invoker` se ejecutaría con los
permisos de su propietario y se saltaría todo lo anterior.

Las cuatro tienen su test. `npm run test:db` levanta un Postgres real y comprueba,
entre otras cosas, que el error que recibe el dueño al intentar cada vía es de
permisos y **no** un `duplicate key`.

## Stack

Next.js 16 (App Router, Server Components y Server Actions) · React 19 ·
TypeScript · Tailwind CSS v4 · Supabase (PostgreSQL, Auth y RLS) · Vercel.

Sin librería de componentes, de iconos, de animación ni de PWA. La iconografía
son trece SVG propios y el service worker son ochenta líneas. Las únicas
dependencias de producción son `next`, `react` y `@supabase/*`.

## Arquitectura

```
src/
├── app/
│   ├── (marketing)/     portada pública y privacidad
│   ├── (auth)/          login y registro
│   ├── (app)/           pantallas con sesión y pareja, con navegación inferior
│   └── actions/         Server Actions: la única vía de escritura
├── components/          kit de UI y sistema de diseño
├── lib/
│   ├── queries/         acceso a datos, centralizado
│   └── supabase/        clientes de navegador y de servidor
└── proxy.ts             refresco de sesión y protección de rutas
supabase/
├── migrations/          esquema y políticas RLS
└── tests/               banco de pruebas de permisos
```

La autorización vive en Postgres, no en React. El filtrado en cliente es
presentación; lo que decide quién ve qué son las políticas. La `service_role` no
existe en este repositorio: la aplicación entera funciona con la clave pública.

Detalle del modelo: [`supabase/README.md`](supabase/README.md).

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

## Tests

| Comando | Qué hace |
| --- | --- |
| `npm run test:db` | 79 comprobaciones de permisos sobre Postgres real |
| `npm run test:e2e` | 27 comprobaciones recorriendo la app en un navegador real |
| `npm run lint` · `npm run typecheck` · `npm run build` | Lo de siempre |

`test:db` levanta **Postgres 17 en WebAssembly** (PGlite), simula el entorno de
Supabase —esquema `auth`, `auth.uid()`, roles `anon` y `authenticated` con sus
grants por defecto—, aplica las migraciones y prueba los permisos con cuatro
usuarios repartidos en dos parejas. No necesita Docker, ni red, ni un proyecto
Supabase: corre en unos segundos y en CI.

`test:e2e` pilota un navegador real por CDP, sin dependencias, y recorre el
producto de punta a punta: registro, emparejamiento, alta de deseos, reserva y la
comprobación de que quien recibe no ve nada. Crea usuarios reales, así que se
lanza a propósito.

## Deploy

Vercel detecta Next.js sin configuración. Antes del primer despliegue hay que dar
de alta las dos variables de entorno, y en Supabase apuntar Site URL y Redirect
URLs (`https://<dominio>/**`) al dominio desplegado, o el enlace de confirmación
de correo no vuelve a la aplicación.

## Roadmap

- Subida de imágenes desde el móvil con Supabase Storage, en lugar de pegar una URL.
- Recuperación de contraseña (requiere SMTP propio).

## Licencia

[MIT](LICENSE).
