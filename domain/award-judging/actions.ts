"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/data/supabase/server";
import { createAdminClient } from "@/data/supabase/admin";
import { getCurrentUser } from "@/domain/auth/session";
import { requireAdminSession } from "@/domain/admin-auth/guard";
import * as service from "./service";

export type ActionState = { error: string | null; success?: boolean };

export async function submitAwardScoreAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "judge") return { error: "Not authorized." };

  const supabase = await createClient();
  // Reading every judge's score for the disagreement check needs the
  // service-role client — a judge's own RLS grant only lets them read their
  // own award_scores row, not a second judge's, for the same nomination.
  const admin = createAdminClient();

  const keys = formData.getAll("criterion_key").map(String);
  const weights = formData.getAll("criterion_weight").map(Number);
  const values = formData.getAll("criterion_value").map(Number);

  const criteriaScores: Record<string, number> = {};
  let total = 0;
  keys.forEach((key, i) => {
    criteriaScores[key] = values[i] ?? 0;
    total += ((values[i] ?? 0) * (weights[i] ?? 0)) / 100;
  });

  const { error } = await service.submitScore(admin, supabase, {
    awardJudgeAssignmentId: String(formData.get("award_judge_assignment_id")),
    nominationId: String(formData.get("nomination_id")),
    criteriaScores,
    totalScore: Math.round(total),
    comments: String(formData.get("comments") ?? "") || null,
  });

  if (error) return { error };
  revalidatePath("/dashboard");
  return { error: null, success: true };
}

export async function assignJudgeAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const admin = createAdminClient();

  const { error } = await service.assignJudgeToCategory(admin, String(formData.get("judge_id")), String(formData.get("category_id")));
  if (error) return { error };

  revalidatePath("/admin/nominations");
  return { error: null, success: true };
}
