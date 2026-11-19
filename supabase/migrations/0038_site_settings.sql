-- 0038_site_settings.sql
-- Global site-wide feature controls and settings managed from the superadmin dashboard.

create table if not exists site_settings (
  id smallint primary key default 1 check (id = 1),
  hide_download_manuals boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Seed singleton row if not already present
insert into site_settings (id, hide_download_manuals)
values (1, false)
on conflict (id) do nothing;

alter table site_settings enable row level security;

-- Public can read site settings so frontend can evaluate feature toggles
drop policy if exists "site_settings_public_read" on site_settings;
create policy "site_settings_public_read" on site_settings
  for select using (true);

-- Admins can update site settings
drop policy if exists "site_settings_admin_write" on site_settings;
create policy "site_settings_admin_write" on site_settings
  for all using (is_admin());

comment on table site_settings is
  'Singleton row (id = 1). Global site flags such as hide_download_manuals.';
