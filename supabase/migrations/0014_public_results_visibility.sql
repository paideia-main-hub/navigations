-- Found by seeding real demo data and checking the public homepage: a
-- published result is publicly readable (results_public_read_published), but
-- listPublishedComputedWinners() also needs the entrant's name/school (via
-- registrations -> students/teams/schools) to render a winner card, and
-- those tables have no public-read policy at all — only the owning
-- student/school coordinator/admin/judge can read them. So an anonymous
-- visitor's query silently returned zero rows for the join, and computed
-- winners never appeared on the homepage, /results, or a competition's
-- Winners Gallery tab, even though the result itself was published.
--
-- Fix: add a narrow SELECT policy per table, additive to the existing ones
-- (RLS policies are OR'd), open only when a published result actually
-- references that row — never a blanket "students/teams/schools are public"
-- policy. A student with no published result stays exactly as private as
-- before.

create policy "registrations_public_read_when_published" on registrations for select
  using (exists (select 1 from results r where r.registration_id = registrations.id and r.is_published));

create policy "students_public_read_when_published" on students for select
  using (
    exists (
      select 1 from registrations r join results res on res.registration_id = r.id
      where r.student_id = students.id and res.is_published
    )
    or exists (
      select 1 from team_members tm
      join registrations r on r.team_id = tm.team_id
      join results res on res.registration_id = r.id
      where tm.student_id = students.id and res.is_published
    )
  );

create policy "teams_public_read_when_published" on teams for select
  using (
    exists (
      select 1 from registrations r join results res on res.registration_id = r.id
      where r.team_id = teams.id and res.is_published
    )
  );

create policy "team_members_public_read_when_published" on team_members for select
  using (
    exists (
      select 1 from registrations r
      join results res on res.registration_id = r.id
      where r.team_id = team_members.team_id and res.is_published
    )
  );

create policy "schools_public_read_when_published" on schools for select
  using (
    exists (
      select 1 from registrations r join results res on res.registration_id = r.id
      where r.school_id = schools.id and res.is_published
    )
  );
