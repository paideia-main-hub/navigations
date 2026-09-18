"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/data/supabase/admin";
import { requireAdminSession } from "@/domain/admin-auth/guard";
import * as service from "./service";

export type ActionState = { error: string | null; success?: boolean; message?: string };

export async function recomputeSchoolAwardsAction(_prevState: ActionState): Promise<ActionState> {
  await requireAdminSession();
  const admin = createAdminClient();

  const { error, schoolsScored } = await service.recomputeSchoolAwards(admin);
  if (error) return { error };

  revalidatePath("/admin/school-awards");
  return { error: null, success: true, message: `Recomputed standings for ${schoolsScored} school(s).` };
}

export async function publishSchoolAwardAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const admin = createAdminClient();

  const { error } = await service.publishResults(admin, String(formData.get("category_id")));
  if (error) return { error };

  revalidatePath("/admin/school-awards");
  revalidatePath("/awards/results");
  return { error: null, success: true };
}

export async function setCollaborationScoreAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const admin = createAdminClient();

  const { error } = await service.setCollaborationScore(
    admin,
    String(formData.get("school_id")),
    String(formData.get("category_id")),
    Number(formData.get("score")) || 0,
  );
  if (error) return { error };

  revalidatePath("/admin/school-awards");
  return { error: null, success: true };
}
