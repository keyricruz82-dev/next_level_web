-- Next Level Producciones admin schema
-- Run this in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.publicaciones (
    id uuid primary key default gen_random_uuid(),
    titulo text not null,
    descripcion text not null,
    imagen_url text,
    fecha_evento timestamptz not null,
    fecha_creacion timestamptz not null default now(),
    estado text not null default 'inactivo',
    constraint publicaciones_titulo_not_empty check (btrim(titulo) <> ''),
    constraint publicaciones_descripcion_not_empty check (btrim(descripcion) <> ''),
    constraint publicaciones_estado_check check (estado in ('activo', 'inactivo'))
);

create index if not exists publicaciones_estado_fecha_evento_idx
    on public.publicaciones (estado, fecha_evento desc);

create index if not exists publicaciones_fecha_creacion_idx
    on public.publicaciones (fecha_creacion desc);

create table if not exists public.site_media (
    id uuid primary key default gen_random_uuid(),
    section text not null check (section in ('curated_grid', 'promo_banner')),
    position integer not null check (position between 1 and 4),
    image_url text not null,
    storage_path text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique(section, position)
);

create index if not exists site_media_section_position_idx
    on public.site_media (section, position);

create index if not exists site_media_updated_at_idx
    on public.site_media (updated_at desc);

alter table public.site_media enable row level security;

alter table public.publicaciones enable row level security;

drop policy if exists "Public can read active publicaciones" on public.publicaciones;
create policy "Public can read active publicaciones"
on public.publicaciones
for select
to anon
using (estado = 'activo');

drop policy if exists "Admin can read all publicaciones" on public.publicaciones;
create policy "Admin can read all publicaciones"
on public.publicaciones
for select
to authenticated
using ((auth.jwt() ->> 'email') = 'info@nextlevelproducciones.net');

drop policy if exists "Admin can insert publicaciones" on public.publicaciones;
create policy "Admin can insert publicaciones"
on public.publicaciones
for insert
to authenticated
with check ((auth.jwt() ->> 'email') = 'info@nextlevelproducciones.net');

drop policy if exists "Admin can update publicaciones" on public.publicaciones;
create policy "Admin can update publicaciones"
on public.publicaciones
for update
to authenticated
using ((auth.jwt() ->> 'email') = 'info@nextlevelproducciones.net')
with check ((auth.jwt() ->> 'email') = 'info@nextlevelproducciones.net');

drop policy if exists "Admin can delete publicaciones" on public.publicaciones;
create policy "Admin can delete publicaciones"
on public.publicaciones
for delete
to authenticated
using ((auth.jwt() ->> 'email') = 'info@nextlevelproducciones.net');

insert into storage.buckets (id, name, public)
values ('publicaciones', 'publicaciones', true)
on conflict (id) do nothing;

drop policy if exists "Public can read publication images" on storage.objects;
create policy "Public can read publication images"
on storage.objects
for select
to public
using (bucket_id = 'publicaciones');

drop policy if exists "Admin can upload publication images" on storage.objects;
create policy "Admin can upload publication images"
on storage.objects
for insert
to authenticated
with check (
    bucket_id = 'publicaciones'
    and (auth.jwt() ->> 'email') = 'info@nextlevelproducciones.net'
);

drop policy if exists "Admin can update publication images" on storage.objects;
create policy "Admin can update publication images"
on storage.objects
for update
to authenticated
using (
    bucket_id = 'publicaciones'
    and (auth.jwt() ->> 'email') = 'info@nextlevelproducciones.net'
)
with check (
    bucket_id = 'publicaciones'
    and (auth.jwt() ->> 'email') = 'info@nextlevelproducciones.net'
);

drop policy if exists "Admin can delete publication images" on storage.objects;
create policy "Admin can delete publication images"
on storage.objects
for delete
to authenticated
using (
    bucket_id = 'publicaciones'
    and (auth.jwt() ->> 'email') = 'info@nextlevelproducciones.net'
);

-- Policies for site image metadata

drop policy if exists "Public can read site media" on public.site_media;
create policy "Public can read site media"
on public.site_media
for select
to anon
using (true);

drop policy if exists "Admin can manage site media" on public.site_media;
create policy "Admin can manage site media"
on public.site_media
for all
to authenticated
using ((auth.jwt() ->> 'email') = 'info@nextlevelproducciones.net')
with check ((auth.jwt() ->> 'email') = 'info@nextlevelproducciones.net');
