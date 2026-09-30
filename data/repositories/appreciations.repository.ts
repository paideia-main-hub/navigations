import type { SupabaseClient } from "@supabase/supabase-js";
import type { Appreciation } from "@/domain/appreciations/types";

type Row = {
  id: string;
  heading: string;
  description: string;
  school_names: string;
  by_line: string;
};

const SELECT = "id, heading, description, school_names, by_line";

function toAppreciation(row: Row): Appreciation {
  return {
    id: row.id,
    heading: row.heading,
    description: row.description,
    schoolNames: row.school_names,
    byLine: row.by_line,
  };
}

export async function listAppreciations(supabase: SupabaseClient): Promise<Appreciation[]> {
  const { data, error } = await supabase.from("appreciations").select(SELECT).order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as Row[]).map(toAppreciation);
}

export interface AppreciationInput {
  heading: string;
  description: string;
  schoolNames: string;
  byLine: string;
}

export async function insertAppreciation(admin: SupabaseClient, input: AppreciationInput): Promise<{ error: string | null }> {
  const { error } = await admin.from("appreciations").insert({
    heading: input.heading,
    description: input.description,
    school_names: input.schoolNames,
    by_line: input.byLine,
  });
  return { error: error?.message ?? null };
}

export async function updateAppreciation(
  admin: SupabaseClient,
  id: string,
  input: AppreciationInput,
): Promise<{ error: string | null }> {
  const { error } = await admin
    .from("appreciations")
    .update({
      heading: input.heading,
      description: input.description,
      school_names: input.schoolNames,
      by_line: input.byLine,
    })
    .eq("id", id);
  return { error: error?.message ?? null };
}

export async function deleteAppreciation(admin: SupabaseClient, id: string): Promise<{ error: string | null }> {
  const { error } = await admin.from("appreciations").delete().eq("id", id);
  return { error: error?.message ?? null };
}
