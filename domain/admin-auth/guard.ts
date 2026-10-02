// The admin panel has its own Supabase session, stored under a separate
// cookie (ADMIN_SESSION_COOKIE in data/supabase/server.ts), so signing in to
// /admin never replaces a student/school/judge session in the same browser —
// and vice versa. An admin is still a `profiles` row with role = 'admin'.
// Kept as its own module because ~15 admin server actions import
// requireAdminSession() directly.

import { cache } from "react";
import { redirect } from "next/navigation";
import { createAdminSessionClient } from "@/data/supabase/server";
import type { CurrentUser } from "@/domain/auth/session";

/** Reads the admin session and returns it only if that user is an admin,
 * without redirecting. Used by app/admin/(protected)/layout.tsx to decide
 * whether to render the shell or bounce to login. Request-scoped cached, like
 * getCurrentUser. */
export const getAdminSession = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createAdminSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).single();
  if (profile?.role !== "admin") return null;

  return { id: user.id, email: user.email ?? null, fullName: profile.full_name ?? user.email ?? "", role: "admin" };
});

/** Called at the top of every admin server action — never rely on the layout
 * gate alone, since a server action can be invoked directly regardless of
 * which page rendered the form that triggered it. */
export async function requireAdminSession(): Promise<CurrentUser> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}
