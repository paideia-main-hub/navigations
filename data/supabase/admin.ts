import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

// Service-role client — bypasses RLS. Server-only: never import this from a
// Client Component or anything reachable from the browser bundle. Used here
// solely to auto-confirm a brand-new user's email so sign-up doesn't depend
// on an outbound confirmation email actually arriving (Supabase's free-tier
// shared email sender has a very low rate limit).
//
// One client per warm server process — rebuilding it on every page load adds
// needless work under the admin console's frequent navigations.
let adminClient: SupabaseClient | null = null;

export function createAdminClient() {
  if (adminClient) return adminClient;
  adminClient = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return adminClient;
}
