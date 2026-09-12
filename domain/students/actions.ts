"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { getCoordinatorSchool } from "@/domain/schools/service";
import { addStudentToSchool } from "./service";

export type ActionState = { error: string | null; success?: boolean };

export async function addStudentAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "school_coordinator") return { error: "Not authorized." };

  const supabase = await createClient();
  const school = await getCoordinatorSchool(supabase, user.id);
  if (!school) return { error: "No school found for this coordinator." };

  const { error } = await addStudentToSchool(supabase, school.id, {
    fullName: String(formData.get("full_name")),
    grade: String(formData.get("grade")) || null,
    dateOfBirth: String(formData.get("date_of_birth")) || null,
    gender: String(formData.get("gender")) || null,
    guardianName: String(formData.get("guardian_name")) || null,
    guardianRelationship: String(formData.get("guardian_relationship")) || null,
    guardianEmail: String(formData.get("guardian_email")) || null,
    guardianMobile: String(formData.get("guardian_mobile")) || null,
  });

  if (error) return { error };

  revalidatePath("/dashboard");
  return { error: null, success: true };
}
