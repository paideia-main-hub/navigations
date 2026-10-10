import type { SupabaseClient } from "@supabase/supabase-js";
import {
  adminListAllStudents,
  listStudentsBySchool,
  insertStudent,
  insertAdHocStudent,
  findStudentByProfile,
  updateStudentProfile,
  updateSchoolStudentRecord,
  updateStudentPhoto,
  updateStudentGrade,
} from "@/data/repositories/students.repository";
import type { AddStudentInput, StudentProfile } from "./types";

export async function listSchoolRoster(supabase: SupabaseClient, schoolId: string): Promise<StudentProfile[]> {
  return listStudentsBySchool(supabase, schoolId);
}

export async function listAllStudents(admin: SupabaseClient): Promise<StudentProfile[]> {
  return adminListAllStudents(admin);
}

export async function getOwnStudentProfile(supabase: SupabaseClient, profileId: string): Promise<StudentProfile | null> {
  return findStudentByProfile(supabase, profileId);
}

export async function updateOwnStudentGrade(supabase: SupabaseClient, studentId: string, grade: string): Promise<{ error: string | null }> {
  return updateStudentGrade(supabase, studentId, grade);
}

export async function updateSchoolStudent(
  supabase: SupabaseClient,
  schoolId: string,
  studentId: string,
  input: AddStudentInput,
): Promise<{ error: string | null }> {
  return updateSchoolStudentRecord(supabase, schoolId, studentId, input);
}

export async function updateOwnStudentProfile(
  supabase: SupabaseClient,
  studentId: string,
  input: AddStudentInput,
): Promise<{ error: string | null }> {
  return updateStudentProfile(supabase, studentId, input);
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

export async function setStudentPhoto(supabase: SupabaseClient, studentId: string, photoUrl: string): Promise<{ error: string | null }> {
  return updateStudentPhoto(supabase, studentId, photoUrl);
}
