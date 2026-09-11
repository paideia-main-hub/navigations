-- Future Competence Series — initial schema
-- Covers the data entities in the developer handover doc (section 22) and
-- the access rules in FR-16, FR-21, FR-24 (gated results, consent, RBAC).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type user_role as enum ('student', 'school_coordinator', 'judge', 'admin');
create type age_category as enum ('primary', 'middle', 'secondary');
create type entry_type as enum ('individual', 'team');
create type competition_status as enum ('draft', 'upcoming', 'open', 'closed', 'archived');
create type registration_status as enum ('pending', 'approved', 'rejected', 'qualified', 'finalist', 'completed');
create type manual_type as enum ('registration_rules', 'guiding_principles', 'complete_manual', 'judging_rubric');
create type resource_type as enum ('practice_question', 'sample_task', 'video', 'quiz', 'article');
create type announcement_category as enum ('registration', 'schedule', 'venue', 'manual_update', 'results', 'final_round', 'general');
create type event_type as enum ('registration_close', 'round', 'result_date', 'final_event', 'other');
create type consent_type as enum ('terms', 'privacy', 'result_publication', 'photo_publication');
create type award_type as enum ('gold', 'silver', 'bronze', 'finalist', 'merit', 'custom');
create type verification_status as enum ('pending', 'verified', 'rejected');

-- ---------------------------------------------------------------------------
-- Identity: profiles extend auth.users (1:1), role drives dashboard/RLS
-- ---------------------------------------------------------------------------

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'student',
  full_name text not null,
  email text not null,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Schools
-- ---------------------------------------------------------------------------

create table schools (
  id uuid primary key default gen_random_uuid(),
  official_name text not null,
  campus_branch text,
  school_network text,
  school_type text,
  curriculums text[],
  address text,
  city text,
  district text,
  province text,
  country text,
  principal_name text,
  school_phone text,
  website text,
  student_strength int,
  verification_status verification_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table school_coordinators (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  designation text,
  official_email text,
  mobile text,
  whatsapp text,
  alternate_contact text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  unique (school_id, profile_id)
);

-- ---------------------------------------------------------------------------
-- Students
-- ---------------------------------------------------------------------------

create table students (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete set null, -- null when added by a school without their own login
  school_id uuid references schools(id) on delete set null,   -- set once matched to a registered school account
  school_name_input text,                                     -- free-text school name as typed at signup, before/without a school match
  full_name text not null,
  date_of_birth date,
  gender text,
  grade text,
  curriculum text,
  guardian_name text,
  guardian_relationship text,
  guardian_email text,
  guardian_mobile text,
  photo_url text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Competitions
-- ---------------------------------------------------------------------------

create table competitions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  short_description text,
  overview text,
  domain_competency_area text,
  participation_type entry_type not null default 'individual',
  supports_individual boolean not null default true,
  supports_team boolean not null default false,
  status competition_status not null default 'draft',
  fee_required boolean not null default false,
  fee_amount numeric(10, 2),
  season text, -- e.g. "2026"
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Per-competition eligibility rules, one row per age category the competition
-- accepts (FR-04: eligibility must be validated during registration).
create table competition_eligibility_rules (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references competitions(id) on delete cascade,
  category age_category not null,
  min_grade text,
  max_grade text,
  min_age int,
  max_age int,
  team_min_size int,
  team_max_size int,
  notes text,
  unique (competition_id, category)
);

create table competition_stages (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references competitions(id) on delete cascade,
  stage_number int not null,
  title text not null,
  format text,
  duration text,
  task_description text,
  progression_rule text,
  order_index int not null default 0,
  unique (competition_id, stage_number)
);

-- ---------------------------------------------------------------------------
-- Manuals & resources (section 19: manual/practice resource architecture)
-- ---------------------------------------------------------------------------

create table manuals (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid references competitions(id) on delete cascade, -- null = site-wide
  type manual_type not null,
  title text not null,
  file_url text not null,
  version_label text,
  version_date date,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table resources (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references competitions(id) on delete cascade,
  stage_id uuid references competition_stages(id) on delete set null,
  type resource_type not null,
  title text not null,
  content text,       -- rendered in-page; practice packs are website-only per spec
  video_url text,
  order_index int not null default 0,
  download_allowed boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Judging
-- ---------------------------------------------------------------------------

create table rubrics (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references competitions(id) on delete cascade,
  stage_id uuid references competition_stages(id) on delete set null,
  criteria jsonb not null default '[]', -- [{ name, weight, scale }]
  tie_break_rule text,
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);

create table judges (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references profiles(id) on delete cascade,
  bio text,
  created_at timestamptz not null default now()
);

create table judge_assignments (
  id uuid primary key default gen_random_uuid(),
  judge_id uuid not null references judges(id) on delete cascade,
  competition_id uuid not null references competitions(id) on delete cascade,
  stage_id uuid references competition_stages(id) on delete set null,
  assigned_at timestamptz not null default now(),
  unique (judge_id, competition_id, stage_id)
);

-- ---------------------------------------------------------------------------
-- Teams
-- ---------------------------------------------------------------------------

create table teams (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references competitions(id) on delete cascade,
  school_id uuid references schools(id) on delete set null,
  team_name text not null,
  team_leader_student_id uuid references students(id) on delete set null,
  coach_name text,
  created_at timestamptz not null default now()
);

create table team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  role text,
  unique (team_id, student_id)
);

-- ---------------------------------------------------------------------------
-- Registrations (FR-05/FR-06: individual + school-managed team entries)
-- ---------------------------------------------------------------------------

create table registrations (
  id uuid primary key default gen_random_uuid(),
  registration_number text not null unique,
  competition_id uuid not null references competitions(id) on delete cascade,
  category age_category not null,
  entry_type entry_type not null,
  student_id uuid references students(id) on delete cascade,  -- set when entry_type = individual
  team_id uuid references teams(id) on delete cascade,        -- set when entry_type = team
  school_id uuid references schools(id) on delete set null,   -- null for independent student registrations
  registered_by uuid not null references profiles(id),
  status registration_status not null default 'pending',
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint registration_entity_check check (
    (entry_type = 'individual' and student_id is not null and team_id is null) or
    (entry_type = 'team' and team_id is not null and student_id is null)
  )
);

create table consent_records (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references registrations(id) on delete cascade,
  type consent_type not null,
  accepted boolean not null default false,
  accepted_at timestamptz,
  accepted_by uuid references profiles(id),
  unique (registration_id, type)
);

-- ---------------------------------------------------------------------------
-- Scoring
-- ---------------------------------------------------------------------------

create table scores (
  id uuid primary key default gen_random_uuid(),
  judge_assignment_id uuid not null references judge_assignments(id) on delete cascade,
  registration_id uuid not null references registrations(id) on delete cascade,
  criteria_scores jsonb not null default '{}',
  total_score numeric(6, 2),
  comments text,
  locked boolean not null default false,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (judge_assignment_id, registration_id)
);

-- ---------------------------------------------------------------------------
-- Announcements & calendar
-- ---------------------------------------------------------------------------

create table announcements (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid references competitions(id) on delete cascade, -- null = site-wide
  category announcement_category not null default 'general',
  title text not null,
  body text not null,
  publish_date timestamptz not null default now(),
  expiry_date timestamptz,
  is_important boolean not null default false,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table events (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references competitions(id) on delete cascade,
  type event_type not null,
  title text not null,
  event_date timestamptz not null,
  description text
);

-- ---------------------------------------------------------------------------
-- Results & winners (FR-16/FR-17: gated approval, public winner gallery)
-- ---------------------------------------------------------------------------

create table results (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references registrations(id) on delete cascade,
  competition_id uuid not null references competitions(id) on delete cascade,
  season text,
  award award_type,
  custom_award_label text,
  score numeric(6, 2),
  is_published boolean not null default false,
  approved_by uuid references profiles(id),
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

create table winner_media (
  id uuid primary key default gen_random_uuid(),
  result_id uuid not null references results(id) on delete cascade,
  photo_url text,
  consent_confirmed boolean not null default false,
  created_at timestamptz not null default now()
);

-- Phase 2 per spec, table included now so FKs from results are stable.
create table certificates (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references registrations(id) on delete cascade,
  certificate_number text not null unique,
  file_url text,
  issued_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Audit log (FR-24 / admin accountability)
-- ---------------------------------------------------------------------------

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Helper: current user's role, used throughout RLS policies below
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
-- Row Level Security
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

-- Profiles: everyone can read their own row; admin can read/manage all.
create policy "profiles_select_own_or_admin" on profiles for select
  using (id = auth.uid() or is_admin());
create policy "profiles_update_own_or_admin" on profiles for update
  using (id = auth.uid() or is_admin());
create policy "profiles_admin_all" on profiles for all
  using (is_admin());

-- Public catalogue content: readable by anyone, writable by admin only.
create policy "competitions_public_read" on competitions for select using (true);
create policy "competitions_admin_write" on competitions for insert with check (is_admin());
create policy "competitions_admin_update" on competitions for update using (is_admin());
create policy "competitions_admin_delete" on competitions for delete using (is_admin());

create policy "eligibility_public_read" on competition_eligibility_rules for select using (true);
create policy "eligibility_admin_write" on competition_eligibility_rules for all using (is_admin());

create policy "stages_public_read" on competition_stages for select using (true);
create policy "stages_admin_write" on competition_stages for all using (is_admin());

create policy "manuals_public_read" on manuals for select using (true);
create policy "manuals_admin_write" on manuals for all using (is_admin());

create policy "resources_public_read" on resources for select using (true);
create policy "resources_admin_write" on resources for all using (is_admin());

create policy "rubrics_public_read" on rubrics for select using (is_public or is_admin());
create policy "rubrics_admin_write" on rubrics for all using (is_admin());

create policy "announcements_public_read" on announcements for select using (true);
create policy "announcements_admin_write" on announcements for all using (is_admin());

create policy "events_public_read" on events for select using (true);
create policy "events_admin_write" on events for all using (is_admin());

-- Results: public only once published; admin sees/manages everything.
create policy "results_public_read_published" on results for select
  using (is_published or is_admin());
create policy "results_admin_write" on results for all using (is_admin());

create policy "winner_media_public_read" on winner_media for select
  using (
    consent_confirmed and exists (
      select 1 from results r where r.id = result_id and r.is_published
    ) or is_admin()
  );
create policy "winner_media_admin_write" on winner_media for all using (is_admin());

-- Schools: coordinators manage their own school; admin manages all.
create policy "schools_coordinator_read" on schools for select
  using (
    is_admin() or exists (
      select 1 from school_coordinators sc
      where sc.school_id = schools.id and sc.profile_id = auth.uid()
    )
  );
create policy "schools_coordinator_update" on schools for update
  using (
    is_admin() or exists (
      select 1 from school_coordinators sc
      where sc.school_id = schools.id and sc.profile_id = auth.uid()
    )
  );
create policy "schools_insert_self" on schools for insert with check (true);
create policy "schools_admin_delete" on schools for delete using (is_admin());

create policy "school_coordinators_self_or_admin" on school_coordinators for select
  using (profile_id = auth.uid() or is_admin());
create policy "school_coordinators_admin_write" on school_coordinators for all using (is_admin());
create policy "school_coordinators_insert_self" on school_coordinators for insert
  with check (profile_id = auth.uid());

-- Students: the student's own profile, their school's coordinator, or admin.
create policy "students_owner_school_admin_read" on students for select
  using (
    profile_id = auth.uid() or is_admin() or exists (
      select 1 from school_coordinators sc
      where sc.school_id = students.school_id and sc.profile_id = auth.uid()
    )
  );
create policy "students_owner_school_admin_write" on students for all
  using (
    profile_id = auth.uid() or is_admin() or exists (
      select 1 from school_coordinators sc
      where sc.school_id = students.school_id and sc.profile_id = auth.uid()
    )
  );

-- Judges: admin manages; a judge can read their own row.
create policy "judges_self_or_admin" on judges for select
  using (profile_id = auth.uid() or is_admin());
create policy "judges_admin_write" on judges for all using (is_admin());

create policy "judge_assignments_self_or_admin" on judge_assignments for select
  using (
    is_admin() or exists (select 1 from judges j where j.id = judge_id and j.profile_id = auth.uid())
  );
create policy "judge_assignments_admin_write" on judge_assignments for all using (is_admin());

-- Teams / team members: visible to member students, their school, and admin.
create policy "teams_read" on teams for select
  using (
    is_admin() or exists (
      select 1 from school_coordinators sc where sc.school_id = teams.school_id and sc.profile_id = auth.uid()
    ) or exists (
      select 1 from team_members tm join students s on s.id = tm.student_id
      where tm.team_id = teams.id and s.profile_id = auth.uid()
    )
  );
create policy "teams_write" on teams for all
  using (
    is_admin() or exists (
      select 1 from school_coordinators sc where sc.school_id = teams.school_id and sc.profile_id = auth.uid()
    )
  );

create policy "team_members_read" on team_members for select
  using (
    is_admin() or exists (
      select 1 from teams t join school_coordinators sc on sc.school_id = t.school_id
      where t.id = team_id and sc.profile_id = auth.uid()
    ) or exists (
      select 1 from students s where s.id = student_id and s.profile_id = auth.uid()
    )
  );
create policy "team_members_write" on team_members for all
  using (
    is_admin() or exists (
      select 1 from teams t join school_coordinators sc on sc.school_id = t.school_id
      where t.id = team_id and sc.profile_id = auth.uid()
    )
  );

-- Registrations: owning student, owning school's coordinator, or admin.
create policy "registrations_read" on registrations for select
  using (
    is_admin()
    or registered_by = auth.uid()
    or exists (select 1 from students s where s.id = student_id and s.profile_id = auth.uid())
    or exists (select 1 from school_coordinators sc where sc.school_id = registrations.school_id and sc.profile_id = auth.uid())
  );
create policy "registrations_write" on registrations for all
  using (
    is_admin()
    or registered_by = auth.uid()
    or exists (select 1 from school_coordinators sc where sc.school_id = registrations.school_id and sc.profile_id = auth.uid())
  );

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
create policy "consent_records_write" on consent_records for all
  using (
    is_admin() or exists (
      select 1 from registrations r where r.id = registration_id and r.registered_by = auth.uid()
    )
  );

-- Scores: never public. Judges see/enter only their own assignments; admin all.
create policy "scores_judge_or_admin" on scores for select
  using (
    is_admin() or exists (
      select 1 from judge_assignments ja join judges j on j.id = ja.judge_id
      where ja.id = judge_assignment_id and j.profile_id = auth.uid()
    )
  );
create policy "scores_judge_write" on scores for insert
  with check (
    is_admin() or exists (
      select 1 from judge_assignments ja join judges j on j.id = ja.judge_id
      where ja.id = judge_assignment_id and j.profile_id = auth.uid()
    )
  );
create policy "scores_judge_update" on scores for update
  using (
    is_admin() or (
      not locked and exists (
        select 1 from judge_assignments ja join judges j on j.id = ja.judge_id
        where ja.id = judge_assignment_id and j.profile_id = auth.uid()
      )
    )
  );

-- Certificates: same visibility as the registration they belong to.
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
create policy "certificates_admin_write" on certificates for all using (is_admin());

-- Audit logs: admin only.
create policy "audit_logs_admin_only" on audit_logs for select using (is_admin());
create policy "audit_logs_insert" on audit_logs for insert with check (true);

-- ---------------------------------------------------------------------------
-- New-user hook: create a profile row the moment someone signs up
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
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
