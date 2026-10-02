-- Card artwork for award categories — same shape as competitions.image_url
-- (migration 0018). Uploaded via the admin awards editor into the public
-- award-images bucket; the column holds the resulting public URL.
--
-- Nullable: without an uploaded image the public awards cards keep using the
-- static files under /public/awards/{slug}.webp.

alter table award_categories
  add column if not exists image_url text;

insert into storage.buckets (id, name, public)
values ('award-images', 'award-images', true)
on conflict (id) do nothing;

drop policy if exists "award_images_bucket_public_read" on storage.objects;
create policy "award_images_bucket_public_read" on storage.objects
  for select using (bucket_id = 'award-images');
