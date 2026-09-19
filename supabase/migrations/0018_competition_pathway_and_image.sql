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

create type competition_pathway as enum (
  'applied_skills',
  'independent_submission',
  'project_showcase',
  'live_response'
);

alter table competitions
  add column pathway competition_pathway,
  add column image_url text;

-- Filtering the directory by pathway is the whole point of the column.
create index competitions_pathway_idx on competitions (pathway);

-- Competition artwork is public, same as manuals and winner photos. If
-- storage.buckets isn't writable from the SQL editor on your project, create
-- the bucket named competition-images via the Storage UI as a Public bucket
-- and skip these two statements.
insert into storage.buckets (id, name, public)
values ('competition-images', 'competition-images', true)
on conflict (id) do nothing;

create policy "competition_images_bucket_public_read" on storage.objects
  for select using (bucket_id = 'competition-images');
