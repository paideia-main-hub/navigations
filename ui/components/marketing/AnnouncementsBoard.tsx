import type { ReactNode } from "react";
import type { Announcement } from "@/domain/announcements/types";
import { BandDivider } from "./BandDivider";
import { SectionHeading } from "./SectionHeading";
import { FlipStack, type FlipStackItem } from "./FlipStack";

function Icon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

const NOTICE_ICON = (
  <Icon path="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9ZM13.73 21a2 2 0 0 1-3.46 0" />
);

function toFlipStackItem(a: Announcement): FlipStackItem {
  return {
    eyebrow: a.competitionTitle ?? "Announcement",
    title: a.title,
    description: a.body,
    bgClassName: "bg-brand-deep",
    textClassName: "text-brand-deep-foreground",
    badge: a.isImportant ? "Pinned" : undefined,
    href: a.competitionSlug ? `/competitions/${a.competitionSlug}` : undefined,
    icon: NOTICE_ICON,
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
    // ancestor breaks sticky for every descendant.
    <div className="relative bg-surface-warm">
      <BandDivider shape="arc" side="top" color="text-background" />
      <div className="relative mx-auto max-w-7xl px-6 pt-24 lg:pt-28">
        <SectionHeading eyebrow="Announcements" title="Latest Announcements" action={{ href: "/announcements", label: "View all" }} />
      </div>

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
