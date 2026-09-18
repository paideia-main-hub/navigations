// Data layer: the only place that knows where award category data comes
// from — real Supabase queries against `award_categories`
// (supabase/migrations/0016_awards.sql). The domain layer only calls these
// functions, never Supabase directly.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AwardCategory, AwardCategoryStatus, AwardLayer, RubricCriterion } from "@/domain/awards/types";

type Row = {
  id: string;
  slug: string;
  title: string;
  layer: AwardLayer;
  description: string | null;
  requires_school: boolean;
  allows_independent: boolean;
  rubric_criteria: RubricCriterion[];
  pass_threshold: number;
  tie_break_order: string[];
  max_winners: number | null;
  evidence_period_start: string | null;
  evidence_period_end: string | null;
  closing_at: string | null;
  status: AwardCategoryStatus;
  created_at: string;
  updated_at: string;
};

function toCategory(row: Row): AwardCategory {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    layer: row.layer,
    description: row.description ?? "",
    requiresSchool: row.requires_school,
    allowsIndependent: row.allows_independent,
    rubricCriteria: row.rubric_criteria ?? [],
    passThreshold: row.pass_threshold,
    tieBreakOrder: row.tie_break_order ?? [],
    maxWinners: row.max_winners,
    evidencePeriodStart: row.evidence_period_start,
    evidencePeriodEnd: row.evidence_period_end,
    closingAt: row.closing_at,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAllCategories(supabase: SupabaseClient): Promise<AwardCategory[]> {
  const { data, error } = await supabase.from("award_categories").select("*").order("layer").order("title");
  if (error || !data) return [];
  return (data as Row[]).map(toCategory);
}

export async function getCategoryBySlug(supabase: SupabaseClient, slug: string): Promise<AwardCategory | null> {
  const { data, error } = await supabase.from("award_categories").select("*").eq("slug", slug).maybeSingle();
  if (error || !data) return null;
  return toCategory(data as Row);
}

export async function adminListCategories(admin: SupabaseClient): Promise<AwardCategory[]> {
  return getAllCategories(admin);
}

export async function adminGetCategoryById(admin: SupabaseClient, id: string): Promise<AwardCategory | null> {
  const { data, error } = await admin.from("award_categories").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return toCategory(data as Row);
}

export interface AwardCategoryInput {
  slug: string;
  title: string;
  layer: AwardLayer;
  description: string;
  requiresSchool: boolean;
  allowsIndependent: boolean;
  rubricCriteria: RubricCriterion[];
  passThreshold: number;
  tieBreakOrder: string[];
  maxWinners: number | null;
  evidencePeriodStart: string | null;
  evidencePeriodEnd: string | null;
  closingAt: string | null;
}

function toRow(input: AwardCategoryInput) {
  return {
    slug: input.slug,
    title: input.title,
    layer: input.layer,
    description: input.description || null,
    requires_school: input.requiresSchool,
    allows_independent: input.allowsIndependent,
    rubric_criteria: input.rubricCriteria,
    pass_threshold: input.passThreshold,
    tie_break_order: input.tieBreakOrder,
    max_winners: input.maxWinners,
    evidence_period_start: input.evidencePeriodStart,
    evidence_period_end: input.evidencePeriodEnd,
    closing_at: input.closingAt,
  };
}

export async function insertCategory(admin: SupabaseClient, input: AwardCategoryInput): Promise<{ id: string | null; error: string | null }> {
  const { data, error } = await admin.from("award_categories").insert(toRow(input)).select("id").single();
  return { id: data?.id ?? null, error: error?.message ?? null };
}

export async function updateCategory(admin: SupabaseClient, id: string, input: AwardCategoryInput): Promise<{ error: string | null }> {
  const { error } = await admin.from("award_categories").update(toRow(input)).eq("id", id);
  return { error: error?.message ?? null };
}

export async function updateCategoryStatus(admin: SupabaseClient, id: string, status: AwardCategoryStatus): Promise<{ error: string | null }> {
  const { error } = await admin.from("award_categories").update({ status }).eq("id", id);
  return { error: error?.message ?? null };
}
