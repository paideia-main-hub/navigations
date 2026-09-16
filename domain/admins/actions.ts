"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/data/supabase/admin";
import { requireAdminSession } from "@/domain/admin-auth/guard";
import * as service from "./service";

export type ActionState = { error: string | null; success?: boolean };

export async function createAdminAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const admin = createAdminClient();

  const { error } = await service.createAdmin(admin, {
    fullName: String(formData.get("full_name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (error) return { error };
  revalidatePath("/admin/admins");
  return { error: null, success: true };
}
