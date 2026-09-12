"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import * as service from "./service";

export type ActionState = { error: string | null; success?: boolean };

export async function submitScoreAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "judge") return { error: "Not authorized." };

  const supabase = await createClient();

  const names = formData.getAll("criterion_name").map(String);
  const weights = formData.getAll("criterion_weight").map(Number);
  const values = formData.getAll("criterion_value").map(Number);

  const criteriaScores: Record<string, number> = {};
  let total = 0;
  names.forEach((name, i) => {
    criteriaScores[name] = values[i] ?? 0;
    total += ((values[i] ?? 0) * (weights[i] ?? 0)) / 100;
  });

  const { error } = await service.submitScore(supabase, {
    judgeAssignmentId: String(formData.get("judge_assignment_id")),
    registrationId: String(formData.get("registration_id")),
    criteriaScores,
    totalScore: Math.round(total),
    comments: String(formData.get("comments") ?? "") || null,
  });

  if (error) return { error };
  revalidatePath("/dashboard");
  return { error: null, success: true };
}
