-- Two additions to competitions, both driven by the home page's
-- "Explore Competitions" section.
--
-- 1. pathway — which of the four participation routes a competition belongs
--    to, matching the Route 1 cards in "Ways to Participate". This is what the
--    directory's category filter narrows by.
--
-- 2. image_url — a picture per competition, shown on its card. Uploaded
--    through the admin console into the public competition-images bucket; the
--    column just holds the resulting public URL, so an externally hosted image
--    works too.
--
-- Both are nullable: a competition with neither still lists and still renders,
-- it simply falls back to a generated placeholder and stays out of the
-- pathway filter.
--
-- Every statement is safe to re-run, so a partially applied attempt can simply
-- be run again.

do $$ begin
  create type competition_pathway as enum (
    'applied_skills',
    'independent_submission',
    'project_showcase',
    'live_response'
  );
exception when duplicate_object then null;
end $$;

alter table competitions
  add column if not exists pathway competition_pathway,
  add column if not exists image_url text;

-- Filtering the directory by pathway is the whole point of the column.
create index if not exists competitions_pathway_idx on competitions (pathway);

-- Competition artwork is public, same as manuals and winner photos. If
-- storage.buckets isn't writable from the SQL editor on your project, create
-- the bucket named competition-images via the Storage UI as a Public bucket
-- and skip these statements.
insert into storage.buckets (id, name, public)
values ('competition-images', 'competition-images', true)
on conflict (id) do nothing;

drop policy if exists "competition_images_bucket_public_read" on storage.objects;
create policy "competition_images_bucket_public_read" on storage.objects
  for select using (bucket_id = 'competition-images');
