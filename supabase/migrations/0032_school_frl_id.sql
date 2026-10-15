-- Future Ready League school ID: one permanent ID per school, in the form
-- FRL-S-<year>-<5-digit sequence> (e.g. FRL-S-2026-00001). Distinct from
-- student FRL IDs (FRL-<year>-#####) so the two never collide.
--
-- Safe to re-run.

create sequence if not exists school_frl_seq;

alter table schools add column if not exists frl_id text;

with numbered as (
  select id, created_at, row_number() over (order by created_at, id) as n
  from schools
  where frl_id is null
)
update schools s
set frl_id = 'FRL-S-' || to_char(numbered.created_at, 'YYYY') || '-' || lpad(
  (n + coalesce((select max(substring(frl_id from '(\d+)$')::int) from schools where frl_id is not null), 0))::text,
  5, '0')
from numbered
where s.id = numbered.id;

select setval(
  'school_frl_seq',
  greatest(coalesce((select max(substring(frl_id from '(\d+)$')::int) from schools), 0), 1),
  coalesce((select max(substring(frl_id from '(\d+)$')::int) from schools), 0) > 0
);

create or replace function assign_school_frl_id() returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.frl_id is null then
    new.frl_id := 'FRL-S-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('school_frl_seq')::text, 5, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists schools_assign_frl_id on schools;
create trigger schools_assign_frl_id
  before insert on schools
  for each row execute function assign_school_frl_id();

alter table schools alter column frl_id set not null;

do $$ begin
  alter table schools add constraint schools_frl_id_key unique (frl_id);
exception when duplicate_table or duplicate_object then null;
end $$;
