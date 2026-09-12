-- Competitions are still content-managed as mock/hardcoded data in the app
-- (data/repositories/competitions.repository.ts) until the admin CMS exists
-- to manage them for real. Registrations need to record which competition
-- they're for regardless, so instead of a strict FK to a `competitions` row
-- that doesn't exist yet, we snapshot the slug + title at submission time —
-- a common, valid pattern (like an order snapshotting a product's name).
-- This can be swapped for a real FK once competitions move into the database.

alter table registrations
  alter column competition_id drop not null;

alter table registrations
  drop constraint if exists registrations_competition_id_fkey;

alter table registrations
  add column if not exists competition_slug text,
  add column if not exists competition_title text;

alter table registrations
  drop constraint if exists registrations_competition_ref_check;

alter table registrations
  add constraint registrations_competition_ref_check
  check (competition_id is not null or (competition_slug is not null and competition_title is not null));

-- The app supplies `category` from the eligibility check step, but make it
-- nullable as a safety net for any future flow that doesn't.
alter table registrations
  alter column category drop not null;

-- teams also had a NOT NULL FK to the not-yet-real competitions table.
alter table teams
  alter column competition_id drop not null;

alter table teams
  drop constraint if exists teams_competition_id_fkey;

-- ---------------------------------------------------------------------------
-- Independent (non-school) students registering solo can form an ad-hoc team
-- by typing teammate names, and a self-registering student is never a school
-- coordinator — so the existing "coordinator manages their school's roster"
-- policies don't cover these cases. These additions allow the specific,
-- narrow case of ownerless/schoolless rows created by any authenticated user,
-- without loosening access to real school-owned data.
-- ---------------------------------------------------------------------------

drop policy if exists "students_adhoc_insert" on students;
create policy "students_adhoc_insert" on students for insert
  with check (school_id is null and profile_id is null);

drop policy if exists "teams_independent_insert" on teams;
create policy "teams_independent_insert" on teams for insert
  with check (school_id is null);

drop policy if exists "team_members_independent_insert" on team_members;
create policy "team_members_independent_insert" on team_members for insert
  with check (exists (select 1 from teams t where t.id = team_id and t.school_id is null));
