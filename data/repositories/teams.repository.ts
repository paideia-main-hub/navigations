import type { SupabaseClient } from "@supabase/supabase-js";
import type { Team } from "@/domain/teams/types";

type TeamRow = {
  id: string;
  team_name: string;
  team_members: { student_id: string; students: { full_name: string; grade: string | null } | null }[];
};

function toTeam(row: TeamRow): Team {
  return {
    id: row.id,
    name: row.team_name,
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
    .select("id, team_name, team_members(student_id, students(full_name, grade))")
    .eq("school_id", schoolId)
    .order("team_name");

  if (error || !data) return [];
  return (data as unknown as TeamRow[]).map(toTeam);
}

/** Creates a team (with a client-generated id, since RLS's SELECT-on-RETURNING
 * check for independent/student-created teams can't pass until team_members
 * exist yet — see 0004_school_dashboard_real_data.sql) and links its members. */
export async function createTeam(
  supabase: SupabaseClient,
  input: { id: string; name: string; schoolId: string | null; memberStudentIds: string[] },
): Promise<{ error: string | null }> {
  const { error: teamError } = await supabase.from("teams").insert({
    id: input.id,
    team_name: input.name,
    school_id: input.schoolId,
  });
  if (teamError) return { error: teamError.message };

  const { error: membersError } = await supabase.from("team_members").insert(
    input.memberStudentIds.map((studentId) => ({ team_id: input.id, student_id: studentId })),
  );
  if (membersError) return { error: membersError.message };

  return { error: null };
}
