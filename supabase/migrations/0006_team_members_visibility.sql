-- The Student Dashboard needs to show a student their full team roster for a
-- team registration, but the existing team_members SELECT policy only let a
-- student see their *own* row (profile_id = auth.uid() on that specific
-- row) — not their teammates'. Reuses is_team_member() from
-- 0005_fix_teams_recursion.sql (a SECURITY DEFINER function, so this does
-- not reintroduce the teams/team_members recursion that migration fixed).

drop policy if exists "team_members_read" on team_members;
create policy "team_members_read" on team_members for select
  using (
    is_admin()
    or exists (
      select 1 from teams t join school_coordinators sc on sc.school_id = t.school_id
      where t.id = team_id and sc.profile_id = auth.uid()
    )
    or is_team_member(team_id)
  );
