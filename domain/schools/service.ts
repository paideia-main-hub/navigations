import type { SupabaseClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
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

const cachedAdminSchools = unstable_cache(
  async () => adminListSchools(createAdminClient()),
  ["admin-list-schools-with-coordinators"],
  { revalidate: 60, tags: ["admin-schools"] },
);

/** Prefer the caller’s admin client (Directory) so coordinator names are fresh;
 * fall back to the short-lived cache for other call sites. */
export async function listAllSchools(admin?: SupabaseClient): Promise<School[]> {
  if (admin) return adminListSchools(admin);
  return cachedAdminSchools();
}

export async function updateSchool(
  supabase: SupabaseClient,
  schoolId: string,
  input: SchoolProfileInput,
): Promise<{ error: string | null }> {
  return updateSchoolProfile(supabase, schoolId, input);
}
