-- =============================================================================
-- Imagenes de deseos: bucket privado de Storage y columnas para guardar la ruta.
--
-- Se mantiene image_url para enlaces externos. Si image_path esta presente,
-- tiene prioridad; si no, se usa la URL externa.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- wishlist_items / shared_wishlist_items: ruta del objeto en Storage.
-- ---------------------------------------------------------------------------

alter table public.wishlist_items
  add column image_path text check (image_path is null or image_path <> '');

alter table public.shared_wishlist_items
  add column image_path text check (image_path is null or image_path <> '');

-- ---------------------------------------------------------------------------
-- Bucket y politicas de Storage. En entornos sin el esquema storage
-- (p. ej. tests locales con PGlite) este bloque se omite sin provocar error.
-- ---------------------------------------------------------------------------

do $$
begin
  -- Si no existe el esquema storage, salimos sin hacer nada.
  if not exists (select 1 from information_schema.schemata where schema_name = 'storage') then
    return;
  end if;

  insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values (
    'wishlist-images',
    'wishlist-images',
    false,
    5242880,                      -- 5 MiB
    array['image/jpeg', 'image/png', 'image/webp']
  );

  -- Lectura: los dos miembros de la pareja ven todo lo de su pareja.
  create policy "wishlist_images_select_own_couple"
    on storage.objects for select to authenticated
    using (
      bucket_id = 'wishlist-images'
      and (
        starts_with(name, 'wishlist/' || public.current_couple_id()::text || '/')
        or starts_with(name, 'shared/' || public.current_couple_id()::text || '/')
      )
    );

  -- Subida a deseos personales: solo el dueno, dentro de su pareja.
  create policy "wishlist_images_insert_own_wish"
    on storage.objects for insert to authenticated
    with check (
      bucket_id = 'wishlist-images'
      and starts_with(
        name,
        'wishlist/' || public.current_couple_id()::text || '/' || auth.uid()::text || '/'
      )
    );

  -- Subida a la lista compartida: cualquiera de los dos miembros de la pareja.
  create policy "wishlist_images_insert_shared"
    on storage.objects for insert to authenticated
    with check (
      bucket_id = 'wishlist-images'
      and starts_with(name, 'shared/' || public.current_couple_id()::text || '/')
    );

  -- Borrado: dueno de un deseo personal, o cualquiera de la pareja en la conjunta.
  create policy "wishlist_images_delete_own"
    on storage.objects for delete to authenticated
    using (
      bucket_id = 'wishlist-images'
      and (
        starts_with(
          name,
          'wishlist/' || public.current_couple_id()::text || '/' || auth.uid()::text || '/'
        )
        or starts_with(name, 'shared/' || public.current_couple_id()::text || '/')
      )
    );
exception
  when others then
    -- En tests locales sin Storage simplemente no se crean politicas.
    raise notice 'Storage no disponible: %', sqlerrm;
end $$;

-- No se permite update directo sobre objetos: se borra y se sube de nuevo.
