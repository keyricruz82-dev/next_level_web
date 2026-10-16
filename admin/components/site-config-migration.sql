-- Configuración general del sitio. Ejecutar en Supabase SQL Editor.
create table if not exists public.site_config (
    id uuid primary key default gen_random_uuid(),
    key text not null unique check (key in (
        'social_instagram',
        'social_tiktok',
        'social_youtube',
        'social_facebook',
        'contact_email',
        'contact_whatsapp',
        'site_logo_url'
    )),
    value text not null default '',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.site_config enable row level security;

drop policy if exists "Public can read site config" on public.site_config;
create policy "Public can read site config"
on public.site_config
for select
to anon
using (true);

drop policy if exists "Admin can manage site config" on public.site_config;
create policy "Admin can manage site config"
on public.site_config
for all
to authenticated
using ((auth.jwt() ->> 'email') = 'info@nextlevelproducciones.net')
with check ((auth.jwt() ->> 'email') = 'info@nextlevelproducciones.net');

insert into public.site_config (key, value)
values
    ('social_instagram', 'https://www.instagram.com/nextlevelproducciones_?igsh=bDBrcGkyNmp5aXZk'),
    ('social_tiktok', 'https://www.tiktok.com/@nextlevelproducciones?_r=1&_t=ZS-95vGeT53f7P'),
    ('social_youtube', 'https://www.youtube.com/@NextLevelProducciones'),
    ('social_facebook', 'https://www.facebook.com/share/1CRGc8frAp/?mibextid=wwXIfr'),
    ('contact_email', 'info@nextlevelproducciones.net'),
    ('contact_whatsapp', '50377251450'),
    ('site_logo_url', 'images/next.jpeg')
on conflict (key) do nothing;
