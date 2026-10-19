import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { listCategories } from "@/domain/awards/service";
import { listPublicCompetitions } from "@/domain/competitions/service";
import { absoluteUrl } from "@/lib/seo";

/** Revalidate hourly so new competitions/awards appear without a full redeploy. */
export const revalidate = 3600;

const STATIC_PATHS: {
  path: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priority: number;
}[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/about-us", changeFrequency: "monthly", priority: 0.8 },
  { path: "/competency-vision", changeFrequency: "monthly", priority: 0.7 },
  { path: "/competitions", changeFrequency: "weekly", priority: 0.9 },
  { path: "/calendar", changeFrequency: "weekly", priority: 0.8 },
  { path: "/awards", changeFrequency: "weekly", priority: 0.8 },
  { path: "/awards/results", changeFrequency: "weekly", priority: 0.7 },
  { path: "/results", changeFrequency: "weekly", priority: 0.8 },
  { path: "/manuals", changeFrequency: "monthly", priority: 0.7 },
  { path: "/resources", changeFrequency: "monthly", priority: 0.7 },
  { path: "/announcements", changeFrequency: "weekly", priority: 0.7 },
  { path: "/schools", changeFrequency: "monthly", priority: 0.8 },
  { path: "/students", changeFrequency: "monthly", priority: 0.8 },
  { path: "/register", changeFrequency: "monthly", priority: 0.8 },
  { path: "/faqs", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.5 },
];

function publicSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  // Cookie-less anon client — sitemap has no request session; using the
  // server SSR client (cookies()) was crashing this route with HTTP 500.
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function safeDate(value: string | null | undefined, fallback: Date): Date {
  if (!value) return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((entry) => ({
    url: absoluteUrl(entry.path),
    lastModified: now,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));

  const supabase = publicSupabase();
  if (!supabase) return staticEntries;

  try {
    const [competitions, categories] = await Promise.all([
      listPublicCompetitions(supabase),
      listCategories(supabase),
    ]);

    const competitionEntries: MetadataRoute.Sitemap = competitions.map((c) => ({
      url: absoluteUrl(`/competitions/${c.slug}`),
      lastModified: safeDate(c.updatedAt, now),
      changeFrequency: "weekly",
      priority: 0.85,
    }));

    const awardEntries: MetadataRoute.Sitemap = categories
      .filter((c) => c.status !== "draft")
      .map((c) => ({
        url: absoluteUrl(`/awards/${c.slug}`),
        lastModified: safeDate(c.updatedAt, now),
        changeFrequency: "weekly",
        priority: 0.75,
      }));

    return [...staticEntries, ...competitionEntries, ...awardEntries];
  } catch {
    return staticEntries;
  }
}
