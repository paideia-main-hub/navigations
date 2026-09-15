"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Announcement, AnnouncementCategory } from "@/domain/announcements/types";
import { announcementCategoryLabels } from "@/domain/announcements/types";
import { ArenaBadge } from "@/ui/components/marketing/ArenaBadge";

export function AnnouncementsList({ announcements }: { announcements: Announcement[] }) {
  const [category, setCategory] = useState<AnnouncementCategory | "all">("all");
  const filtered = useMemo(
    () => (category === "all" ? announcements : announcements.filter((a) => a.category === category)),
    [announcements, category],
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategory("all")}
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            category === "all" ? "bg-blue-600 text-white" : "bg-white text-slate-600 dark:bg-slate-900 dark:text-slate-300"
          }`}
        >
          All
        </button>
        {Object.entries(announcementCategoryLabels).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setCategory(value as AnnouncementCategory)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              category === value ? "bg-blue-600 text-white" : "bg-white text-slate-600 dark:bg-slate-900 dark:text-slate-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-8 space-y-4">
        {filtered.map((a) => (
          <div key={a.id} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center gap-2">
              <ArenaBadge tone={a.isImportant ? "blue" : "neutral"}>{announcementCategoryLabels[a.category]}</ArenaBadge>
              {a.competitionTitle && (
                <Link href={`/competitions/${a.competitionSlug}`} className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  {a.competitionTitle}
                </Link>
              )}
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {new Date(a.publishDate).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
              </span>
            </div>
            <p className="mt-2 font-semibold text-slate-900 dark:text-slate-100">{a.title}</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{a.body}</p>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">No announcements in this category yet.</p>
        )}
      </div>
    </div>
  );
}
