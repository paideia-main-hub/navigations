-- Fixes "infinite recursion detected in policy for relation team_members".
--
-- teams_read's policy queries team_members (to let a team's own members see
-- it), while team_members_write/team_members_independent_insert query teams
-- (to check the team's school/independence). Postgres re-evaluates RLS on
-- every table a policy touches, so inserting into team_members triggered
-- teams' policies, which queried team_members again, forever.
--
-- Fix: move the team_members lookup into a SECURITY DEFINER function. Like
-- is_admin()/auth_role(), it runs as the (RLS-bypassing) function owner, so
-- it reads team_members without re-triggering team_members' own policies —
-- breaking the cycle.

create or replace function is_team_member(p_team_id uuid) returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from team_members tm join students s on s.id = tm.student_id
    where tm.team_id = p_team_id and s.profile_id = auth.uid()
  );
$$;

drop policy if exists "teams_read" on teams;
create policy "teams_read" on teams for select
  using (
    is_admin()
    or exists (
      select 1 from school_coordinators sc where sc.school_id = teams.school_id and sc.profile_id = auth.uid()
    )
    or is_team_member(teams.id)
  );
