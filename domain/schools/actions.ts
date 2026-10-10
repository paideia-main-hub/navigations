"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { isSchoolType } from "./types";
import { getCoordinatorSchool, updateSchool } from "./service";

export type ActionState = { error: string | null; success?: boolean };

export async function updateSchoolProfileAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "school_coordinator") return { error: "Not authorized." };

  const supabase = await createClient();
  const school = await getCoordinatorSchool(supabase, user.id);
  if (!school) return { error: "No school found for this coordinator." };

  const schoolType = String(formData.get("school_type") ?? "").trim();
  if (!isSchoolType(schoolType)) return { error: "Choose a school type." };

  const { error } = await updateSchool(supabase, school.id, {
    officialName: String(formData.get("official_name")),
    schoolType,
    city: String(formData.get("city")) || null,
    country: String(formData.get("country")) || null,
    principalName: String(formData.get("principal_name")) || null,
    schoolPhone: String(formData.get("school_phone")) || null,
    website: String(formData.get("website")) || null,
  });

  if (error) return { error };

  revalidatePath("/dashboard");
  return { error: null, success: true };
}
