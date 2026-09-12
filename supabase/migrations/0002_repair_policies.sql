-- Idempotent repair: re-asserts every RLS policy, helper function and the
-- new-user trigger from 0001_init_schema.sql. Safe to run even if some of
-- them already exist (each is dropped first) or never got created (the
-- likely cause of "new row violates row-level security policy" errors —
-- the original script probably hit an error partway through its policy
-- section and stopped before reaching later policies).

-- ---------------------------------------------------------------------------
-- Helper functions
-- ---------------------------------------------------------------------------

create or replace function auth_role() returns user_role
language sql stable security definer
set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function is_admin() returns boolean
language sql stable security definer
set search_path = public
as $$
  select coalesce((select role = 'admin' from profiles where id = auth.uid()), false);
$$;

-- ---------------------------------------------------------------------------
-- Ensure RLS is enabled everywhere (safe to re-run)
-- ---------------------------------------------------------------------------

alter table profiles enable row level security;
alter table schools enable row level security;
alter table school_coordinators enable row level security;
alter table students enable row level security;
alter table competitions enable row level security;
alter table competition_eligibility_rules enable row level security;
alter table competition_stages enable row level security;
alter table manuals enable row level security;
alter table resources enable row level security;
alter table rubrics enable row level security;
alter table judges enable row level security;
alter table judge_assignments enable row level security;
alter table teams enable row level security;
alter table team_members enable row level security;
alter table registrations enable row level security;
alter table consent_records enable row level security;
alter table scores enable row level security;
alter table announcements enable row level security;
alter table events enable row level security;
alter table results enable row level security;
alter table winner_media enable row level security;
alter table certificates enable row level security;
alter table audit_logs enable row level security;

-- ---------------------------------------------------------------------------
-- Policies (drop-then-create so this is safe to run repeatedly)
-- ---------------------------------------------------------------------------

drop policy if exists "profiles_select_own_or_admin" on profiles;
create policy "profiles_select_own_or_admin" on profiles for select
  using (id = auth.uid() or is_admin());
drop policy if exists "profiles_update_own_or_admin" on profiles;
create policy "profiles_update_own_or_admin" on profiles for update
  using (id = auth.uid() or is_admin());
drop policy if exists "profiles_admin_all" on profiles;
create policy "profiles_admin_all" on profiles for all
  using (is_admin());

drop policy if exists "competitions_public_read" on competitions;
create policy "competitions_public_read" on competitions for select using (true);
drop policy if exists "competitions_admin_write" on competitions;
create policy "competitions_admin_write" on competitions for insert with check (is_admin());
drop policy if exists "competitions_admin_update" on competitions;
create policy "competitions_admin_update" on competitions for update using (is_admin());
drop policy if exists "competitions_admin_delete" on competitions;
create policy "competitions_admin_delete" on competitions for delete using (is_admin());

drop policy if exists "eligibility_public_read" on competition_eligibility_rules;
create policy "eligibility_public_read" on competition_eligibility_rules for select using (true);
drop policy if exists "eligibility_admin_write" on competition_eligibility_rules;
create policy "eligibility_admin_write" on competition_eligibility_rules for all using (is_admin());

drop policy if exists "stages_public_read" on competition_stages;
create policy "stages_public_read" on competition_stages for select using (true);
drop policy if exists "stages_admin_write" on competition_stages;
create policy "stages_admin_write" on competition_stages for all using (is_admin());

drop policy if exists "manuals_public_read" on manuals;
create policy "manuals_public_read" on manuals for select using (true);
drop policy if exists "manuals_admin_write" on manuals;
create policy "manuals_admin_write" on manuals for all using (is_admin());

drop policy if exists "resources_public_read" on resources;
create policy "resources_public_read" on resources for select using (true);
drop policy if exists "resources_admin_write" on resources;
create policy "resources_admin_write" on resources for all using (is_admin());

drop policy if exists "rubrics_public_read" on rubrics;
create policy "rubrics_public_read" on rubrics for select using (is_public or is_admin());
drop policy if exists "rubrics_admin_write" on rubrics;
create policy "rubrics_admin_write" on rubrics for all using (is_admin());

drop policy if exists "announcements_public_read" on announcements;
create policy "announcements_public_read" on announcements for select using (true);
drop policy if exists "announcements_admin_write" on announcements;
create policy "announcements_admin_write" on announcements for all using (is_admin());

drop policy if exists "events_public_read" on events;
create policy "events_public_read" on events for select using (true);
drop policy if exists "events_admin_write" on events;
create policy "events_admin_write" on events for all using (is_admin());

drop policy if exists "results_public_read_published" on results;
create policy "results_public_read_published" on results for select
  using (is_published or is_admin());
drop policy if exists "results_admin_write" on results;
create policy "results_admin_write" on results for all using (is_admin());

drop policy if exists "winner_media_public_read" on winner_media;
create policy "winner_media_public_read" on winner_media for select
  using (
    consent_confirmed and exists (
      select 1 from results r where r.id = result_id and r.is_published
    ) or is_admin()
  );
drop policy if exists "winner_media_admin_write" on winner_media;
create policy "winner_media_admin_write" on winner_media for all using (is_admin());

drop policy if exists "schools_coordinator_read" on schools;
create policy "schools_coordinator_read" on schools for select
  using (
    is_admin() or exists (
      select 1 from school_coordinators sc
      where sc.school_id = schools.id and sc.profile_id = auth.uid()
    )
  );
drop policy if exists "schools_coordinator_update" on schools;
create policy "schools_coordinator_update" on schools for update
  using (
    is_admin() or exists (
      select 1 from school_coordinators sc
      where sc.school_id = schools.id and sc.profile_id = auth.uid()
    )
  );
drop policy if exists "schools_insert_self" on schools;
create policy "schools_insert_self" on schools for insert with check (true);
drop policy if exists "schools_admin_delete" on schools;
create policy "schools_admin_delete" on schools for delete using (is_admin());

drop policy if exists "school_coordinators_self_or_admin" on school_coordinators;
create policy "school_coordinators_self_or_admin" on school_coordinators for select
  using (profile_id = auth.uid() or is_admin());
drop policy if exists "school_coordinators_admin_write" on school_coordinators;
create policy "school_coordinators_admin_write" on school_coordinators for all using (is_admin());
drop policy if exists "school_coordinators_insert_self" on school_coordinators;
create policy "school_coordinators_insert_self" on school_coordinators for insert
  with check (profile_id = auth.uid());

drop policy if exists "students_owner_school_admin_read" on students;
create policy "students_owner_school_admin_read" on students for select
  using (
    profile_id = auth.uid() or is_admin() or exists (
      select 1 from school_coordinators sc
      where sc.school_id = students.school_id and sc.profile_id = auth.uid()
    )
  );
drop policy if exists "students_owner_school_admin_write" on students;
create policy "students_owner_school_admin_write" on students for all
  using (
    profile_id = auth.uid() or is_admin() or exists (
      select 1 from school_coordinators sc
      where sc.school_id = students.school_id and sc.profile_id = auth.uid()
    )
  );

drop policy if exists "judges_self_or_admin" on judges;
create policy "judges_self_or_admin" on judges for select
  using (profile_id = auth.uid() or is_admin());
drop policy if exists "judges_admin_write" on judges;
create policy "judges_admin_write" on judges for all using (is_admin());

drop policy if exists "judge_assignments_self_or_admin" on judge_assignments;
create policy "judge_assignments_self_or_admin" on judge_assignments for select
  using (
    is_admin() or exists (select 1 from judges j where j.id = judge_id and j.profile_id = auth.uid())
  );
drop policy if exists "judge_assignments_admin_write" on judge_assignments;
create policy "judge_assignments_admin_write" on judge_assignments for all using (is_admin());

drop policy if exists "teams_read" on teams;
create policy "teams_read" on teams for select
  using (
    is_admin() or exists (
      select 1 from school_coordinators sc where sc.school_id = teams.school_id and sc.profile_id = auth.uid()
    ) or exists (
      select 1 from team_members tm join students s on s.id = tm.student_id
      where tm.team_id = teams.id and s.profile_id = auth.uid()
    )
  );
drop policy if exists "teams_write" on teams;
create policy "teams_write" on teams for all
  using (
    is_admin() or exists (
      select 1 from school_coordinators sc where sc.school_id = teams.school_id and sc.profile_id = auth.uid()
    )
  );

drop policy if exists "team_members_read" on team_members;
create policy "team_members_read" on team_members for select
  using (
    is_admin() or exists (
      select 1 from teams t join school_coordinators sc on sc.school_id = t.school_id
      where t.id = team_id and sc.profile_id = auth.uid()
    ) or exists (
      select 1 from students s where s.id = student_id and s.profile_id = auth.uid()
    )
  );
drop policy if exists "team_members_write" on team_members;
create policy "team_members_write" on team_members for all
  using (
    is_admin() or exists (
      select 1 from teams t join school_coordinators sc on sc.school_id = t.school_id
      where t.id = team_id and sc.profile_id = auth.uid()
    )
  );

drop policy if exists "registrations_read" on registrations;
create policy "registrations_read" on registrations for select
  using (
    is_admin()
    or registered_by = auth.uid()
    or exists (select 1 from students s where s.id = student_id and s.profile_id = auth.uid())
    or exists (select 1 from school_coordinators sc where sc.school_id = registrations.school_id and sc.profile_id = auth.uid())
  );
drop policy if exists "registrations_write" on registrations;
create policy "registrations_write" on registrations for all
  using (
    is_admin()
    or registered_by = auth.uid()
    or exists (select 1 from school_coordinators sc where sc.school_id = registrations.school_id and sc.profile_id = auth.uid())
  );

drop policy if exists "consent_records_read" on consent_records;
create policy "consent_records_read" on consent_records for select
  using (
    is_admin() or exists (
      select 1 from registrations r where r.id = registration_id and (
        r.registered_by = auth.uid()
        or exists (select 1 from students s where s.id = r.student_id and s.profile_id = auth.uid())
        or exists (select 1 from school_coordinators sc where sc.school_id = r.school_id and sc.profile_id = auth.uid())
      )
    )
  );
drop policy if exists "consent_records_write" on consent_records;
create policy "consent_records_write" on consent_records for all
  using (
    is_admin() or exists (
      select 1 from registrations r where r.id = registration_id and r.registered_by = auth.uid()
    )
  );

drop policy if exists "scores_judge_or_admin" on scores;
create policy "scores_judge_or_admin" on scores for select
  using (
    is_admin() or exists (
      select 1 from judge_assignments ja join judges j on j.id = ja.judge_id
      where ja.id = judge_assignment_id and j.profile_id = auth.uid()
    )
  );
drop policy if exists "scores_judge_write" on scores;
create policy "scores_judge_write" on scores for insert
  with check (
    is_admin() or exists (
      select 1 from judge_assignments ja join judges j on j.id = ja.judge_id
      where ja.id = judge_assignment_id and j.profile_id = auth.uid()
    )
  );
drop policy if exists "scores_judge_update" on scores;
create policy "scores_judge_update" on scores for update
  using (
    is_admin() or (
      not locked and exists (
        select 1 from judge_assignments ja join judges j on j.id = ja.judge_id
        where ja.id = judge_assignment_id and j.profile_id = auth.uid()
      )
    )
  );

drop policy if exists "certificates_read" on certificates;
create policy "certificates_read" on certificates for select
  using (
    is_admin() or exists (
      select 1 from registrations r where r.id = registration_id and (
        r.registered_by = auth.uid()
        or exists (select 1 from students s where s.id = r.student_id and s.profile_id = auth.uid())
        or exists (select 1 from school_coordinators sc where sc.school_id = r.school_id and sc.profile_id = auth.uid())
      )
    )
  );
drop policy if exists "certificates_admin_write" on certificates;
create policy "certificates_admin_write" on certificates for all using (is_admin());

drop policy if exists "audit_logs_admin_only" on audit_logs;
create policy "audit_logs_admin_only" on audit_logs for select using (is_admin());
drop policy if exists "audit_logs_insert" on audit_logs;
create policy "audit_logs_insert" on audit_logs for insert with check (true);

-- ---------------------------------------------------------------------------
-- New-user trigger
-- ---------------------------------------------------------------------------

create or replace function handle_new_user() returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  insert into profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'student')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
