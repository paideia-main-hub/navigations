"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { getCoordinatorSchool } from "@/domain/schools/service";
import { createTeam } from "./service";

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
  return { error: null, success: true };
}
