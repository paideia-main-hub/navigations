import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Legacy / deep-link login URL. Public login is the in-page modal — bounce
 * back to the page the visitor came from (or home) with ?login=1 so
 * LoginModalProvider opens it without forcing the homepage for in-place flows.
 */
function isPublicReturnPath(pathname: string): boolean {
  if (!pathname.startsWith("/") || pathname.startsWith("//")) return false;
  if (pathname === "/login" || pathname.startsWith("/login?")) return false;
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) return false;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return false;
  if (pathname === "/reset-password") return false;
  return true;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const headerStore = await headers();
  const referer = headerStore.get("referer");

  let returnPath = "/";
  if (referer) {
    try {
      const url = new URL(referer);
      const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
      const sameHost = !host || url.host === host || url.hostname === "localhost";
      if (sameHost && isPublicReturnPath(url.pathname)) {
        returnPath = url.pathname;
      }
    } catch {
      /* keep homepage */
    }
  }

  const params = new URLSearchParams();
  params.set("login", "1");
  if (next) params.set("next", next);
  if (error) params.set("error", error);
  redirect(`${returnPath}?${params.toString()}`);
}
