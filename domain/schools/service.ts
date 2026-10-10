import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/data/supabase/admin";
import { adminListSchools, findSchoolByCoordinator, updateSchoolProfile } from "@/data/repositories/schools.repository";
import type { School, SchoolProfileInput } from "./types";

export async function getCoordinatorSchool(supabase: SupabaseClient, profileId: string): Promise<School | null> {
  return findSchoolByCoordinator(supabase, profileId);
}

/** Official school name for a coordinator, for the header and sidebar. */
export async function getCoordinatorSchoolName(profileId: string): Promise<string | null> {
  const school = await findSchoolByCoordinator(createAdminClient(), profileId);
  const name = school?.officialName.trim() ?? "";
  return name || null;
}

export async function listAllSchools(admin: SupabaseClient): Promise<School[]> {
  return adminListSchools(admin);
}

export async function updateSchool(
  supabase: SupabaseClient,
  schoolId: string,
  input: SchoolProfileInput,
): Promise<{ error: string | null }> {
  return updateSchoolProfile(supabase, schoolId, input);
}
