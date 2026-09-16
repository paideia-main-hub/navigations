import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminAccount } from "@/domain/admins/types";

type Row = { id: string; full_name: string; email: string; created_at: string };

function toAdmin(row: Row): AdminAccount {
  return { id: row.id, fullName: row.full_name, email: row.email, createdAt: row.created_at };
}

export async function listAdmins(admin: SupabaseClient): Promise<AdminAccount[]> {
  const { data, error } = await admin
    .from("profiles")
    .select("id, full_name, email, created_at")
    .eq("role", "admin")
    .order("created_at");
  if (error || !data) return [];
  return (data as Row[]).map(toAdmin);
}

/** Creates a new Supabase Auth user pre-confirmed and pre-assigned the admin
 * role, mirroring the student/school/judge sign-up path in
 * domain/auth/actions.ts — but deliberately never signs the *caller* in as
 * this new user (that would hijack the current admin's own session). */
export async function createAdmin(
  admin: SupabaseClient,
  input: { fullName: string; email: string; password: string },
): Promise<{ error: string | null }> {
  const { error } = await admin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: input.fullName, role: "admin" },
  });

  return { error: error?.message ?? null };
}
