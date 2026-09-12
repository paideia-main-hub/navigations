-- Winners Gallery (FR-17) needs a source before the real registrations ->
-- judging -> results pipeline exists (Judging/Results is a later phase, and
-- registrations don't even carry a real competition_id FK yet — see
-- 0004_school_dashboard_real_data.sql). This table lets admin publish a
-- winner showcase directly (free-text student/school name), decoupled from
-- `results`/`winner_media`/`registrations`. It can coexist with that real
-- pipeline once it's built later.

create table competition_winners (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references competitions(id) on delete cascade,
  student_name text not null,
  school_name text not null,
  award award_type not null,
  custom_award_label text,
  position_label text,
  photo_url text,
  published boolean not null default true,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

alter table competition_winners enable row level security;

create policy "competition_winners_public_read" on competition_winners for select using (published);
create policy "competition_winners_admin_write" on competition_winners for all using (is_admin());
