// Domain layer: the current signed-in user and their profile/role. UI code
// (the dashboard layout/page) calls this instead of touching Supabase directly.

import { createClient } from "@/data/supabase/server";

export type UserRole = "student" | "school_coordinator" | "judge" | "admin" | "nominator";

export interface CurrentUser {
  id: string;
  email: string | null;
  fullName: string;
  role: UserRole;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email ?? null,
    fullName: profile?.full_name ?? user.email ?? "",
    role: (profile?.role as UserRole) ?? "student",
  };
}
