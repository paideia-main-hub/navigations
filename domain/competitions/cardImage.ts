/**
 * Returns a usable public card image URL, or null when none is set / the value
 * still points at the removed local fallbacks under /competitions/*.webp.
 */
export function resolveCompetitionCardImage(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("/competitions/")) return null;
  return imageUrl;
}
