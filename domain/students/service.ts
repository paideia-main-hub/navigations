import type { SupabaseClient } from "@supabase/supabase-js";
import {
  listStudentsBySchool,
  insertStudent,
  insertAdHocStudent,
  findStudentByProfile,
} from "@/data/repositories/students.repository";
import type { AddStudentInput, StudentProfile } from "./types";

export async function listSchoolRoster(supabase: SupabaseClient, schoolId: string): Promise<StudentProfile[]> {
  return listStudentsBySchool(supabase, schoolId);
}

export async function getOwnStudentProfile(supabase: SupabaseClient, profileId: string): Promise<StudentProfile | null> {
  return findStudentByProfile(supabase, profileId);
}

export async function addStudentToSchool(
  supabase: SupabaseClient,
  schoolId: string,
  input: AddStudentInput,
): Promise<{ student: StudentProfile | null; error: string | null }> {
  return insertStudent(supabase, schoolId, input);
}

export async function createAdHocTeammate(
  supabase: SupabaseClient,
  fullName: string,
): Promise<{ id: string | null; error: string | null }> {
  return insertAdHocStudent(supabase, fullName);
}
