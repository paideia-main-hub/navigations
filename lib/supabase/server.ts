import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// TODO: parameterize with <Database> from ./database.types once real types
// are generated (see that file) — an empty placeholder type makes every
// table resolve to `never`, which is worse than no typing at all.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
