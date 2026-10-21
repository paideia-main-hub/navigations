import type { SupabaseClient } from "@supabase/supabase-js";
import type { School, SchoolProfileInput } from "@/domain/schools/types";

type Row = {
  id: string;
  frl_id?: string | null;
  official_name: string;
  campus_branch: string | null;
  school_type: string | null;
  city: string | null;
  country: string | null;
  principal_name: string | null;
  school_phone: string | null;
  website: string | null;
  student_strength: number | null;
  created_at?: string | null;
};

function toSchool(row: Row): School {
  return {
    id: row.id,
    frlId: row.frl_id ?? null,
    officialName: row.official_name,
    campusBranch: row.campus_branch,
    schoolType: row.school_type,
    city: row.city,
    country: row.country,
    principalName: row.principal_name,
    schoolPhone: row.school_phone,
    website: row.website,
    studentStrength: row.student_strength,
    createdAt: row.created_at ?? null,
  };
}

/** Admin overview: every registered school, unscoped, with coordinators.
 * Uses the service-role client (RLS would otherwise restrict this to a
 * coordinator's own school). */
export async function adminListSchools(admin: SupabaseClient): Promise<School[]> {
  const { data, error } = await admin
    .from("schools")
    .select("*, school_coordinators(mobile, profiles(full_name))")
    .order("official_name");
  if (error || !data) return [];
  return (
    data as (Row & {
      school_coordinators:
        | { mobile: string | null; profiles: { full_name: string } | null }[]
        | null;
    })[]
  ).map((row) => ({
    ...toSchool(row),
    coordinators: (row.school_coordinators ?? [])
      .map((link) => {
        const name = link.profiles?.full_name?.trim() ?? "";
        if (!name) return null;
        return {
          name,
          mobile: link.mobile?.trim() || null,
        };
      })
      .filter((c): c is { name: string; mobile: string | null } => Boolean(c))
      .sort((a, b) => a.name.localeCompare(b.name)),
  }));
}

/** Finds the school a coordinator (by profile id) belongs to, via school_coordinators. */
export async function findSchoolByCoordinator(
  supabase: SupabaseClient,
  profileId: string,
): Promise<School | null> {
  const { data, error } = await supabase
    .from("school_coordinators")
    .select("schools(*)")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error || !data?.schools) return null;
  return toSchool(data.schools as unknown as Row);
}

export async function updateSchoolProfile(
  supabase: SupabaseClient,
  schoolId: string,
  input: SchoolProfileInput,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("schools")
    .update({
      official_name: input.officialName,
      school_type: input.schoolType,
      city: input.city,
      country: input.country,
      principal_name: input.principalName,
      school_phone: input.schoolPhone,
      website: input.website,
    })
    .eq("id", schoolId);

  return { error: error?.message ?? null };
}
