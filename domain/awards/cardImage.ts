/**
 * Prefer the admin-uploaded URL; otherwise the static WebP under public/awards.
 */
export function resolveAwardCardImage(imageUrl: string | null | undefined, slug: string): string {
  if (imageUrl && !imageUrl.startsWith("/awards/")) return imageUrl;
  return `/awards/${slug}.webp`;
}

/** Attach admin `image_url` values (by slug) onto static award card copy. */
export function withAwardCardImages<T extends { slug: string }>(
  awards: T[],
  categories: Iterable<{ slug: string; imageUrl: string | null }>,
): Array<T & { imageUrl: string | null }> {
  const imageBySlug = new Map<string, string | null>();
  for (const c of categories) imageBySlug.set(c.slug, c.imageUrl);
  return awards.map((award) => ({
    ...award,
    imageUrl: imageBySlug.get(award.slug) ?? null,
  }));
}
