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

alter table public.inicio_web_styles
    add column if not exists background_color_1 text;

alter table public.inicio_web_styles
    add column if not exists background_color_2 text;

alter table public.inicio_web_styles
    drop constraint if exists inicio_web_styles_background_color_1_hex;

alter table public.inicio_web_styles
    add constraint inicio_web_styles_background_color_1_hex
    check (
        background_color_1 is null or background_color_1 ~ '^#[0-9a-fA-F]{6}$'
    );

alter table public.inicio_web_styles
    drop constraint if exists inicio_web_styles_background_color_2_hex;

alter table public.inicio_web_styles
    add constraint inicio_web_styles_background_color_2_hex
    check (
        background_color_2 is null or background_color_2 ~ '^#[0-9a-fA-F]{6}$'
    );

create table if not exists public.quienes_somos_config (
    id uuid primary key default gen_random_uuid(),
    key text not null unique,
    value text not null default '',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.quienes_somos_testimonios (
    id uuid primary key default gen_random_uuid(),
    position integer not null unique check (position between 1 and 3),
    titulo text not null default '',
    nombre_ubicacion text not null default '',
    texto text not null default '',
    image_url text not null default '',
    is_visible boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.quienes_somos_config enable row level security;
alter table public.quienes_somos_testimonios enable row level security;

drop policy if exists "Public can read quienes_somos_config" on public.quienes_somos_config;
create policy "Public can read quienes_somos_config"
on public.quienes_somos_config
for select
to anon
using (true);

drop policy if exists "Admin can manage quienes_somos_config" on public.quienes_somos_config;
create policy "Admin can manage quienes_somos_config"
on public.quienes_somos_config
for all
to authenticated
using ((auth.jwt() ->> 'email') = 'info@nextlevelproducciones.net')
with check ((auth.jwt() ->> 'email') = 'info@nextlevelproducciones.net');

drop policy if exists "Public can read quienes_somos_testimonios" on public.quienes_somos_testimonios;
create policy "Public can read quienes_somos_testimonios"
on public.quienes_somos_testimonios
for select
to anon
using (true);

drop policy if exists "Admin can manage quienes_somos_testimonios" on public.quienes_somos_testimonios;
create policy "Admin can manage quienes_somos_testimonios"
on public.quienes_somos_testimonios
for all
to authenticated
using ((auth.jwt() ->> 'email') = 'info@nextlevelproducciones.net')
with check ((auth.jwt() ->> 'email') = 'info@nextlevelproducciones.net');

insert into public.quienes_somos_config (key, value)
values
    ('expertise_subtitulo', 'Sobre Next Level'),
    ('expertise_titulo', 'Transformamos momentos en contenido con alma.'),
    ('expertise_parrafo_1', 'Next Level Producciones nace para capturar lo extraordinario de cada evento y convertirlo en una narrativa visual memorable. Combinamos técnica, sensibilidad y estilo para que cada proyecto se vea como una pieza única.'),
    ('expertise_parrafo_2', 'Nos especializamos en fotografía, video, producción creativa y experiencias visuales personalizadas para bodas, celebraciones, contenido corporativo y proyectos con identidad propia.'),
    ('about_kicker', 'Historia'),
    ('about_titulo', 'Nosotros no solo capturamos momentos: los convertimos en una narrativa visual.'),
    ('about_parrafo_1', 'En Next Level Producciones trabajamos con una mirada editorial, cuidando cada detalle para que cada proyecto tenga una atmósfera propia, una identidad clara y una sensación de exclusividad.'),
    ('about_parrafo_2', 'Desde bodas y celebraciones hasta contenido corporativo y proyectos creativos, combinamos técnica, sensibilidad y dirección visual para que tu historia se vea tan memorable como se siente.'),
    ('about_parrafo_3', 'Cada imagen es parte de una conversación más amplia: luz, emoción, ritmo y diseño. Esa es la diferencia de trabajar con un equipo que entiende la estética como una herramienta de comunicación.'),
    ('about_video_1', 'videos/video1.mp4'),
    ('about_video_2', 'videos/video2.mp4'),
    ('about_video_3', 'videos/video3.mp4'),
    ('about_banner_tag', 'Nuestra energía'),
    ('about_banner_titulo', 'Donde la creatividad visual se convierte en una experiencia memorable.'),
    ('about_banner_descripcion', 'Cada proyecto es una oportunidad para contar una historia con sensibilidad, precisión y un estilo que se mantiene fiel a tu marca y a tu momento más importante.')
on conflict (key) do update
set value = excluded.value,
    updated_at = now();

insert into public.quienes_somos_testimonios (position, titulo, nombre_ubicacion, texto, image_url, is_visible)
values
    (
        1,
        '15 años',
        'Naria | El Salvador',
        'Estamos muy felices y agradecidos por el resultado de nuestras fotografías. Desde el primer momento recibimos una atención excepcional y un ambiente lleno de confianza y profesionalismo. Cada toma refleja la pasión y el talento detrás de la cámara, logrando imágenes llenas de vida, elegancia y emoción. Gracias por convertir momentos especiales en recuerdos inolvidables.',
        'images/15a.jpeg',
        true
    ),
    (
        2,
        'Esposos',
        'Hector & Jennifer | El Salvador',
        'Queremos agradecer profundamente por el increíble trabajo realizado en nuestra sesión fotográfica. Cada imagen logró capturar emociones reales, momentos espontáneos y detalles que jamás olvidaremos. La dedicación, creatividad y profesionalismo hicieron que nos sintiéramos cómodos durante toda la experiencia. Sin duda, las fotografías superaron nuestras expectativas y hoy tenemos recuerdos que podremos conservar para siempre.',
        'images/U25.jpeg',
        true
    ),
    (
        3,
        'ESPOSOS',
        'Kristen & Daniel | El Salvador',
        'Estamos muy felices y agradecidos por el resultado de nuestras fotografías. Desde el primer momento recibimos una atención excepcional y un ambiente lleno de confianza y profesionalismo. Cada toma refleja la pasión y el talento detrás de la cámara, logrando imágenes llenas de vida, elegancia y emoción. Gracias por convertir momentos especiales en recuerdos inolvidables.',
        'images/2ULI01.jpeg',
        true
    )
on conflict (position) do update
set titulo = excluded.titulo,
    nombre_ubicacion = excluded.nombre_ubicacion,
    texto = excluded.texto,
    image_url = excluded.image_url,
    is_visible = excluded.is_visible,
    updated_at = now();
