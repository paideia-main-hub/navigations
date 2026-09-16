// Admin gating now rides on the same Supabase Auth session as every other
// role — an admin is just a `profiles` row with role = 'admin' (see
// is_admin() and the profiles RLS policies in supabase/migrations/0001).
// Kept as its own module (rather than inlined at each call site) because
// ~15 admin server actions import requireAdminSession() directly.

import { redirect } from "next/navigation";
import { getCurrentUser, type CurrentUser } from "@/domain/auth/session";

/** Reads the current session and returns it only if the user is an admin,
 * without redirecting. Used by app/admin/(protected)/layout.tsx to decide
 * whether to render the shell or bounce to login. */
export async function getAdminSession(): Promise<CurrentUser | null> {
  const user = await getCurrentUser();
  return user && user.role === "admin" ? user : null;
}

/** Called at the top of every admin server action — never rely on the layout
 * gate alone, since a server action can be invoked directly regardless of
 * which page rendered the form that triggered it. */
export async function requireAdminSession(): Promise<CurrentUser> {
  const session = await getAdminSession();
  if (!session) redirect("/login");
  return session;
}
