-- Fixes a chicken-and-egg RLS bug: signUpSchool() inserts a school row and
-- immediately reads it back (to get its id for the school_coordinators
-- insert that follows), but the SELECT policy only allowed admins or an
-- *already-linked* coordinator — which doesn't exist yet at that point.
-- Postgres re-checks the SELECT policy on any row returned via RETURNING,
-- so the insert itself succeeded but reporting it back failed, surfacing as
-- "new row violates row-level security policy for table schools".

alter table schools add column if not exists created_by uuid references profiles(id);

drop policy if exists "schools_coordinator_read" on schools;
create policy "schools_coordinator_read" on schools for select
  using (
    is_admin()
    or created_by = auth.uid()
    or exists (
      select 1 from school_coordinators sc
      where sc.school_id = schools.id and sc.profile_id = auth.uid()
    )
  );

drop policy if exists "schools_coordinator_update" on schools;
create policy "schools_coordinator_update" on schools for update
  using (
    is_admin()
    or created_by = auth.uid()
    or exists (
      select 1 from school_coordinators sc
      where sc.school_id = schools.id and sc.profile_id = auth.uid()
    )
  );
