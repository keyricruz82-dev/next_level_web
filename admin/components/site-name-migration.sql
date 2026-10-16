-- Agrega la clave site_name a site_config. Ejecutar manualmente en Supabase SQL Editor.
-- No elimina registros ni modifica las políticas RLS.
alter table public.site_config drop constraint if exists site_config_key_check;
alter table public.site_config add constraint site_config_key_check check (key in (
    'site_name',
    'social_instagram',
    'social_tiktok',
    'social_youtube',
    'social_facebook',
    'contact_email',
    'contact_whatsapp',
    'site_logo_url'
));

insert into public.site_config (key, value)
values ('site_name', 'Next Level Producciones')
on conflict (key) do nothing;
