import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE } from "./cookies";

type CookieToSet = { name: string; value: string; options?: Parameters<NextResponse["cookies"]["set"]>[2] };

// TODO: parameterize with <Database> from ./database.types once real types are generated.
/** Refreshes both Supabase sessions on every request: the dashboard session
 * (default cookie) and, when present, the admin panel's own session
 * (ADMIN_SESSION_COOKIE). Server Components can't write cookies, so expiring
 * tokens must be renewed here. Cookies from both clients are collected and
 * applied to a single response, so neither refresh overwrites the other. */
export async function updateSession(request: NextRequest) {
  // Supabase isn't connected yet in this environment — skip session refresh
  // rather than crashing every request. Remove this guard once .env.local is set.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next({ request });
  }

  const toSet: CookieToSet[] = [];

  const refresh = async (cookieName?: string) => {
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      ...(cookieName ? { cookieOptions: { name: cookieName } } : {}),
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            toSet.push({ name, value, options });
          });
        },
      },
    });
    // Refreshes the auth token if expired. Do not add logic between
    // createServerClient and this call — it can break session refresh.
    await supabase.auth.getUser();
  };

  const hasAdminCookie = request.cookies.getAll().some((c) => c.name.startsWith(ADMIN_SESSION_COOKIE));
  // Refresh both sessions in parallel — serial round-trips made every admin
  // navigation wait on two Supabase auth calls back-to-back.
  await Promise.all([refresh(), hasAdminCookie ? refresh(ADMIN_SESSION_COOKIE) : Promise.resolve()]);

  const response = NextResponse.next({ request });
  toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
  return response;
}
