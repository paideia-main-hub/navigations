-- Fixes "new row violates row-level security policy for team_members" when a
-- self-registering student (not a school coordinator) submits a team entry.
--
-- team_members_independent_insert's check queries teams ("is this team's
-- school_id null?") — but that query is itself subject to teams' SELECT
-- policy (teams_read), which for an independent team only grants access via
-- is_team_member(), and team_members doesn't exist yet for a brand-new team.
-- Chicken-and-egg, same shape as the schools bug (0003) and the teams
-- recursion bug (0005).
--
-- Fix: check the column directly via a SECURITY DEFINER function instead of
-- a subquery, so it doesn't go through teams' RLS at all.

create or replace function is_independent_team(p_team_id uuid) returns boolean
language sql stable security definer
set search_path = public
as $$
  select coalesce((select school_id is null from teams where id = p_team_id), false);
$$;

drop policy if exists "team_members_independent_insert" on team_members;
create policy "team_members_independent_insert" on team_members for insert
  with check (is_independent_team(team_id));
