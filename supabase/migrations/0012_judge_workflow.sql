-- Judge lifecycle: sign up -> apply to judge a specific competition ->
-- admin schedules one interview slot -> admin approves (which grants real
-- access via a judge_assignments row) or rejects. judge_assignments and
-- scores already had the right shape for "already-approved" access; this
-- migration adds the missing application/interview workflow, plus judge
-- visibility into who they're actually scoring (registrations/students/
-- teams/team_members had zero judge-read policies until now).

-- judges only ever had an admin-write policy (`judges_admin_write`), so a
-- freshly signed-up judge could never insert their own row — the same
-- chicken-and-egg gap 0003 already had to fix for schools. Self-insert only
-- (no self-update — bio edits and everything else about the row stay
-- admin-controlled, matching the existing policy's intent).
create policy "judges_self_insert" on judges for insert
  with check (profile_id = auth.uid());

create type judge_application_status as enum ('pending', 'interview_scheduled', 'approved', 'rejected');
create type interview_mode as enum ('online', 'physical');

create table judge_applications (
  id uuid primary key default gen_random_uuid(),
  judge_id uuid not null references judges(id) on delete cascade,
  competition_id uuid not null references competitions(id) on delete cascade,
  status judge_application_status not null default 'pending',
  interview_mode interview_mode,
  interview_at timestamptz,
  interview_location text, -- physical address, or an online meeting link
  admin_notes text,
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (judge_id, competition_id)
);

alter table judge_applications enable row level security;

create policy "judge_applications_self_or_admin_read" on judge_applications for select
  using (is_admin() or exists (select 1 from judges j where j.id = judge_id and j.profile_id = auth.uid()));
create policy "judge_applications_self_insert" on judge_applications for insert
  with check (exists (select 1 from judges j where j.id = judge_id and j.profile_id = auth.uid()));
create policy "judge_applications_admin_write" on judge_applications for update using (is_admin());
create policy "judge_applications_admin_delete" on judge_applications for delete using (is_admin());

-- ---------------------------------------------------------------------------
-- Judge visibility into who they're scoring. Additive only: every policy
-- below is a new SELECT policy on a table whose existing SELECT policies are
-- OR'd together in Postgres RLS, so nothing already granted changes.
-- security-definer helpers (not inline correlated subqueries referencing
-- each other) to avoid the exact recursion bugs 0005-0008 already had to fix
-- for teams/team_members.
-- ---------------------------------------------------------------------------

create or replace function judge_has_competition_access(p_competition_slug text) returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from judge_assignments ja
    join judges j on j.id = ja.judge_id
    join competitions c on c.id = ja.competition_id
    where j.profile_id = auth.uid() and c.slug = p_competition_slug
  );
$$;

create or replace function judge_can_view_student(p_student_id uuid) returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from registrations r
    where r.student_id = p_student_id and judge_has_competition_access(r.competition_slug)
  );
$$;

create or replace function judge_can_view_team(p_team_id uuid) returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from registrations r
    where r.team_id = p_team_id and judge_has_competition_access(r.competition_slug)
  );
$$;

create policy "registrations_judge_read" on registrations for select
  using (judge_has_competition_access(competition_slug));
create policy "students_judge_read" on students for select
  using (judge_can_view_student(id));
create policy "teams_judge_read" on teams for select
  using (judge_can_view_team(id));
create policy "team_members_judge_read" on team_members for select
  using (judge_can_view_team(team_id));
