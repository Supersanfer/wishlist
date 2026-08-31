-- =============================================================================
-- Esquema inicial: parejas, wishlists personales, wishlist conjunta,
-- ocasiones y reservas de regalos (privadas para quien reserva).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Tipos
-- -----------------------------------------------------------------------------

create type public.wish_priority as enum ('low', 'medium', 'high');
create type public.reservation_status as enum ('reserved', 'purchased');

-- -----------------------------------------------------------------------------
-- Utilidades
-- -----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $fn$
begin
  new.updated_at := now();
  return new;
end;
$fn$;

-- -----------------------------------------------------------------------------
-- profiles
-- -----------------------------------------------------------------------------

create table public.profiles (
  id           uuid        primary key references auth.users (id) on delete cascade,
  display_name text        not null check (length(btrim(display_name)) between 1 and 80),
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.profiles is 'Datos de cada usuario visibles para su pareja. 1:1 con auth.users.';

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Alta automática del perfil al registrarse.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $fn$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''),
      split_part(coalesce(new.email, 'usuario'), '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$fn$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- couples / couple_members
-- -----------------------------------------------------------------------------

create table public.couples (
  id         uuid        primary key default gen_random_uuid(),
  created_by uuid        references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger couples_set_updated_at
  before update on public.couples
  for each row execute function public.set_updated_at();

create table public.couple_members (
  couple_id   uuid        not null references public.couples (id) on delete cascade,
  user_id     uuid        not null references public.profiles (id) on delete cascade,
  member_slot smallint    not null check (member_slot in (1, 2)),
  joined_at   timestamptz not null default now(),

  primary key (couple_id, user_id),

  -- Un usuario pertenece como mucho a una pareja.
  constraint couple_members_user_unique unique (user_id),

  -- Como mucho dos miembros por pareja, de forma declarativa.
  constraint couple_members_slot_unique unique (couple_id, member_slot)
);

comment on constraint couple_members_slot_unique on public.couple_members is
  'Junto al check de member_slot, limita cada pareja a dos miembros como maximo.';

-- -----------------------------------------------------------------------------
-- Helpers de pertenencia. SECURITY DEFINER para poder usarse dentro de las
-- politicas RLS de couple_members sin provocar recursion infinita.
-- -----------------------------------------------------------------------------

create or replace function public.current_couple_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $fn$
  select cm.couple_id
  from public.couple_members cm
  where cm.user_id = (select auth.uid());
$fn$;

create or replace function public.partner_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $fn$
  select cm.user_id
  from public.couple_members cm
  where cm.couple_id = public.current_couple_id()
    and cm.user_id <> (select auth.uid());
$fn$;

-- -----------------------------------------------------------------------------
-- couple_invitations
-- -----------------------------------------------------------------------------

create table public.couple_invitations (
  id          uuid        primary key default gen_random_uuid(),
  couple_id   uuid        not null references public.couples (id) on delete cascade,
  code        text        not null unique check (code ~ '^[0-9a-f]{32}$'),
  created_by  uuid        not null references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default now() + interval '7 days',
  revoked_at  timestamptz,
  redeemed_at timestamptz,
  redeemed_by uuid        references public.profiles (id) on delete set null,

  constraint couple_invitations_redeem_coherent
    check ((redeemed_at is null) = (redeemed_by is null)),
  constraint couple_invitations_expiry_after_creation
    check (expires_at > created_at)
);

comment on table public.couple_invitations is
  'Invitaciones de un solo uso. El codigo solo es legible por los miembros de la pareja.';

-- Como mucho una invitacion pendiente por pareja.
create unique index couple_invitations_one_pending_per_couple
  on public.couple_invitations (couple_id)
  where redeemed_at is null and revoked_at is null;

create index couple_invitations_couple_id_idx on public.couple_invitations (couple_id);

-- -----------------------------------------------------------------------------
-- occasions
-- -----------------------------------------------------------------------------

create table public.occasions (
  id            uuid        primary key default gen_random_uuid(),
  owner_id      uuid        not null references public.profiles (id) on delete cascade,
  name          text        not null check (length(btrim(name)) between 1 and 80),
  occasion_date date        not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  -- Necesario para la clave foranea compuesta desde wishlist_items.
  constraint occasions_id_owner_unique unique (id, owner_id)
);

create index occasions_owner_date_idx on public.occasions (owner_id, occasion_date);

create trigger occasions_set_updated_at
  before update on public.occasions
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- wishlist_items
--
-- La wishlist personal es el conjunto de items de un owner: una tabla
-- `wishlists` intermedia no aportaria ningun atributo propio.
-- -----------------------------------------------------------------------------

create table public.wishlist_items (
  id          uuid        primary key default gen_random_uuid(),
  owner_id    uuid        not null references public.profiles (id) on delete cascade,
  occasion_id uuid,
  title       text        not null check (length(btrim(title)) between 1 and 200),
  description text        check (length(description) <= 2000),
  url         text        check (url is null or url ~* '^https?://'),
  image_url   text        check (image_url is null or image_url ~* '^https?://'),
  price_cents integer     check (price_cents is null or price_cents >= 0),
  currency    char(3)     not null default 'EUR' check (currency ~ '^[A-Z]{3}$'),
  priority    public.wish_priority not null default 'medium',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  -- Necesario para la clave foranea compuesta desde gift_reservations.
  constraint wishlist_items_id_owner_unique unique (id, owner_id),

  -- Una ocasion solo puede asociarse a items de su propio dueno.
  constraint wishlist_items_occasion_same_owner
    foreign key (occasion_id, owner_id)
    references public.occasions (id, owner_id)
    on delete set null (occasion_id)
);

comment on constraint wishlist_items_occasion_same_owner on public.wishlist_items is
  'Impide asociar un deseo a una ocasion de la pareja. Al borrar la ocasion solo se anula occasion_id.';

create index wishlist_items_owner_id_idx on public.wishlist_items (owner_id);
create index wishlist_items_occasion_id_idx on public.wishlist_items (occasion_id)
  where occasion_id is not null;

create trigger wishlist_items_set_updated_at
  before update on public.wishlist_items
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- shared_wishlist_items (wishlist conjunta, ligada a la pareja)
-- -----------------------------------------------------------------------------

create table public.shared_wishlist_items (
  id          uuid        primary key default gen_random_uuid(),
  couple_id   uuid        not null references public.couples (id) on delete cascade,
  created_by  uuid        references public.profiles (id) on delete set null,
  title       text        not null check (length(btrim(title)) between 1 and 200),
  description text        check (length(description) <= 2000),
  url         text        check (url is null or url ~* '^https?://'),
  image_url   text        check (image_url is null or image_url ~* '^https?://'),
  price_cents integer     check (price_cents is null or price_cents >= 0),
  currency    char(3)     not null default 'EUR' check (currency ~ '^[A-Z]{3}$'),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index shared_wishlist_items_couple_id_idx on public.shared_wishlist_items (couple_id);

create trigger shared_wishlist_items_set_updated_at
  before update on public.shared_wishlist_items
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- gift_reservations
--
-- `item_owner_id` esta denormalizado a proposito: permite que las politicas RLS
-- comprueben la propiedad del deseo sin subconsultar wishlist_items, y la FK
-- compuesta garantiza que siempre coincide con el owner real del deseo.
-- -----------------------------------------------------------------------------

create table public.gift_reservations (
  id               uuid        primary key default gen_random_uuid(),
  wishlist_item_id uuid        not null,
  item_owner_id    uuid        not null,
  reserver_id      uuid        not null references public.profiles (id) on delete cascade,
  status           public.reservation_status not null default 'reserved',
  purchased_at     timestamptz,
  cancelled_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  -- ON DELETE CASCADE es obligatorio: con RESTRICT, el dueno del deseo
  -- descubriria la reserva al fallarle el borrado de su propio deseo.
  constraint gift_reservations_item_fk
    foreign key (wishlist_item_id, item_owner_id)
    references public.wishlist_items (id, owner_id)
    on delete cascade,

  constraint gift_reservations_not_self check (reserver_id <> item_owner_id),
  constraint gift_reservations_status_coherent
    check ((status = 'purchased') = (purchased_at is not null))
);

comment on table public.gift_reservations is
  'Reservas de regalos. Solo visibles para quien las creo; el dueno del deseo nunca las ve.';

-- Como mucho una reserva activa por deseo.
create unique index gift_reservations_one_active_per_item
  on public.gift_reservations (wishlist_item_id)
  where cancelled_at is null;

create index gift_reservations_reserver_idx on public.gift_reservations (reserver_id)
  where cancelled_at is null;

create trigger gift_reservations_set_updated_at
  before update on public.gift_reservations
  for each row execute function public.set_updated_at();

-- Impide reasignar una reserva a otro deseo o a otra persona tras crearla.
create or replace function public.gift_reservations_immutable_target()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $fn$
begin
  if new.wishlist_item_id <> old.wishlist_item_id
     or new.item_owner_id <> old.item_owner_id
     or new.reserver_id <> old.reserver_id then
    raise exception 'No se puede reasignar una reserva existente' using errcode = '42501';
  end if;
  return new;
end;
$fn$;

create trigger gift_reservations_immutable_target
  before update on public.gift_reservations
  for each row execute function public.gift_reservations_immutable_target();

-- -----------------------------------------------------------------------------
-- RPCs de emparejamiento. SECURITY DEFINER porque couples y couple_members no
-- admiten DML directo: crear pareja y canjear invitacion deben ser atomicos y
-- pasar por estas validaciones.
-- -----------------------------------------------------------------------------

create or replace function public.create_couple()
returns uuid
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  v_user   uuid := (select auth.uid());
  v_couple uuid;
begin
  if v_user is null then
    raise exception 'Autenticacion requerida' using errcode = '42501';
  end if;

  if exists (select 1 from public.couple_members where user_id = v_user) then
    raise exception 'Ya perteneces a una pareja' using errcode = '42501';
  end if;

  insert into public.couples (created_by) values (v_user) returning id into v_couple;
  insert into public.couple_members (couple_id, user_id, member_slot)
  values (v_couple, v_user, 1);

  return v_couple;
end;
$fn$;

create or replace function public.create_couple_invitation()
returns public.couple_invitations
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  v_user   uuid := (select auth.uid());
  v_couple uuid := public.current_couple_id();
  v_inv    public.couple_invitations;
begin
  if v_user is null then
    raise exception 'Autenticacion requerida' using errcode = '42501';
  end if;

  if v_couple is null then
    raise exception 'No perteneces a ninguna pareja' using errcode = '42501';
  end if;

  if (select count(*) from public.couple_members where couple_id = v_couple) >= 2 then
    raise exception 'La pareja ya esta completa' using errcode = '42501';
  end if;

  -- Una invitacion nueva invalida la anterior pendiente.
  update public.couple_invitations
  set revoked_at = now()
  where couple_id = v_couple and redeemed_at is null and revoked_at is null;

  insert into public.couple_invitations (couple_id, code, created_by)
  values (v_couple, encode(uuid_send(gen_random_uuid()), 'hex'), v_user)
  returning * into v_inv;

  return v_inv;
end;
$fn$;

create or replace function public.redeem_couple_invitation(p_code text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  v_user uuid := (select auth.uid());
  v_inv  public.couple_invitations;
begin
  if v_user is null then
    raise exception 'Autenticacion requerida' using errcode = '42501';
  end if;

  if exists (select 1 from public.couple_members where user_id = v_user) then
    raise exception 'Ya perteneces a una pareja' using errcode = '42501';
  end if;

  select * into v_inv
  from public.couple_invitations
  where code = p_code
    and redeemed_at is null
    and revoked_at is null
    and expires_at > now()
  for update;

  if not found then
    raise exception 'Invitacion no valida o caducada' using errcode = '42501';
  end if;

  if (select count(*) from public.couple_members where couple_id = v_inv.couple_id) >= 2 then
    raise exception 'La pareja ya esta completa' using errcode = '42501';
  end if;

  insert into public.couple_members (couple_id, user_id, member_slot)
  values (v_inv.couple_id, v_user, 2);

  update public.couple_invitations
  set redeemed_at = now(), redeemed_by = v_user
  where id = v_inv.id;

  return v_inv.couple_id;
end;
$fn$;
