/** Extracts the object path inside the `competition-images` bucket from a
 * public Supabase Storage URL (object or render endpoint). */
export function competitionImageStoragePath(publicUrl: string): string | null {
  try {
    const { pathname } = new URL(publicUrl);
    const match = pathname.match(/\/competition-images\/(.+)$/);
    if (match?.[1]) return decodeURIComponent(match[1]);
  } catch {
    /* not an absolute URL — fall through */
  }

  const marker = "/competition-images/";
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  const path = decodeURIComponent(publicUrl.slice(idx + marker.length).split("?")[0] ?? "");
  return path || null;
}
