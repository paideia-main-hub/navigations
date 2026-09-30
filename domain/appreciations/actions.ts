"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/data/supabase/admin";
import { requireAdminSession } from "@/domain/admin-auth/guard";
import * as service from "./service";

export type ActionState = { error: string | null; success?: boolean };

function revalidateAppreciations() {
  revalidatePath("/");
  revalidatePath("/admin/appreciations");
}

function inputFromForm(formData: FormData): { error: string; input?: undefined } | { error: null; input: service.AppreciationInput } {
  const heading = String(formData.get("heading") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const schoolNames = String(formData.get("school_names") ?? "").trim();
  const byLine = String(formData.get("by_line") ?? "").trim();
  if (!heading || !description || !schoolNames || !byLine) {
    return { error: "Heading, description, school names, and by are all required." };
  }
  return { error: null, input: { heading, description, schoolNames, byLine } };
}

export async function createAppreciationAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const parsed = inputFromForm(formData);
  if (parsed.error !== null) return { error: parsed.error };
  const { error } = await service.createAppreciation(createAdminClient(), parsed.input);
  if (error) return { error };
  revalidateAppreciations();
  return { error: null, success: true };
}

export async function updateAppreciationAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const parsed = inputFromForm(formData);
  if (parsed.error !== null) return { error: parsed.error };
  const id = String(formData.get("appreciation_id"));
  const { error } = await service.updateAppreciation(createAdminClient(), id, parsed.input);
  if (error) return { error };
  revalidateAppreciations();
  return { error: null, success: true };
}

export async function deleteAppreciationAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const id = String(formData.get("appreciation_id"));
  const { error } = await service.deleteAppreciation(createAdminClient(), id);
  if (error) return { error };
  revalidateAppreciations();
  return { error: null, success: true };
}
