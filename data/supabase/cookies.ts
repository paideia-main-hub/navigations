/** Cookie name for the admin panel's own Supabase session. The admin panel
 * signs in separately from students/schools/judges, so an admin and a student
 * can be signed in side by side in one browser without one login replacing
 * the other (which used to make a student's dashboard suddenly render as the
 * admin account). Every other role uses Supabase's default cookie.
 *
 * Kept in its own module so the middleware (data/supabase/proxy.ts) can import
 * it without pulling in next/headers. */
export const ADMIN_SESSION_COOKIE = "sb-navigations-admin";
