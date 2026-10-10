-- Public bucket for a school coordinator's avatar, shown in the header
-- and on the dashboard. Writes go through the service-role client.
-- Apply in the Supabase SQL editor if the bucket was not created already.

insert into storage.buckets (id, name, public)
values ('profile-avatars', 'profile-avatars', true)
on conflict (id) do nothing;

drop policy if exists "profile_avatars_bucket_public_read" on storage.objects;
create policy "profile_avatars_bucket_public_read" on storage.objects for select
  using (bucket_id = 'profile-avatars');
