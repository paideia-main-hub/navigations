-- Future Ready League student ID: one permanent ID per student, in the form
-- FRL-<year>-<5-digit sequence> (e.g. FRL-2026-00001), reused for every
-- competition the student registers for.
--
-- It's assigned by the database, not the app, so every way a student row is
-- created — self sign-up, a school coordinator adding a student, or a
-- teammate added by name during a team registration — gets one, and two
-- signups at the same moment can never receive the same number. The year is
-- the year the student record was created; the sequence never resets.
--
-- Safe to re-run.

create sequence if not exists student_frl_seq;

alter table students add column if not exists frl_id text;

-- Existing students get IDs in the order they were created.
with numbered as (
  select id, created_at, row_number() over (order by created_at, id) as n
  from students
  where frl_id is null
)
update students s
set frl_id = 'FRL-' || to_char(numbered.created_at, 'YYYY') || '-' || lpad(
  (n + coalesce((select max(substring(frl_id from '(\d+)$')::int) from students where frl_id is not null), 0))::text,
  5, '0')
from numbered
where s.id = numbered.id;

-- Continue the sequence after the highest number handed out so far.
select setval(
  'student_frl_seq',
  greatest(coalesce((select max(substring(frl_id from '(\d+)$')::int) from students), 0), 1),
  coalesce((select max(substring(frl_id from '(\d+)$')::int) from students), 0) > 0
);

-- security definer: student rows are inserted by the signing-up student,
-- school coordinators and ad-hoc team registrations under their own roles,
-- none of which should need direct rights on the sequence.
create or replace function assign_student_frl_id() returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.frl_id is null then
    new.frl_id := 'FRL-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('student_frl_seq')::text, 5, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists students_assign_frl_id on students;
create trigger students_assign_frl_id
  before insert on students
  for each row execute function assign_student_frl_id();

alter table students alter column frl_id set not null;

do $$ begin
  alter table students add constraint students_frl_id_key unique (frl_id);
exception when duplicate_table or duplicate_object then null;
end $$;
