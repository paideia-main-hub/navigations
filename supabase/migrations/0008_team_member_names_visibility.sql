-- Fixes a silent data-dropping bug: registering a team with an ad-hoc
-- teammate (a self-registering student typing in a name with no account)
-- creates a students row with profile_id/school_id both null. The
-- team_members visibility fix (0006) lets a teammate see that
-- team_members row, but the *nested* join to students(full_name) is
-- independently subject to students' own SELECT policy — which had no
-- branch for "this is my teammate's record" — so the name silently
-- disappeared from the query results instead of erroring.

create or replace function shares_team_with(p_student_id uuid) returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1
    from team_members tm_other
    join team_members tm_me on tm_me.team_id = tm_other.team_id
    join students me on me.id = tm_me.student_id
    where tm_other.student_id = p_student_id
      and me.profile_id = auth.uid()
  );
$$;

drop policy if exists "students_owner_school_admin_read" on students;
create policy "students_owner_school_admin_read" on students for select
  using (
    profile_id = auth.uid() or is_admin() or exists (
      select 1 from school_coordinators sc
      where sc.school_id = students.school_id and sc.profile_id = auth.uid()
    )
    or shares_team_with(students.id)
  );
