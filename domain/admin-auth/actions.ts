"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/data/supabase/server";

export type ActionState = { error: string | null };

/** Admin has its own login screen, separate from the student/school/judge
 * one — but the same Supabase Auth underneath (see domain/admin-auth/guard.ts
 * and the profiles.role = 'admin' check). Signing in here with a non-admin
 * account is rejected outright rather than silently landing them on /admin;
 * see domain/auth/actions.ts's login() for the mirror-image rejection on the
 * general login page. */
export async function adminLogin(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();

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
    await supabase.auth.signOut();
    return { error: "This account doesn't have admin access." };
  }

  redirect("/admin");
}

export async function adminLogout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
