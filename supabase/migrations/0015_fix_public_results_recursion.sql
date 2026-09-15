-- 0014 added a policy on `students` that subqueries `team_members`, whose
-- own existing policy (team_members_read, from 0001) subqueries back into
-- `students` — the exact class of RLS recursion bug 0005-0008 already fixed
-- for teams/team_members. Postgres raises "infinite recursion detected in
-- policy for relation students" (42P17) for ANY read of `students` once this
-- cycle exists, which is why even an unrelated student's own dashboard (no
-- team involvement at all) broke: the error isn't row-specific, it's
-- structural, and the read simply comes back empty everywhere it's touched.
--
-- Fix: replace the raw correlated subqueries from 0014 with
-- security-definer helper functions (same pattern as judge_can_view_student/
-- judge_can_view_team in 0012) — they run as the function owner, which
-- bypasses RLS on the tables they query internally, breaking the cycle.

drop policy if exists "students_public_read_when_published" on students;
drop policy if exists "registrations_public_read_when_published" on registrations;
drop policy if exists "teams_public_read_when_published" on teams;
drop policy if exists "team_members_public_read_when_published" on team_members;
drop policy if exists "schools_public_read_when_published" on schools;

create or replace function registration_has_published_result(p_registration_id uuid) returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from results r where r.registration_id = p_registration_id and r.is_published);
$$;

create or replace function student_has_published_result(p_student_id uuid) returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from registrations r
    where r.student_id = p_student_id and registration_has_published_result(r.id)
  ) or exists (
    select 1 from team_members tm join registrations r on r.team_id = tm.team_id
    where tm.student_id = p_student_id and registration_has_published_result(r.id)
  );
$$;

create or replace function team_has_published_result(p_team_id uuid) returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from registrations r where r.team_id = p_team_id and registration_has_published_result(r.id));
$$;

create or replace function school_has_published_result(p_school_id uuid) returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from registrations r where r.school_id = p_school_id and registration_has_published_result(r.id));
$$;

create policy "registrations_public_read_when_published" on registrations for select
  using (registration_has_published_result(id));

create policy "students_public_read_when_published" on students for select
  using (student_has_published_result(id));

create policy "teams_public_read_when_published" on teams for select
  using (team_has_published_result(id));

create policy "team_members_public_read_when_published" on team_members for select
  using (team_has_published_result(team_id));

create policy "schools_public_read_when_published" on schools for select
  using (school_has_published_result(id));
