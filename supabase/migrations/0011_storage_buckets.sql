-- Storage for the admin portal's file uploads: manual PDFs, resource media
-- (images/embedded-video thumbnails), and winner photos. All three are
-- meant to be publicly viewable/downloadable content per the spec, so the
-- buckets are public and only carry a public-read policy — writes go
-- exclusively through the service-role client (createAdminClient(), see
-- data/supabase/admin.ts and domain/storage/actions.ts), which bypasses
-- storage RLS entirely, so no admin-write policy is needed here.
--
-- If the migration runner lacks privilege on the `storage` schema in your
-- Supabase project, create these three buckets via the dashboard's Storage
-- UI instead (Public bucket, same names) and apply the read policies there.

insert into storage.buckets (id, name, public)
values
  ('manuals', 'manuals', true),
  ('resources', 'resources', true),
  ('winner-photos', 'winner-photos', true)
on conflict (id) do nothing;

create policy "manuals_bucket_public_read" on storage.objects for select using (bucket_id = 'manuals');
create policy "resources_bucket_public_read" on storage.objects for select using (bucket_id = 'resources');
create policy "winner_photos_bucket_public_read" on storage.objects for select using (bucket_id = 'winner-photos');
