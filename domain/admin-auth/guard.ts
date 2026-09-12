import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, verifySession } from "./session";

/** Reads and verifies the admin session cookie, without redirecting. Used by
 * app/admin/layout.tsx to decide whether to render the shell or bounce to login. */
export async function getAdminSession() {
  const cookieStore = await cookies();
  return verifySession(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
}

/** Called at the top of every admin server action — never rely on the layout
 * gate alone, since a server action can be invoked directly regardless of
 * which page rendered the form that triggered it. */
export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}
