import { createBrowserClient } from "@supabase/ssr";

// TODO: parameterize with <Database> from ./database.types once real types
// are generated (see that file) — an empty placeholder type makes every
// table resolve to `never`, which is worse than no typing at all.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
