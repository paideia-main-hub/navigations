-- Work submissions for the Independent Submission competitions (InquiryQuest,
-- CultureScript, Message for Humanity): the student uploads their entry from
-- the dashboard, and an admin reviews and scores it against the competition's
-- published rubric.
--
-- One submission per registration. `answers` holds the typed fields and
-- `files` the uploaded files (storage paths), both keyed by the field ids
-- defined in domain/submissions/config.ts. `scores` holds the admin's mark per
-- rubric criterion; `total_score` is their sum.
--
-- Safe to re-run.

do $$ begin
  create type submission_status as enum ('draft', 'submitted', 'scored');
exception when duplicate_object then null;
end $$;

create table if not exists work_submissions (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null unique references registrations(id) on delete cascade,
  competition_slug text not null,
  submitted_by uuid not null references profiles(id),
  answers jsonb not null default '{}',
  files jsonb not null default '{}',
  status submission_status not null default 'draft',
  submitted_at timestamptz,
  scores jsonb not null default '{}',
  total_score numeric,
  max_score numeric,
  feedback text,
  reviewed_by uuid,                         -- the admin who scored it (no FK: admin sessions are separate from student profiles)
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists work_submissions_competition_idx on work_submissions (competition_slug, status);

alter table work_submissions enable row level security;

-- The student reads their own submissions (including the score and feedback
-- once reviewed). Admins use the service-role client, which bypasses RLS.
drop policy if exists "work_submissions_owner_select" on work_submissions;
create policy "work_submissions_owner_select" on work_submissions
  for select using (submitted_by = auth.uid());

drop policy if exists "work_submissions_owner_insert" on work_submissions;
create policy "work_submissions_owner_insert" on work_submissions
  for insert with check (submitted_by = auth.uid() and status <> 'scored');

-- Editable until it has been scored.
drop policy if exists "work_submissions_owner_update" on work_submissions;
create policy "work_submissions_owner_update" on work_submissions
  for update using (submitted_by = auth.uid() and status <> 'scored')
  with check (submitted_by = auth.uid() and status <> 'scored');

-- Private bucket for the entry files. Students upload straight from the
-- browser into a folder named after their own user id, so large videos never
-- pass through the app server; admins open files through signed URLs.
insert into storage.buckets (id, name, public, file_size_limit)
values ('work-submissions', 'work-submissions', false, 52428800)
on conflict (id) do update set file_size_limit = excluded.file_size_limit;

drop policy if exists "work_submissions_files_owner_insert" on storage.objects;
create policy "work_submissions_files_owner_insert" on storage.objects for insert
  with check (bucket_id = 'work-submissions' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "work_submissions_files_owner_read" on storage.objects;
create policy "work_submissions_files_owner_read" on storage.objects for select
  using (bucket_id = 'work-submissions' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "work_submissions_files_owner_delete" on storage.objects;
create policy "work_submissions_files_owner_delete" on storage.objects for delete
  using (bucket_id = 'work-submissions' and (storage.foldername(name))[1] = auth.uid()::text);
