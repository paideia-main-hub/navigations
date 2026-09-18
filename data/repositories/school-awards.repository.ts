// School Awards (Layer B) computation. Four of the five categories are pure
// aggregation over existing competitions data — no submission, nothing new
// to store except the computed result. Collaboration & Integrity has no
// formula (it's an admin-entered score — see upsertCollaborationScore).
//
// The spec's wording ("draft, cancelled, withdrawn ... do not count") refers
// to registration statuses this schema doesn't actually model — the real
// registration_status enum is only pending/approved/rejected/qualified/
// finalist/completed (domain/registrations/types.ts) — so "doesn't count"
// here means excluding 'rejected' only; every other status is a genuine,
// submitted registration.

import type { SupabaseClient } from "@supabase/supabase-js";

interface ResultRow {
  award: "gold" | "silver" | "bronze" | "finalist" | "merit" | "custom";
  registrations: { school_id: string | null } | null;
}

interface RegistrationRow {
  school_id: string | null;
  entry_type: "individual" | "team";
  status: string;
  competition_slug: string;
  teams: { team_members: { id: string }[] } | null;
}

export interface SchoolFormulaInputs {
  schoolId: string;
  outstandingPerformerCount: number; // gold
  distinguishedFinalistCount: number; // silver
  emergingTalentCount: number; // bronze
  participationCount: number;
  distinctCompetitionsCompleted: number;
}

const TOTAL_COMPETITIONS = 27; // per spec section 6 — the fixed 27-competition model

/** Pulls every published Competition Distinction result and every
 * non-rejected registration, grouped per school, as the raw input to the
 * four formulaic School Award categories. */
export async function computeSchoolFormulaInputs(admin: SupabaseClient): Promise<SchoolFormulaInputs[]> {
  const [{ data: results }, { data: registrations }] = await Promise.all([
    admin.from("results").select("award, registrations(school_id)").eq("is_published", true).in("award", ["gold", "silver", "bronze"]),
    admin
      .from("registrations")
      .select("school_id, entry_type, status, competition_slug, teams(team_members(id))")
      .not("school_id", "is", null)
      .neq("status", "rejected"),
  ]);

  const bySchool = new Map<string, SchoolFormulaInputs>();
  function get(schoolId: string): SchoolFormulaInputs {
    let entry = bySchool.get(schoolId);
    if (!entry) {
      entry = {
        schoolId,
        outstandingPerformerCount: 0,
        distinguishedFinalistCount: 0,
        emergingTalentCount: 0,
        participationCount: 0,
        distinctCompetitionsCompleted: 0,
      };
      bySchool.set(schoolId, entry);
    }
    return entry;
  }

  for (const row of (results ?? []) as unknown as ResultRow[]) {
    const schoolId = row.registrations?.school_id;
    if (!schoolId) continue;
    const entry = get(schoolId);
    if (row.award === "gold") entry.outstandingPerformerCount += 1;
    else if (row.award === "silver") entry.distinguishedFinalistCount += 1;
    else if (row.award === "bronze") entry.emergingTalentCount += 1;
  }

  const completedSlugsBySchool = new Map<string, Set<string>>();
  for (const row of (registrations ?? []) as unknown as RegistrationRow[]) {
    const schoolId = row.school_id;
    if (!schoolId) continue;
    const entry = get(schoolId);
    entry.participationCount += row.entry_type === "individual" ? 1 : (row.teams?.team_members.length ?? 0);

    if (row.status === "qualified" || row.status === "finalist" || row.status === "completed") {
      const set = completedSlugsBySchool.get(schoolId) ?? new Set<string>();
      set.add(row.competition_slug);
      completedSlugsBySchool.set(schoolId, set);
    }
  }
  for (const [schoolId, slugs] of completedSlugsBySchool) {
    get(schoolId).distinctCompetitionsCompleted = slugs.size;
  }

  return Array.from(bySchool.values());
}

export function championPoints(input: SchoolFormulaInputs): number {
  return input.outstandingPerformerCount * 10 + input.distinguishedFinalistCount * 6 + input.emergingTalentCount * 3;
}

export function diversifiedCoverage(input: SchoolFormulaInputs): number {
  return (input.distinctCompetitionsCompleted / TOTAL_COMPETITIONS) * 100;
}

export interface SchoolAwardResultRow {
  schoolId: string;
  schoolName: string;
  categoryId: string;
  categorySlug: string;
  computedValue: number;
  rank: number | null;
  isWinner: boolean;
  isPublished: boolean;
}

export async function listSchoolAwardResults(admin: SupabaseClient, categoryId?: string): Promise<SchoolAwardResultRow[]> {
  let query = admin
    .from("school_award_results")
    .select("computed_value, rank, is_winner, is_published, category_id, schools(id, official_name), award_categories(slug)")
    .order("rank");
  if (categoryId) query = query.eq("category_id", categoryId);

  const { data } = await query;
  return (data ?? []).map((r) => {
    const row = r as unknown as {
      computed_value: number;
      rank: number | null;
      is_winner: boolean;
      is_published: boolean;
      category_id: string;
      schools: { id: string; official_name: string } | null;
      award_categories: { slug: string } | null;
    };
    return {
      schoolId: row.schools?.id ?? "",
      schoolName: row.schools?.official_name ?? "—",
      categoryId: row.category_id,
      categorySlug: row.award_categories?.slug ?? "",
      computedValue: row.computed_value,
      rank: row.rank,
      isWinner: row.is_winner,
      isPublished: row.is_published,
    };
  });
}

/** Upserts one school's computed value + rank + winner flag for a category —
 * ties (spec: "exact ties in the calculated school awards receive joint
 * recognition") share the same rank and are all marked as winners. */
export async function upsertSchoolAwardResult(
  admin: SupabaseClient,
  input: { schoolId: string; categoryId: string; computedValue: number; rank: number | null; isWinner: boolean },
): Promise<{ error: string | null }> {
  const { error } = await admin
    .from("school_award_results")
    .upsert(
      { school_id: input.schoolId, category_id: input.categoryId, computed_value: input.computedValue, rank: input.rank, is_winner: input.isWinner, computed_at: new Date().toISOString() },
      { onConflict: "school_id,category_id" },
    );
  return { error: error?.message ?? null };
}

export async function publishSchoolAwardResults(admin: SupabaseClient, categoryId: string): Promise<{ error: string | null }> {
  const { error } = await admin.from("school_award_results").update({ is_published: true }).eq("category_id", categoryId);
  return { error: error?.message ?? null };
}

/** Collaboration & Integrity has no formula — an admin enters the weighted
 * score (0-100) directly per school; ≥70% wins per spec. */
export async function setCollaborationScore(admin: SupabaseClient, schoolId: string, categoryId: string, score: number): Promise<{ error: string | null }> {
  return upsertSchoolAwardResult(admin, { schoolId, categoryId, computedValue: score, rank: null, isWinner: score >= 70 });
}
