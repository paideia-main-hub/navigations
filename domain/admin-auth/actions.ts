"use server";

import { redirect } from "next/navigation";
import { createAdminSessionClient } from "@/data/supabase/server";

export type ActionState = { error: string | null };

/** Admin has its own login screen and its own session cookie, separate from
 * the student/school/judge one (see domain/admin-auth/guard.ts) — so signing
 * in here never logs anyone out of the dashboard in another tab. Signing in
 * with a non-admin account is rejected outright rather than silently landing
 * them on /admin; see domain/auth/actions.ts's login() for the mirror-image
 * rejection on the general login page. */
export async function adminLogin(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createAdminSessionClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (error) return { error: error.message };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };

  if (profile?.role !== "admin") {
    await supabase.auth.signOut({ scope: "local" });
    return { error: "This account doesn't have admin access." };
  }

  redirect("/admin");
}

/** Signs out of the admin panel only (scope "local"), leaving any other
 * session in the browser untouched, then returns to the homepage. */
export async function adminLogout() {
  const supabase = await createAdminSessionClient();
  await supabase.auth.signOut({ scope: "local" });
  redirect("/");
}

/** Changes the signed-in admin's own password (Admin → Account). Uses the
 * admin session, not the dashboard one, so it can never change a student's
 * password that happens to be signed in in another tab. */
export async function adminUpdatePassword(_prevState: ActionState, formData: FormData): Promise<ActionState & { success?: boolean }> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== confirmPassword) return { error: "Passwords do not match." };

  const supabase = await createAdminSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  return { error: null, success: true };
}
