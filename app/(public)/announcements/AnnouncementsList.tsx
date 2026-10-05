import Link from "next/link";
import type { Announcement } from "@/domain/announcements/types";
import { ArenaBadge } from "@/ui/components/marketing/ArenaBadge";

export function AnnouncementsList({ announcements }: { announcements: Announcement[] }) {
  return (
    <div className="space-y-4">
      {announcements.map((a) => (
        <div key={a.id} className="rounded-xl border border-border bg-surface p-4">
          <div className="flex flex-wrap items-center gap-2">
            {a.isImportant ? <ArenaBadge tone="blue">Pinned</ArenaBadge> : null}
            {a.competitionTitle ? (
              <Link href={`/competitions/${a.competitionSlug}`} className="text-xs font-medium text-accent-strong">
                {a.competitionTitle}
              </Link>
            ) : (
              <span className="text-xs text-muted">Site-wide</span>
            )}
          </div>
          <p className="mt-2 font-semibold text-foreground">{a.title}</p>
          <p className="mt-1 text-sm text-muted">{a.body}</p>
        </div>
      ))}
      {announcements.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">No announcements published yet.</p>
      ) : null}
    </div>
  );
}
