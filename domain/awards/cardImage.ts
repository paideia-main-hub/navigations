/**
 * Prefer the admin-uploaded URL; otherwise the static WebP under public/awards.
 */
export function resolveAwardCardImage(imageUrl: string | null | undefined, slug: string): string {
  if (imageUrl && !imageUrl.startsWith("/awards/")) return imageUrl;
  return `/awards/${slug}.webp`;
}
