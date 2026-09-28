import type { ReactNode } from "react";
import type { Announcement, AnnouncementCategory } from "@/domain/announcements/types";
import { announcementCategoryLabels } from "@/domain/announcements/types";
import { BandDivider } from "./BandDivider";
import { SectionHeading } from "./SectionHeading";
import { FlipStack, type FlipStackItem } from "./FlipStack";

/** category -> flip-stack card treatment. These cards are bold, fixed-tone
 * blocks (like the brand-deep bands elsewhere) rather than themed
 * light/dark surfaces, so seven categories can stay visually distinct —
 * the same reason the older badge treatment reached past the brand palette
 * for schedule/venue/results/final_round. */
const CATEGORY_CARD: Record<AnnouncementCategory, { bgClassName: string; textClassName: string }> = {
  registration: { bgClassName: "bg-accent-strong", textClassName: "text-white" },
  schedule: { bgClassName: "bg-blue-800", textClassName: "text-white" },
  venue: { bgClassName: "bg-violet-800", textClassName: "text-white" },
  manual_update: { bgClassName: "bg-slate-800", textClassName: "text-white" },
  results: { bgClassName: "bg-emerald-800", textClassName: "text-white" },
  final_round: { bgClassName: "bg-amber-800", textClassName: "text-white" },
  general: { bgClassName: "bg-brand-deep", textClassName: "text-brand-deep-foreground" },
};

function Icon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

/** category -> the giant watermark FlipStack renders behind the text —
 * purely decorative, so a loose visual match ("this reads as venue/results/
 * etc.") is all it needs. */
const CATEGORY_ICON: Record<AnnouncementCategory, ReactNode> = {
  registration: <Icon path="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm10-4v6m3-3h-6" />,
  schedule: <Icon path="M8 2v4m8-4v4M3 10h18M5 6h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />,
  venue: <Icon path="M12 22s7-7.05 7-12A7 7 0 1 0 5 10c0 4.95 7 12 7 12Zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />,
  manual_update: <Icon path="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7l-5-5Zm0 0v5h5M9 13h6M9 17h4" />,
  results: <Icon path="M8 21h8m-4-4v4m-6-17h12v5a6 6 0 0 1-12 0V4Zm0 2H4a2 2 0 0 0 0 4h2m12-4h2a2 2 0 0 1 0 4h-2" />,
  final_round: <Icon path="m12 2.6 2.9 5.9 6.5.9-4.7 4.6 1.1 6.4-5.8-3-5.8 3 1.1-6.4L2.6 9.4l6.5-.9L12 2.6Z" />,
  general: <Icon path="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9ZM13.73 21a2 2 0 0 1-3.46 0" />,
};

function toFlipStackItem(a: Announcement): FlipStackItem {
  const style = CATEGORY_CARD[a.category];
  return {
    eyebrow: announcementCategoryLabels[a.category],
    title: a.title,
    description: a.body,
    bgClassName: style.bgClassName,
    textClassName: style.textClassName,
    badge: a.isImportant ? "Pinned" : undefined,
    href: a.competitionSlug ? `/competitions/${a.competitionSlug}` : undefined,
    icon: CATEGORY_ICON[a.category],
  };
}

export function AnnouncementsBoard({ announcements }: { announcements: Announcement[] }): ReactNode {
  // Pinned ones already sort first (data/repositories/announcements.repository.ts),
  // so capping to the front of the list keeps whichever is pinned as
  // card 01 — the first thing revealed when the stack starts flipping.
  const shown = announcements.slice(0, 4);

  return (
    // Deliberately no overflow-hidden: FlipStack pins its stage with
    // `position: sticky`, and an `overflow` other than visible on ANY
    // ancestor breaks sticky for every descendant, even one that never
    // scrolls its own content (see the same fix on the Curtain wrapper and
    // UpcomingEventsBoard's section in app/(public)/page.tsx). BandDivider's
    // arc shape is `inset-x-0 top-0` with a bounded height, fully inside
    // this section's own box, so it doesn't actually need clipping to
    // render correctly.
    <div className="relative bg-surface-warm">
      <BandDivider shape="arc" side="top" color="text-background" />
      <div className="relative mx-auto max-w-7xl px-6 pt-24 lg:pt-28">
        <SectionHeading eyebrow="Announcements" title="Latest Announcements" action={{ href: "/announcements", label: "View all" }} />
      </div>

      {/* Full-bleed, not capped to max-w-7xl like the heading above — the
          stack itself is the point of this section, so it should use the
          width a wide viewport actually has instead of leaving both sides
          empty. */}
      {shown.length === 0 ? (
        <div className="mx-auto max-w-7xl px-6 pb-16">
          <p className="rounded-2xl border border-dashed border-border bg-surface/60 py-10 text-center text-sm text-muted">
            No announcements published yet.
          </p>
        </div>
      ) : (
        <div className="mt-4 pb-16">
          <FlipStack items={shown.map(toFlipStackItem)} />
        </div>
      )}
    </div>
  );
}
