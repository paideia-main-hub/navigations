-- Purge test schools: keep only the six production schools below.
-- Cascades/sets that do NOT remove dependents on school delete (SET NULL),
-- so this script deletes payments, nominations, registrations, teams, and
-- students for non-kept schools before removing the school rows.
--
-- Keep list (case-insensitive; Grammar/Grammer and Bloomfield/Bloomfeild OK):
--   Al-Noor Grammer School
--   bloomfeild hall
--   Greenwood International School
--   PARADISE CREATIVE SCHOOL
--   Riverside Grammer School
--   Stars Academy
--
-- Preview (run alone first if you want to inspect):
--   select id, official_name,
--     case when <keep_predicate> then 'KEEP' else 'DELETE' end as action
--   from schools order by official_name;

begin;

create temporary table tmp_keep_schools on commit drop as
select s.id, s.official_name
from schools s
where
  lower(regexp_replace(trim(s.official_name), '\s+', ' ', 'g')) in (
    'al-noor grammer school',
    'al-noor grammar school',
    'bloomfeild hall',
    'bloomfield hall',
    'greenwood international school',
    'paradise creative school',
    'riverside grammer school',
    'riverside grammar school',
    'stars academy'
  )
  or lower(s.official_name) ~ 'al[- ]?noor.*(gramm?er|grammar)'
  or lower(s.official_name) ~ 'bloomf[ie]+ld[[:space:]]*hall'
  or lower(s.official_name) ~ 'greenwood[[:space:]]+international'
  or lower(s.official_name) ~ 'paradise[[:space:]]+creative'
  or lower(s.official_name) ~ 'riverside.*(gramm?er|grammar)'
  or lower(s.official_name) ~ '^stars[[:space:]]+academy';

create temporary table tmp_drop_schools on commit drop as
select s.id, s.official_name
from schools s
where not exists (select 1 from tmp_keep_schools k where k.id = s.id);

create temporary table tmp_drop_students on commit drop as
select st.id, st.profile_id
from students st
where st.school_id in (select id from tmp_drop_schools);

create temporary table tmp_drop_teams on commit drop as
select t.id
from teams t
where t.school_id in (select id from tmp_drop_schools);

create temporary table tmp_drop_coordinator_profiles on commit drop as
select distinct sc.profile_id
from school_coordinators sc
where sc.school_id in (select id from tmp_drop_schools);

-- Bail out if the keep list matched fewer than 6 schools (name mismatch).
do $$
declare
  keep_count int;
begin
  select count(*) into keep_count from tmp_keep_schools;
  if keep_count < 6 then
    raise exception
      'Purge aborted: expected at least 6 keep-list schools, matched %. Check official_name spelling.',
      keep_count;
  end if;
end $$;

-- Payment rows for dropping schools (FK is SET NULL on school delete).
delete from registration_payments
where school_id in (select id from tmp_drop_schools);

-- Award nominations for those schools (evidence/scores/clarifications cascade).
delete from award_nominations
where school_id in (select id from tmp_drop_schools);

-- Registrations for those schools / their students / their teams
-- (consents, scores, results, work_submissions cascade from registrations).
delete from registrations
where school_id in (select id from tmp_drop_schools)
   or student_id in (select id from tmp_drop_students)
   or team_id in (select id from tmp_drop_teams);

-- Teams belonging to those schools (team_members cascade).
delete from teams
where id in (select id from tmp_drop_teams);

-- Students belonging to those schools.
delete from students
where id in (select id from tmp_drop_students);

-- Schools (school_coordinators + school_award_results cascade).
delete from schools
where id in (select id from tmp_drop_schools);

-- Orphaned student login profiles (no remaining students row).
delete from profiles p
where p.id in (
    select distinct profile_id
    from tmp_drop_students
    where profile_id is not null
  )
  and p.role = 'student'
  and not exists (select 1 from students s where s.profile_id = p.id);

-- Orphaned school-coordinator profiles that no longer coordinate any school.
delete from profiles p
where p.id in (select profile_id from tmp_drop_coordinator_profiles)
  and p.role = 'school_coordinator'
  and not exists (
    select 1 from school_coordinators sc where sc.profile_id = p.id
  );

commit;
