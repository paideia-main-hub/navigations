import type { SupabaseClient } from "@supabase/supabase-js";
import type { Team } from "@/domain/teams/types";

type TeamRow = {
  id: string;
  team_name: string;
  competition_id?: string | null;
  created_at?: string | null;
  team_members: { student_id: string; students: { full_name: string; grade: string | null } | null }[];
};

function toTeam(row: TeamRow): Team {
  return {
    id: row.id,
    name: row.team_name,
    competitionId: row.competition_id ?? null,
    createdAt: row.created_at ?? null,
    members: (row.team_members ?? [])
      .filter((m) => m.students)
      .map((m) => ({
        studentId: m.student_id,
        studentName: m.students!.full_name,
        grade: m.students!.grade,
      })),
  };
}

export async function listTeamsBySchool(supabase: SupabaseClient, schoolId: string): Promise<Team[]> {
  const { data, error } = await supabase
    .from("teams")
    .select("id, team_name, competition_id, team_members(student_id, students(full_name, grade))")
    .eq("school_id", schoolId)
    .order("team_name");

  if (error || !data) return [];
  return (data as unknown as TeamRow[]).map(toTeam);
}

/** Admin overview: every team across every school, unscoped, joined with the
 * owning school's name (null = an independent/schoolless team) and the
 * competitions the team is tied to (creation competition_id + registrations).
 * teams.competition_id has no live FK to competitions (dropped in 0004), so
 * titles for that column are resolved with a separate competitions lookup. */
export async function adminListAllTeams(admin: SupabaseClient): Promise<Team[]> {
  const { data, error } = await admin
    .from("teams")
    .select(
      "id, team_name, competition_id, created_at, team_members(student_id, students(full_name, grade)), schools(official_name), registrations(competition_title)",
    )
    .order("team_name");

  if (error || !data) return [];

  const rows = data as unknown as (TeamRow & {
    schools: { official_name: string } | null;
    registrations: { competition_title: string }[] | null;
  })[];

  const competitionIds = Array.from(
    new Set(rows.map((row) => row.competition_id).filter((id): id is string => Boolean(id))),
  );
  const titleByCompetitionId = new Map<string, string>();
  if (competitionIds.length > 0) {
    const { data: competitions } = await admin
      .from("competitions")
      .select("id, title")
      .in("id", competitionIds);
    for (const competition of competitions ?? []) {
      titleByCompetitionId.set(competition.id as string, competition.title as string);
    }
  }

  return rows.map((row) => {
    const titles = new Set<string>();
    const fromCompetitionId = row.competition_id
      ? titleByCompetitionId.get(row.competition_id)
      : undefined;
    if (fromCompetitionId) titles.add(fromCompetitionId);
    for (const registration of row.registrations ?? []) {
      if (registration.competition_title) titles.add(registration.competition_title);
    }
    return {
      ...toTeam(row),
      schoolName: row.schools?.official_name ?? null,
      competitionTitles: Array.from(titles).sort((a, b) => a.localeCompare(b)),
    };
  });
}

/** Creates a team (with a client-generated id, since RLS's SELECT-on-RETURNING
 * check for independent/student-created teams can't pass until team_members
 * exist yet — see 0004_school_dashboard_real_data.sql) and links its members. */
export async function createTeam(
  supabase: SupabaseClient,
  input: { id: string; name: string; schoolId: string | null; competitionId?: string | null; memberStudentIds: string[] },
): Promise<{ error: string | null }> {
  const { error: teamError } = await supabase.from("teams").insert({
    id: input.id,
    team_name: input.name,
    school_id: input.schoolId,
    competition_id: input.competitionId ?? null,
  });
  if (teamError) return { error: teamError.message };

  const { error: membersError } = await supabase.from("team_members").insert(
    input.memberStudentIds.map((studentId) => ({ team_id: input.id, student_id: studentId })),
  );
  if (membersError) return { error: membersError.message };

  return { error: null };
}
