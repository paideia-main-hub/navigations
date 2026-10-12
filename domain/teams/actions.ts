"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { getCoordinatorSchool } from "@/domain/schools/service";
import { createTeam } from "./service";
import { DUPLICATE_TEAM_NAME, teamNameTaken, type Team } from "./types";

/** Names already used by a team set for this competition. The same name is allowed for a different competition. */
async function rejectDuplicateTeamName(
  supabase: SupabaseClient,
  schoolId: string,
  name: string,
  scope: { competitionId?: string | null; competitionSlug?: string | null; exceptTeamId?: string },
): Promise<string | null> {
  if (!scope.competitionId && !scope.competitionSlug) return null;
  const names: { id: string; name: string }[] = [];
  if (scope.competitionId) {
    const { data, error } = await supabase
      .from("teams")
      .select("id, team_name")
      .eq("school_id", schoolId)
      .eq("competition_id", scope.competitionId);
    if (error) return error.message;
    for (const row of data ?? []) names.push({ id: String(row.id), name: String(row.team_name ?? "") });
  }

  let registrations = supabase.from("registrations").select("team_id").eq("school_id", schoolId).eq("entry_type", "team");
  if (scope.competitionSlug) registrations = registrations.eq("competition_slug", scope.competitionSlug);
  else if (scope.competitionId) registrations = registrations.eq("competition_id", scope.competitionId);
  const { data: registered, error: registrationError } = await registrations;
  if (registrationError) return registrationError.message;
  const registeredIds = [...new Set((registered ?? []).map((row) => row.team_id).filter((id): id is string => Boolean(id)))];
  if (registeredIds.length > 0) {
    const { data: linked, error: linkedError } = await supabase.from("teams").select("id, team_name").in("id", registeredIds);
    if (linkedError) return linkedError.message;
    for (const row of linked ?? []) names.push({ id: String(row.id), name: String(row.team_name ?? "") });
  }

  return teamNameTaken(name, names, scope.exceptTeamId) ? DUPLICATE_TEAM_NAME : null;
}

export type ActionState = { error: string | null; success?: boolean };

export async function createTeamAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "school_coordinator") return { error: "Not authorized." };

  const supabase = await createClient();
  const school = await getCoordinatorSchool(supabase, user.id);
  if (!school) return { error: "No school found for this coordinator." };

  const name = String(formData.get("team_name"));
  const memberStudentIds = formData.getAll("member_ids").map(String);

  if (!name.trim()) return { error: "Team name is required." };
  if (memberStudentIds.length < 2) return { error: "Select at least 2 students for a team." };

  const { error } = await createTeam(supabase, { name, schoolId: school.id, memberStudentIds });
  if (error) return { error };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/teams");
  return { error: null, success: true };
}

/** Creates a school team and returns it so registration can list it immediately. */
export async function createSchoolTeamAction(input: {
  name: string;
  memberStudentIds: string[];
  competitionId: string;
  competitionSlug: string;
}): Promise<{ team: Team | null; error: string | null }> {
  const user = await getCurrentUser();
  if (!user || user.role !== "school_coordinator") return { team: null, error: "Not authorized." };

  const name = input.name.trim();
  const memberStudentIds = [...new Set(input.memberStudentIds.filter(Boolean))];
  if (!name) return { team: null, error: "Team name is required." };
  if (memberStudentIds.length < 2) return { team: null, error: "Select at least 2 students for a team." };

  const supabase = await createClient();
  const school = await getCoordinatorSchool(supabase, user.id);
  if (!school) return { team: null, error: "No school found for this coordinator." };

  const { data: students, error: studentError } = await supabase
    .from("students")
    .select("id, full_name, grade")
    .eq("school_id", school.id)
    .in("id", memberStudentIds);
  if (studentError) return { team: null, error: studentError.message };
  if ((students ?? []).length !== memberStudentIds.length) {
    return { team: null, error: "Choose students from your school roster." };
  }

  const duplicate = await rejectDuplicateTeamName(supabase, school.id, name, {
    competitionId: input.competitionId,
    competitionSlug: input.competitionSlug,
  });
  if (duplicate) return { team: null, error: duplicate };

  const { teamId, error } = await createTeam(supabase, {
    name,
    schoolId: school.id,
    competitionId: input.competitionId,
    memberStudentIds,
  });
  if (error || !teamId) return { team: null, error: error ?? "Could not create the team." };

  revalidatePath("/dashboard/teams");
  const byId = new Map((students ?? []).map((row) => [row.id as string, row]));
  return {
    team: {
      id: teamId,
      name,
      competitionId: input.competitionId,
      members: memberStudentIds.map((id) => {
        const row = byId.get(id);
        return {
          studentId: id,
          studentName: typeof row?.full_name === "string" ? row.full_name : "Student",
          grade: typeof row?.grade === "string" ? row.grade : null,
        };
      }),
    },
    error: null,
  };
}

/** Updates a school team's name and members. */
export async function updateSchoolTeamAction(input: {
  teamId: string;
  name: string;
  memberStudentIds: string[];
  competitionId?: string;
  competitionSlug?: string;
}): Promise<{ team: Team | null; error: string | null }> {
  const user = await getCurrentUser();
  if (!user || user.role !== "school_coordinator") return { team: null, error: "Not authorized." };

  const name = input.name.trim();
  const memberStudentIds = [...new Set(input.memberStudentIds.filter(Boolean))];
  if (!name) return { team: null, error: "Team name is required." };
  if (memberStudentIds.length < 2) return { team: null, error: "Select at least 2 students for a team." };

  const supabase = await createClient();
  const school = await getCoordinatorSchool(supabase, user.id);
  if (!school) return { team: null, error: "No school found for this coordinator." };

  const { data: existing, error: teamReadError } = await supabase
    .from("teams")
    .select("id, team_name, competition_id")
    .eq("id", input.teamId)
    .eq("school_id", school.id)
    .maybeSingle();
  if (teamReadError) return { team: null, error: teamReadError.message };
  if (!existing) return { team: null, error: "That team was not found for this school." };

  const currentName = String(existing.team_name ?? "");
  if (currentName.trim().toLowerCase() !== name.toLowerCase()) {
    const duplicate = await rejectDuplicateTeamName(supabase, school.id, name, {
      competitionId: input.competitionId ?? (typeof existing.competition_id === "string" ? existing.competition_id : null),
      competitionSlug: input.competitionSlug,
      exceptTeamId: input.teamId,
    });
    if (duplicate) return { team: null, error: duplicate };
  }

  const { data: students, error: studentError } = await supabase
    .from("students")
    .select("id, full_name, grade")
    .eq("school_id", school.id)
    .in("id", memberStudentIds);
  if (studentError) return { team: null, error: studentError.message };
  if ((students ?? []).length !== memberStudentIds.length) {
    return { team: null, error: "Choose students from your school roster." };
  }

  const { error: renameError } = await supabase.from("teams").update({ team_name: name }).eq("id", input.teamId);
  if (renameError) return { team: null, error: renameError.message };

  const { error: deleteError } = await supabase.from("team_members").delete().eq("team_id", input.teamId);
  if (deleteError) return { team: null, error: deleteError.message };

  const { error: insertError } = await supabase.from("team_members").insert(
    memberStudentIds.map((studentId) => ({ team_id: input.teamId, student_id: studentId })),
  );
  if (insertError) return { team: null, error: insertError.message };

  revalidatePath("/dashboard/teams");
  const byId = new Map((students ?? []).map((row) => [row.id as string, row]));
  return {
    team: {
      id: input.teamId,
      name,
      competitionId: input.competitionId ?? (typeof existing.competition_id === "string" ? existing.competition_id : null),
      members: memberStudentIds.map((id) => {
        const row = byId.get(id);
        return {
          studentId: id,
          studentName: typeof row?.full_name === "string" ? row.full_name : "Student",
          grade: typeof row?.grade === "string" ? row.grade : null,
        };
      }),
    },
    error: null,
  };
}
