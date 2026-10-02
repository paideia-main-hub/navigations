/** Extracts the object path inside the `award-images` bucket from a public
 * Supabase Storage URL (object or render endpoint). */
export function awardImageStoragePath(publicUrl: string): string | null {
  try {
    const { pathname } = new URL(publicUrl);
    const match = pathname.match(/\/award-images\/(.+)$/);
    if (match?.[1]) return decodeURIComponent(match[1]);
  } catch {
    /* not an absolute URL — fall through */
  }

  const marker = "/award-images/";
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  const path = decodeURIComponent(publicUrl.slice(idx + marker.length).split("?")[0] ?? "");
  return path || null;
}
