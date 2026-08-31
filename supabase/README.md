# Base de datos

Migraciones SQL versionadas en `migrations/`, aplicadas con la CLI de Supabase.

- Nombre de fichero: `<timestamp>_<descripcion>.sql` (`npx supabase migration new <nombre>`).
- Toda tabla nueva se crea con `alter table ... enable row level security;` y sus
  políticas en la misma migración. Nunca en una posterior.
- Tras cambiar el esquema, regenerar tipos:
  `npx supabase gen types typescript --project-id <ref> > ../src/types/database.ts`

## Modelo

```
auth.users ──1:1── profiles
                     │
                     ├── couple_members ──→ couples ──→ couple_invitations
                     │      (unique user_id, slot 1|2)      │
                     │                                       └── shared_wishlist_items
                     ├── occasions ──┐
                     └── wishlist_items ──← gift_reservations
```

- **La wishlist personal no es una tabla**: es el conjunto de `wishlist_items`
  con un `owner_id` dado. Una tabla `wishlists` intermedia no aportaría ningún
  atributo propio y añadiría un join a cada consulta.
- **`couple_members.member_slot`** (1 ó 2) con `unique (couple_id, member_slot)`
  limita cada pareja a dos miembros de forma declarativa, sin trigger.
  `unique (user_id)` impide pertenecer a dos parejas.
- **`gift_reservations.item_owner_id`** está denormalizado y atado por una FK
  compuesta a `wishlist_items (id, owner_id)`. Permite que las políticas RLS
  comprueben la propiedad del deseo sin subconsultar `wishlist_items`, y
  garantiza que nunca se desincroniza.

## El secreto de las reservas

El dueño de un deseo no debe poder saber que está reservado. Se apoya en cuatro
decisiones, todas verificadas por el banco de pruebas:

1. `gift_reservations` sólo tiene política de `SELECT` para `reserver_id = auth.uid()`.
   El dueño obtiene cero filas siempre: en `select`, en `count(*)`, en `exists`
   y en cualquier join desde su propia wishlist.
2. **Nada se denormaliza sobre `wishlist_items`.** No existe un `is_reserved`, ni
   un `updated_at` que se toque al reservar: el deseo no cambia al reservarse.
3. La FK de `gift_reservations` hacia el deseo es **`on delete cascade`**. Con
   `restrict`, el dueño deduciría la reserva al fallarle el borrado de su deseo.
4. El dueño **no puede sondear el índice único parcial**: no puede insertar
   reservas sobre sus propios deseos (la política de `INSERT` exige
   `item_owner_id = partner_id()`), así que nunca ve una violación de unicidad
   que delatase una reserva existente.

No hay vistas en `public`: una vista sin `security_invoker = true` se ejecuta con
los permisos de su propietario y se saltaría estas políticas.

## Pruebas

```bash
npm run test:db
```

Levanta un Postgres 18 real en WASM (PGlite, sin Docker), simula el entorno de
Supabase (esquema `auth`, `auth.uid()`, roles `anon`/`authenticated` y sus grants
por defecto), aplica todas las migraciones en orden y ejecuta 79 comprobaciones
de permisos con cuatro usuarios en dos parejas distintas.

Ejecutarlo tras **cualquier** cambio en `migrations/`, y añadir casos al añadir
tablas o políticas.
