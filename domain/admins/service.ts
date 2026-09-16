import type { SupabaseClient } from "@supabase/supabase-js";
import * as repo from "@/data/repositories/admins.repository";
import type { AdminAccount, CreateAdminInput } from "./types";

export async function listAdmins(admin: SupabaseClient): Promise<AdminAccount[]> {
  return repo.listAdmins(admin);
}

export async function createAdmin(admin: SupabaseClient, input: CreateAdminInput): Promise<{ error: string | null }> {
  if (input.password.length < 8) return { error: "Password must be at least 8 characters." };
  return repo.createAdmin(admin, input);
}
