import type { SupabaseClient } from "@supabase/supabase-js";
import { findSchoolByCoordinator, updateSchoolProfile } from "@/data/repositories/schools.repository";
import type { School, SchoolProfileInput } from "./types";

export async function getCoordinatorSchool(supabase: SupabaseClient, profileId: string): Promise<School | null> {
  return findSchoolByCoordinator(supabase, profileId);
}

export async function updateSchool(
  supabase: SupabaseClient,
  schoolId: string,
  input: SchoolProfileInput,
): Promise<{ error: string | null }> {
  return updateSchoolProfile(supabase, schoolId, input);
}
