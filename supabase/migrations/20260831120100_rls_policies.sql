-- =============================================================================
-- Row Level Security.
--
-- Regla de lectura de este fichero: `auth.uid()` es siempre "yo",
-- `public.partner_id()` es el otro miembro de mi pareja (o null si no tengo),
-- y `public.current_couple_id()` es mi pareja (o null).
--
-- Invariante critico: el dueno de un deseo NUNCA puede observar una reserva
-- sobre ese deseo, ni directa ni indirectamente.
-- =============================================================================

alter table public.profiles              enable row level security;
alter table public.couples               enable row level security;
alter table public.couple_members        enable row level security;
alter table public.couple_invitations    enable row level security;
alter table public.occasions             enable row level security;
alter table public.wishlist_items        enable row level security;
alter table public.shared_wishlist_items enable row level security;
alter table public.gift_reservations     enable row level security;

-- No se usa FORCE ROW LEVEL SECURITY: las funciones SECURITY DEFINER de
-- emparejamiento se ejecutan como propietario de las tablas y deben poder
-- escribir en couples / couple_members, que no admiten DML directo.

-- -----------------------------------------------------------------------------
-- profiles: leo el mio y el de mi pareja; solo edito el mio.
-- -----------------------------------------------------------------------------

create policy profiles_select_self_or_partner on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or id = public.partner_id());

create policy profiles_insert_self on public.profiles
  for insert to authenticated
  with check (id = (select auth.uid()));

create policy profiles_update_self on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Sin politica de DELETE: el perfil se borra en cascada con auth.users.

-- -----------------------------------------------------------------------------
-- couples / couple_members: solo lectura, y solo de la pareja propia.
-- El alta pasa por create_couple() / redeem_couple_invitation().
-- -----------------------------------------------------------------------------

create policy couples_select_own on public.couples
  for select to authenticated
  using (id = public.current_couple_id());

create policy couple_members_select_own on public.couple_members
  for select to authenticated
  using (couple_id = public.current_couple_id());

-- -----------------------------------------------------------------------------
-- couple_invitations: el codigo solo lo ve mi pareja. Quien la canjea no
-- necesita leer la fila: redeem_couple_invitation() es SECURITY DEFINER.
-- -----------------------------------------------------------------------------

create policy couple_invitations_select_own_couple on public.couple_invitations
  for select to authenticated
  using (couple_id = public.current_couple_id());

create policy couple_invitations_delete_own_couple on public.couple_invitations
  for delete to authenticated
  using (couple_id = public.current_couple_id());

-- -----------------------------------------------------------------------------
-- occasions: mi pareja las ve (son el contexto de los regalos), pero solo yo
-- gestiono las mias.
-- -----------------------------------------------------------------------------

create policy occasions_select_self_or_partner on public.occasions
  for select to authenticated
  using (owner_id = (select auth.uid()) or owner_id = public.partner_id());

create policy occasions_insert_self on public.occasions
  for insert to authenticated
  with check (owner_id = (select auth.uid()));

create policy occasions_update_self on public.occasions
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy occasions_delete_self on public.occasions
  for delete to authenticated
  using (owner_id = (select auth.uid()));

-- -----------------------------------------------------------------------------
-- wishlist_items: leo la mia y la de mi pareja; solo escribo en la mia.
-- -----------------------------------------------------------------------------

create policy wishlist_items_select_self_or_partner on public.wishlist_items
  for select to authenticated
  using (owner_id = (select auth.uid()) or owner_id = public.partner_id());

create policy wishlist_items_insert_self on public.wishlist_items
  for insert to authenticated
  with check (owner_id = (select auth.uid()));

create policy wishlist_items_update_self on public.wishlist_items
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy wishlist_items_delete_self on public.wishlist_items
  for delete to authenticated
  using (owner_id = (select auth.uid()));

-- -----------------------------------------------------------------------------
-- shared_wishlist_items: ambos miembros gestionan la wishlist conjunta.
-- -----------------------------------------------------------------------------

create policy shared_wishlist_items_select_own_couple on public.shared_wishlist_items
  for select to authenticated
  using (couple_id = public.current_couple_id());

create policy shared_wishlist_items_insert_own_couple on public.shared_wishlist_items
  for insert to authenticated
  with check (
    couple_id = public.current_couple_id()
    and created_by = (select auth.uid())
  );

create policy shared_wishlist_items_update_own_couple on public.shared_wishlist_items
  for update to authenticated
  using (couple_id = public.current_couple_id())
  with check (couple_id = public.current_couple_id());

create policy shared_wishlist_items_delete_own_couple on public.shared_wishlist_items
  for delete to authenticated
  using (couple_id = public.current_couple_id());

-- -----------------------------------------------------------------------------
-- gift_reservations: el corazon del secreto.
--
-- SELECT esta restringido a reserver_id = yo. Como no hay ninguna otra
-- politica de SELECT sobre esta tabla, el dueno del deseo obtiene siempre cero
-- filas, incluido count(*). No existe vista ni funcion que exponga estas filas.
-- -----------------------------------------------------------------------------

create policy gift_reservations_select_own on public.gift_reservations
  for select to authenticated
  using (reserver_id = (select auth.uid()));

-- Solo puedo reservar deseos de mi pareja, y solo en mi nombre.
create policy gift_reservations_insert_own on public.gift_reservations
  for insert to authenticated
  with check (
    reserver_id = (select auth.uid())
    and item_owner_id = public.partner_id()
  );

create policy gift_reservations_update_own on public.gift_reservations
  for update to authenticated
  using (reserver_id = (select auth.uid()))
  with check (
    reserver_id = (select auth.uid())
    and item_owner_id = public.partner_id()
  );

create policy gift_reservations_delete_own on public.gift_reservations
  for delete to authenticated
  using (reserver_id = (select auth.uid()));

-- -----------------------------------------------------------------------------
-- Permisos de las funciones. anon no necesita ninguna de ellas.
-- -----------------------------------------------------------------------------

revoke all on function public.current_couple_id()               from public, anon;
revoke all on function public.partner_id()                      from public, anon;
revoke all on function public.create_couple()                   from public, anon;
revoke all on function public.create_couple_invitation()        from public, anon;
revoke all on function public.redeem_couple_invitation(text)    from public, anon;

grant execute on function public.current_couple_id()            to authenticated;
grant execute on function public.partner_id()                   to authenticated;
grant execute on function public.create_couple()                to authenticated;
grant execute on function public.create_couple_invitation()     to authenticated;
grant execute on function public.redeem_couple_invitation(text) to authenticated;
