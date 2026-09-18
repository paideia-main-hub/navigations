// Domain layer: the current signed-in user and their profile/role. UI code
// (the dashboard layout/page) calls this instead of touching Supabase directly.

import { cache } from "react";
import { createClient } from "@/data/supabase/server";

export type UserRole = "student" | "school_coordinator" | "judge" | "admin" | "nominator";

export interface CurrentUser {
  id: string;
  email: string | null;
  fullName: string;
  role: UserRole;
}

/** React's request-scoped cache — every layout and page in a route calls
 * this independently (e.g. app/dashboard/layout.tsx and every
 * app/dashboard/*\/page.tsx underneath it), and without this it re-ran
 * supabase.auth.getUser() (a real network round trip to Supabase's Auth
 * server, by design — it revalidates the JWT, unlike the unverified
 * getSession()) plus a second profiles query, every single time. cache()
 * de-dupes all of those into one call per request; a fresh request (a new
 * page load, a server action) still re-verifies normally. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
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
});
