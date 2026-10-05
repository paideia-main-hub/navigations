import { redirect } from "next/navigation";

/**
 * Legacy / deep-link login URL. Public login is the in-page modal — bounce
 * here to the homepage with ?login=1 so LoginModalProvider opens it.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const params = new URLSearchParams();
  params.set("login", "1");
  if (next) params.set("next", next);
  if (error) params.set("error", error);
  redirect(`/?${params.toString()}`);
}
