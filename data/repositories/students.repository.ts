import type { SupabaseClient } from "@supabase/supabase-js";
import type { AddStudentInput, StudentProfile } from "@/domain/students/types";

type Row = {
  id: string;
  full_name: string;
  grade: string | null;
  date_of_birth: string | null;
  gender: string | null;
  guardian_name: string | null;
  guardian_relationship: string | null;
  guardian_email: string | null;
  guardian_mobile: string | null;
};

function toStudent(row: Row): StudentProfile {
  return {
    id: row.id,
    fullName: row.full_name,
    grade: row.grade,
    dateOfBirth: row.date_of_birth,
    gender: row.gender,
    guardianName: row.guardian_name,
    guardianRelationship: row.guardian_relationship,
    guardianEmail: row.guardian_email,
    guardianMobile: row.guardian_mobile,
  };
}

export async function findStudentByProfile(supabase: SupabaseClient, profileId: string): Promise<StudentProfile | null> {
  const { data, error } = await supabase
    .from("students")
    .select("id, full_name, grade, date_of_birth, gender, guardian_name, guardian_relationship, guardian_email, guardian_mobile")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error || !data) return null;
  return toStudent(data as Row);
}

export async function listStudentsBySchool(supabase: SupabaseClient, schoolId: string): Promise<StudentProfile[]> {
  const { data, error } = await supabase
    .from("students")
    .select("id, full_name, grade, date_of_birth, gender, guardian_name, guardian_relationship, guardian_email, guardian_mobile")
    .eq("school_id", schoolId)
    .order("full_name");

  if (error || !data) return [];
  return (data as Row[]).map(toStudent);
}

export async function insertStudent(
  supabase: SupabaseClient,
  schoolId: string,
  input: AddStudentInput,
): Promise<{ student: StudentProfile | null; error: string | null }> {
  const { data, error } = await supabase
    .from("students")
    .insert({
      school_id: schoolId,
      full_name: input.fullName,
      grade: input.grade,
      date_of_birth: input.dateOfBirth,
      gender: input.gender,
      guardian_name: input.guardianName,
      guardian_relationship: input.guardianRelationship,
      guardian_email: input.guardianEmail,
      guardian_mobile: input.guardianMobile,
    })
    .select("id, full_name, grade, date_of_birth, gender, guardian_name, guardian_relationship, guardian_email, guardian_mobile")
    .single();

  if (error || !data) return { student: null, error: error?.message ?? "Failed to add student." };
  return { student: toStudent(data as Row), error: null };
}

/** Creates a placeholder student row with no login/school link — used when a
 * self-registering student types in ad-hoc teammate names for a team entry.
 * Generates the id client-side and skips .select(): the SELECT policy for
 * these ownerless rows doesn't grant the creator visibility (nobody "owns"
 * an ad-hoc row), so requesting the row back via RETURNING would fail the
 * same way the schools chicken-and-egg bug did — see 0003_schools_created_by.sql. */
export async function insertAdHocStudent(
  supabase: SupabaseClient,
  fullName: string,
): Promise<{ id: string | null; error: string | null }> {
  const id = crypto.randomUUID();
  const { error } = await supabase.from("students").insert({ id, full_name: fullName });
  if (error) return { id: null, error: error.message };
  return { id, error: null };
}
