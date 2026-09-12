"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { filterAnnouncements } from "@/domain/announcements/service";
import { announcementCategoryLabels, type AnnouncementCategory } from "@/domain/announcements/types";
import { Badge } from "@/ui/components/Badge";

export function AnnouncementsList() {
  const [category, setCategory] = useState<AnnouncementCategory | "all">("all");
  const announcements = useMemo(() => filterAnnouncements(category), [category]);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategory("all")}
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            category === "all" ? "bg-accent-soft text-accent" : "bg-surface-muted text-muted"
          }`}
        >
          All
        </button>
        {Object.entries(announcementCategoryLabels).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setCategory(value as AnnouncementCategory)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              category === value ? "bg-accent-soft text-accent" : "bg-surface-muted text-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-8 space-y-4">
        {announcements.map((a) => (
          <div key={a.id} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={a.isImportant ? "accent" : "neutral"}>{announcementCategoryLabels[a.category]}</Badge>
              {a.competitionTitle && (
                <Link href={`/competitions/${a.competitionSlug}`} className="text-xs font-medium text-accent">
                  {a.competitionTitle}
                </Link>
              )}
              <span className="text-xs text-muted">
                {new Date(a.publishDate).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
              </span>
            </div>
            <p className="mt-2 font-semibold text-foreground">{a.title}</p>
            <p className="mt-1 text-sm text-muted">{a.body}</p>
          </div>
        ))}
        {announcements.length === 0 && (
          <p className="py-12 text-center text-sm text-muted">No announcements in this category yet.</p>
        )}
      </div>
    </div>
  );
}
