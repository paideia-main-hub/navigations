import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE } from "./cookies";

export { ADMIN_SESSION_COOKIE };

// TODO: parameterize with <Database> from ./database.types once real types
// are generated (see that file) — an empty placeholder type makes every
// table resolve to `never`, which is worse than no typing at all.
export async function createClient() {
  return createSessionClient();
}

/** The admin panel's session (see ADMIN_SESSION_COOKIE) — used only by the
 * admin login/logout/password actions and the admin guard. Admin data access
 * itself goes through the service-role client (./admin.ts). */
export async function createAdminSessionClient() {
  return createSessionClient(ADMIN_SESSION_COOKIE);
}

async function createSessionClient(cookieName?: string) {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      ...(cookieName ? { cookieOptions: { name: cookieName } } : {}),
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll called from a Server Component — safe to ignore because
            // proxy.ts already refreshes the session for every request.
          }
        },
      },
    },
  );
}
