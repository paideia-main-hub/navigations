"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/data/supabase/server";
import { createAdminClient } from "@/data/supabase/admin";
import { getCurrentUser } from "@/domain/auth/session";
import { requireAdminSession, getAdminSession } from "@/domain/admin-auth/guard";
import * as service from "./service";
import type { InterviewMode } from "./types";

export type ActionState = { error: string | null; success?: boolean };

export async function applyToJudgeAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "judge") return { error: "Not authorized." };

  const supabase = await createClient();
  const { error } = await service.applyToJudge(supabase, user.id, String(formData.get("competition_id")));

  if (error) return { error };
  revalidatePath("/dashboard");
  return { error: null, success: true };
}

export async function scheduleInterviewAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const admin = createAdminClient();
  const id = String(formData.get("application_id"));

  const { error } = await service.scheduleInterview(admin, id, {
    mode: String(formData.get("mode")) as InterviewMode,
    at: String(formData.get("interview_at")),
    location: String(formData.get("location") ?? ""),
  });

  if (error) return { error };
  revalidatePath("/admin/judge-applications");
  return { error: null, success: true };
}

export async function approveApplicationAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const admin = createAdminClient();
  const id = String(formData.get("application_id"));

  // reviewed_by is a FK to profiles(id) — the hardcoded admin has no
  // Supabase Auth identity/profile row, so there's nothing valid to store
  // here (left null, same treatment as audit_logs.actor_id elsewhere).
  const { error } = await service.approveApplication(admin, id, null);
  if (error) return { error };
  revalidatePath("/admin/judge-applications");
  return { error: null, success: true };
}

export async function rejectApplicationAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getAdminSession();
  if (!session) return { error: "Not authorized." };
  const admin = createAdminClient();
  const id = String(formData.get("application_id"));

  const { error } = await service.rejectApplication(admin, id, String(formData.get("notes") ?? "") || null, null);
  if (error) return { error };
  revalidatePath("/admin/judge-applications");
  return { error: null, success: true };
}
