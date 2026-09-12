import type { SupabaseClient } from "@supabase/supabase-js";
import { listTeamsBySchool, createTeam as createTeamRow } from "@/data/repositories/teams.repository";
import type { Team } from "./types";

export async function listSchoolTeams(supabase: SupabaseClient, schoolId: string): Promise<Team[]> {
  return listTeamsBySchool(supabase, schoolId);
}

export async function createTeam(
  supabase: SupabaseClient,
  input: { name: string; schoolId: string | null; memberStudentIds: string[] },
): Promise<{ teamId: string; error: string | null }> {
  const id = crypto.randomUUID();
  const { error } = await createTeamRow(supabase, { id, ...input });
  return { teamId: id, error };
}
