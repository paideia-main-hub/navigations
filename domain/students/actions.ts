"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { getCoordinatorSchool } from "@/domain/schools/service";
import { uploadOwnPhoto } from "@/domain/storage/actions";
import { addStudentToSchool, getOwnStudentProfile, setStudentPhoto, updateOwnStudentProfile } from "./service";

export type ActionState = { error: string | null; success?: boolean };

export async function addStudentAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "school_coordinator") return { error: "Not authorized." };

  const supabase = await createClient();
  const school = await getCoordinatorSchool(supabase, user.id);
  if (!school) return { error: "No school found for this coordinator." };

  const { student, error } = await addStudentToSchool(supabase, school.id, {
    fullName: String(formData.get("full_name")),
    grade: String(formData.get("grade")) || null,
    dateOfBirth: String(formData.get("date_of_birth")) || null,
    gender: String(formData.get("gender")) || null,
    guardianName: String(formData.get("guardian_name")) || null,
    guardianRelationship: String(formData.get("guardian_relationship")) || null,
    guardianEmail: String(formData.get("guardian_email")) || null,
    guardianMobile: String(formData.get("guardian_mobile")) || null,
  });

  if (error || !student) return { error };

  // Optional, same as at student self-registration — a failed upload
  // doesn't block adding the student, it just leaves photoUrl null until
  // someone uploads one later.
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    const { url } = await uploadOwnPhoto(photo, student.id);
    if (url) await setStudentPhoto(supabase, student.id, url);
  }

  revalidatePath("/dashboard");
  return { error: null, success: true };
}

export async function updateStudentProfileAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") return { error: "Not authorized." };

  const supabase = await createClient();
  const profile = await getOwnStudentProfile(supabase, user.id);
  if (!profile) return { error: "No student profile found for this account." };

  const { error } = await updateOwnStudentProfile(supabase, profile.id, {
    fullName: profile.fullName,
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
