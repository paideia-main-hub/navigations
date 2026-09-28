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
  registration: { bgClassName: "bg-accent", textClassName: "text-accent-foreground" },
  schedule: { bgClassName: "bg-blue-700", textClassName: "text-white" },
  venue: { bgClassName: "bg-violet-700", textClassName: "text-white" },
  manual_update: { bgClassName: "bg-slate-700", textClassName: "text-white" },
  results: { bgClassName: "bg-emerald-700", textClassName: "text-white" },
  final_round: { bgClassName: "bg-amber-600", textClassName: "text-white" },
  general: { bgClassName: "bg-brand-deep", textClassName: "text-brand-deep-foreground" },
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
      <div className="relative mx-auto max-w-7xl px-6 pt-24 pb-16 lg:pt-28">
        <SectionHeading eyebrow="Announcements" title="Latest Announcements" action={{ href: "/announcements", label: "View all" }} />

        {shown.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-surface/60 py-10 text-center text-sm text-muted">
            No announcements published yet.
          </p>
        ) : (
          <div className="mt-4">
            <FlipStack items={shown.map(toFlipStackItem)} />
          </div>
        )}
      </div>
    </div>
  );
}
