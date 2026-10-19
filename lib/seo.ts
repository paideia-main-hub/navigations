import type { Metadata } from "next";

/** Public site origin — set NEXT_PUBLIC_SITE_URL in production (e.g. https://navigations.com.pk). */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  return "https://navigations.com.pk";
}

export const SITE_NAME = "Navigations";
export const SITE_TAGLINE = "Where opportunities lead";

export const DEFAULT_DESCRIPTION =
  "Future Ready League competitions, registration, practice resources, awards, and results for schools and students across Pakistan.";

/** Shared OG image — public brand mark. */
export const DEFAULT_OG_IMAGE = "/future-ready-league.png";

export function absoluteUrl(path = "/"): string {
  if (!path || path === "/") return getSiteUrl();
  if (/^https?:\/\//i.test(path)) return path;
  const base = getSiteUrl();
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Plain-text snippet for meta descriptions (strips markup, collapses whitespace). */
export function metaDescription(text: string | null | undefined, max = 160): string {
  if (!text) return DEFAULT_DESCRIPTION;
  const plain = text
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max - 1).trimEnd()}…`;
}

type PageMetaInput = {
  title: string;
  description?: string;
  path: string;
  image?: string | null;
  noIndex?: boolean;
};

/** Consistent title/description/canonical/OG/Twitter for a public page. */
export function pageMetadata({ title, description, path, image, noIndex }: PageMetaInput): Metadata {
  const desc = description ? metaDescription(description) : DEFAULT_DESCRIPTION;
  const url = absoluteUrl(path);
  const ogImage = absoluteUrl(image || DEFAULT_OG_IMAGE);
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  return {
    title,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: fullTitle,
      description: desc,
      url,
      images: [{ url: ogImage, alt: `${SITE_NAME} — ${SITE_TAGLINE}` }],
      locale: "en_PK",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: desc,
      images: [ogImage],
    },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: SITE_NAME,
    alternateName: "Future Ready League",
    url: getSiteUrl(),
    logo: absoluteUrl(DEFAULT_OG_IMAGE),
    description: DEFAULT_DESCRIPTION,
    email: "admin@navigations.com.pk",
    telephone: "+92-320-7000760",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Plot 20, Block J 2, Wapda Town, Phase 1",
      addressLocality: "Lahore",
      postalCode: "54770",
      addressCountry: "PK",
    },
    sameAs: [
      "https://www.facebook.com/NAVIGATIONS.EDU",
      "https://www.instagram.com/navigations10/",
    ],
  };
}

export function faqPageJsonLd(items: ReadonlyArray<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: metaDescription(item.answer, 500),
      },
    })),
  };
}

export function competitionJsonLd(input: {
  title: string;
  description: string;
  slug: string;
  imageUrl?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: input.title,
    description: metaDescription(input.description, 300),
    url: absoluteUrl(`/competitions/${input.slug}`),
    image: absoluteUrl(input.imageUrl || DEFAULT_OG_IMAGE),
    eventAttendanceMode: "https://schema.org/MixedEventAttendanceMode",
    organizer: {
      "@type": "Organization",
      name: SITE_NAME,
      url: getSiteUrl(),
    },
  };
}
