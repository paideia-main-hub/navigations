-- Future Ready League Awards — a second major feature alongside Competitions.
-- Distinct data model because most award layers are either computed from
-- existing competition/registration data (no submission at all) or judged
-- against a fixed evidence-based rubric with a pass/fail threshold, rather
-- than competitions' live-event scoring + rank ordering. See
-- documentation/FRL_Awards_Website_Publication_Copy.docx for the source
-- requirements.

-- ---------------------------------------------------------------------------
-- New role: independent nominators (Idea of the Year / Story of the Year /
-- Young Changemaker don't require a school account). handle_new_user()
-- already reads role from signup metadata, so no trigger change is needed.
-- ---------------------------------------------------------------------------

alter type user_role add value 'nominator';

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type award_layer as enum ('competition_distinction', 'school_award', 'spotlight', 'teacher_parent', 'sports', 'principal');
create type award_category_status as enum ('draft', 'open', 'closed', 'archived');
create type award_nomination_status as enum ('draft', 'submitted', 'needs_clarification', 'needs_third_review', 'judged', 'approved', 'rejected', 'published');
create type award_route as enum ('implemented', 'future_proposal');
create type award_evidence_type as enum ('pdf', 'image', 'audio', 'video', 'link');

-- ---------------------------------------------------------------------------
-- Categories — admin-managed, one row per named award (Outstanding Performer
-- through Best Principal). rubric_criteria is empty for teacher_parent (no
-- scoring at all — every complete nomination is approved).
-- ---------------------------------------------------------------------------

create table award_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  layer award_layer not null,
  description text,
  requires_school boolean not null default false,
  allows_independent boolean not null default false,
  rubric_criteria jsonb not null default '[]', -- [{ key, label, weight }]
  pass_threshold numeric(5, 2) not null default 70,
  tie_break_order jsonb not null default '[]', -- ordered criterion keys consulted on a tie
  max_winners int, -- null = unlimited (teacher/parent); 1 for most spotlight; 50 for principal
  evidence_period_start date,
  evidence_period_end date,
  closing_at timestamptz,
  status award_category_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Nominations
-- ---------------------------------------------------------------------------

create table award_nominations (
  id uuid primary key default gen_random_uuid(),
  nomination_number text not null unique,
  category_id uuid not null references award_categories(id) on delete cascade,
  nominator_profile_id uuid not null references profiles(id), -- school coordinator, or a nominator-role profile
  school_id uuid references schools(id) on delete set null,   -- null for independent nominations
  nominee_name text not null,
  nominee_relationship text, -- e.g. "Grade 8 Math teacher"; "self" for independent Spotlight entries
  route award_route, -- Idea of the Year only
  form_data jsonb not null default '{}', -- category-specific fields (title/summary/problem/idea/plan, or narrative text)
  verifier_name text,
  verifier_contact text,
  consent_terms boolean not null default false,
  consent_privacy boolean not null default false,
  consent_result_publication boolean not null default false,
  consent_photo_publication boolean not null default false,
  status award_nomination_status not null default 'draft',
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table award_evidence_files (
  id uuid primary key default gen_random_uuid(),
  nomination_id uuid not null references award_nominations(id) on delete cascade,
  file_type award_evidence_type not null,
  file_url text not null,
  size_bytes bigint,
  page_count int, -- pdf only, best-effort client-reported (see plan: no server-side enforcement yet)
  created_at timestamptz not null default now()
);

-- Repeatable per-sport event record — only the Sports category uses this
-- (Blazer Athlete needs three of these, one per sport).
create table award_event_records (
  id uuid primary key default gen_random_uuid(),
  nomination_id uuid not null references award_nominations(id) on delete cascade,
  sport text not null,
  event text,
  organizer text,
  level text,
  role text,
  result text,
  evidence_note text,
  order_index int not null default 0
);

-- ---------------------------------------------------------------------------
-- Judging — parallel to judge_assignments/scores. Same judges table/role as
-- Competitions: a judge can be assigned to competitions and/or award
-- categories independently.
-- ---------------------------------------------------------------------------

create table award_judge_assignments (
  id uuid primary key default gen_random_uuid(),
  judge_id uuid not null references judges(id) on delete cascade,
  category_id uuid not null references award_categories(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  unique (judge_id, category_id)
);

create table award_scores (
  id uuid primary key default gen_random_uuid(),
  award_judge_assignment_id uuid not null references award_judge_assignments(id) on delete cascade,
  nomination_id uuid not null references award_nominations(id) on delete cascade,
  criteria_scores jsonb not null default '{}',
  total_score numeric(6, 2),
  comments text,
  locked boolean not null default false,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (award_judge_assignment_id, nomination_id)
);

-- ---------------------------------------------------------------------------
-- Clarification requests — new concept, no Competitions equivalent. One
-- nomination can have several rounds; each row is one admin request and
-- (once answered) the nominator's response.
-- ---------------------------------------------------------------------------

create table award_clarifications (
  id uuid primary key default gen_random_uuid(),
  nomination_id uuid not null references award_nominations(id) on delete cascade,
  requested_by uuid references profiles(id),
  message text not null,
  requested_at timestamptz not null default now(),
  response_text text,
  responded_at timestamptz
);

-- ---------------------------------------------------------------------------
-- School Awards (Layer B) — computed/admin-scored results per school per
-- category, refreshed by an admin "recompute" action. Collaboration &
-- Integrity has no formula: an admin fills computed_value in directly.
-- ---------------------------------------------------------------------------

create table school_award_results (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  category_id uuid not null references award_categories(id) on delete cascade,
  computed_value numeric(10, 2) not null default 0,
  rank int,
  is_winner boolean not null default false,
  is_published boolean not null default false,
  computed_at timestamptz not null default now(),
  unique (school_id, category_id)
);

-- ---------------------------------------------------------------------------
-- Storage bucket for evidence uploads — private (evidence and verifier
-- contacts must stay private per spec; only approved award info is public).
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('award-evidence', 'award-evidence', false)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table award_categories enable row level security;
alter table award_nominations enable row level security;
alter table award_evidence_files enable row level security;
alter table award_event_records enable row level security;
alter table award_judge_assignments enable row level security;
alter table award_scores enable row level security;
alter table award_clarifications enable row level security;
alter table school_award_results enable row level security;

-- Categories: public reads open/closed/archived (criteria pages + past
-- winners); draft is admin-only preview.
create policy "award_categories_public_read" on award_categories for select
  using (status <> 'draft' or is_admin());
create policy "award_categories_admin_write" on award_categories for all using (is_admin());

-- security-definer helper (not an inline correlated subquery referencing
-- itself) for the same reason judge_has_competition_access exists in
-- 0012_judge_workflow.sql — referenced from several policies below.
create or replace function award_judge_has_category_access(p_category_id uuid) returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from award_judge_assignments aja
    join judges j on j.id = aja.judge_id
    where j.profile_id = auth.uid() and aja.category_id = p_category_id
  );
$$;

create policy "award_nominations_read" on award_nominations for select
  using (
    status = 'published'
    or is_admin()
    or nominator_profile_id = auth.uid()
    or exists (select 1 from school_coordinators sc where sc.school_id = award_nominations.school_id and sc.profile_id = auth.uid())
    or award_judge_has_category_access(category_id)
  );
create policy "award_nominations_self_insert" on award_nominations for insert
  with check (nominator_profile_id = auth.uid());
-- WITH CHECK deliberately just re-asserts ownership, not an allowed-status
-- list: an UPDATE policy with no WITH CHECK defaults it to the USING clause,
-- which would then also block the row's own respond-to-clarification flow
-- (needs_clarification -> submitted) since the *new* row wouldn't match
-- USING's status condition either.
create policy "award_nominations_self_update" on award_nominations for update
  using (nominator_profile_id = auth.uid() and status in ('draft', 'needs_clarification'))
  with check (nominator_profile_id = auth.uid());
create policy "award_nominations_admin_write" on award_nominations for all using (is_admin());

create policy "award_evidence_files_read" on award_evidence_files for select
  using (exists (
    select 1 from award_nominations n where n.id = nomination_id and (
      is_admin() or n.nominator_profile_id = auth.uid()
      or exists (select 1 from school_coordinators sc where sc.school_id = n.school_id and sc.profile_id = auth.uid())
      or award_judge_has_category_access(n.category_id)
    )
  ));
create policy "award_evidence_files_self_insert" on award_evidence_files for insert
  with check (exists (select 1 from award_nominations n where n.id = nomination_id and n.nominator_profile_id = auth.uid()));
create policy "award_evidence_files_admin_write" on award_evidence_files for all using (is_admin());

create policy "award_event_records_read" on award_event_records for select
  using (exists (
    select 1 from award_nominations n where n.id = nomination_id and (
      is_admin() or n.nominator_profile_id = auth.uid() or award_judge_has_category_access(n.category_id)
    )
  ));
create policy "award_event_records_self_write" on award_event_records for insert
  with check (exists (select 1 from award_nominations n where n.id = nomination_id and n.nominator_profile_id = auth.uid()));
create policy "award_event_records_self_update" on award_event_records for update
  using (exists (select 1 from award_nominations n where n.id = nomination_id and n.nominator_profile_id = auth.uid()));
create policy "award_event_records_self_delete" on award_event_records for delete
  using (exists (select 1 from award_nominations n where n.id = nomination_id and n.nominator_profile_id = auth.uid()));
create policy "award_event_records_admin_write" on award_event_records for all using (is_admin());

create policy "award_judge_assignments_self_or_admin" on award_judge_assignments for select
  using (is_admin() or exists (select 1 from judges j where j.id = judge_id and j.profile_id = auth.uid()));
create policy "award_judge_assignments_admin_write" on award_judge_assignments for all using (is_admin());

create policy "award_scores_judge_or_admin" on award_scores for select
  using (
    is_admin() or exists (
      select 1 from award_judge_assignments aja join judges j on j.id = aja.judge_id
      where aja.id = award_judge_assignment_id and j.profile_id = auth.uid()
    )
  );
create policy "award_scores_judge_write" on award_scores for insert
  with check (
    is_admin() or exists (
      select 1 from award_judge_assignments aja join judges j on j.id = aja.judge_id
      where aja.id = award_judge_assignment_id and j.profile_id = auth.uid()
    )
  );
create policy "award_scores_judge_update" on award_scores for update
  using (
    is_admin() or (
      not locked and exists (
        select 1 from award_judge_assignments aja join judges j on j.id = aja.judge_id
        where aja.id = award_judge_assignment_id and j.profile_id = auth.uid()
      )
    )
  );

create policy "award_clarifications_read" on award_clarifications for select
  using (exists (select 1 from award_nominations n where n.id = nomination_id and (is_admin() or n.nominator_profile_id = auth.uid())));
create policy "award_clarifications_nominator_respond" on award_clarifications for update
  using (exists (select 1 from award_nominations n where n.id = nomination_id and n.nominator_profile_id = auth.uid()));
create policy "award_clarifications_admin_write" on award_clarifications for all using (is_admin());

create policy "school_award_results_read" on school_award_results for select
  using (
    is_published or is_admin()
    or exists (select 1 from school_coordinators sc where sc.school_id = school_award_results.school_id and sc.profile_id = auth.uid())
  );
create policy "school_award_results_admin_write" on school_award_results for all using (is_admin());

-- Evidence bucket: private, no public-read policy. The service-role client
-- (admin/judge server actions) bypasses storage RLS entirely; a nominator
-- can read/upload only their own objects, keyed by the uploading user's id.
create policy "award_evidence_bucket_owner_read" on storage.objects for select
  using (bucket_id = 'award-evidence' and owner = auth.uid());
create policy "award_evidence_bucket_owner_insert" on storage.objects for insert
  with check (bucket_id = 'award-evidence' and owner = auth.uid());
