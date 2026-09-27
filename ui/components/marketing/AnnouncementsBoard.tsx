import Link from "next/link";
import type { ReactNode } from "react";
import type { Announcement, AnnouncementCategory } from "@/domain/announcements/types";
import { announcementCategoryLabels } from "@/domain/announcements/types";
import { BandDivider } from "./BandDivider";
import { SectionHeading } from "./SectionHeading";

const icons: Record<string, ReactNode> = {
  megaphone: <path d="M3 11v2a1 1 0 0 0 1 1h1l4 5v-6M3 11l6-4v10M3 11h6M14 6a5 5 0 0 1 0 12M17 3a8 8 0 0 1 0 18" />,
  clock: <path d="M12 8v4l3 3M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />,
  pin: <path d="M12 22s7-7.58 7-13a7 7 0 1 0-14 0c0 5.42 7 13 7 13Zm0-10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />,
  book: <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15Z" />,
  trophy: <path d="M8 21h8m-4-4v4m-6-17h12v5a6 6 0 0 1-12 0V4Zm0 2H4a2 2 0 0 0 0 4h2m12-4h2a2 2 0 0 1 0 4h-2" />,
  flag: <path d="M4 22V4m0 0h13l-2.5 4L17 12H4" />,
};

const CATEGORY_STYLE: Record<AnnouncementCategory, { tone: string; icon: string }> = {
  registration: { tone: "text-accent-strong bg-accent-soft", icon: "pin" },
  schedule: { tone: "text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-500/10", icon: "clock" },
  venue: { tone: "text-violet-700 bg-violet-50 dark:text-violet-300 dark:bg-violet-500/10", icon: "pin" },
  manual_update: { tone: "text-muted bg-surface-muted", icon: "book" },
  results: { tone: "text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-500/10", icon: "trophy" },
  final_round: { tone: "text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-500/10", icon: "flag" },
  general: { tone: "text-muted bg-surface-muted", icon: "megaphone" },
};

function CategoryIcon({ name, className }: { name: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {icons[name]}
    </svg>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function FeaturedCard({ a }: { a: Announcement }) {
  const style = CATEGORY_STYLE[a.category];
  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-border bg-surface p-8 shadow-[0_25px_55px_-30px_rgba(31,32,65,0.45)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_34px_65px_-28px_rgba(31,32,65,0.55)] sm:p-10">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 -right-10 h-56 w-56 rounded-full bg-accent/[0.07] blur-[90px]"
      />
      <div className="relative flex items-center gap-3">
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${style.tone}`}>
          <CategoryIcon name={style.icon} className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-muted uppercase">{announcementCategoryLabels[a.category]}</p>
          {formatDate(a.publishDate) && <p className="text-xs text-muted/80">{formatDate(a.publishDate)}</p>}
        </div>
        {a.isImportant && (
          <span className="ml-auto rounded-full bg-accent px-2.5 py-1 text-[10px] font-black tracking-wide text-accent-foreground uppercase">
            Pinned
          </span>
        )}
      </div>

      <p className="relative mt-6 text-2xl leading-tight font-extrabold text-balance text-foreground sm:text-3xl">{a.title}</p>
      <p className="relative mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">{a.body}</p>

      {a.competitionTitle && (
        <p className="relative mt-6 text-sm font-semibold text-accent-strong">{a.competitionTitle} →</p>
      )}
    </div>
  );
}

function ListCard({ a }: { a: Announcement }) {
  const style = CATEGORY_STYLE[a.category];
  return (
    <li className="group relative flex gap-4 overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-[0_14px_30px_-24px_rgba(31,32,65,0.4)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_22px_40px_-24px_rgba(255,105,31,0.3)]">
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${style.tone}`}>
        <CategoryIcon name={style.icon} className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">{announcementCategoryLabels[a.category]}</p>
          {formatDate(a.publishDate) && <p className="text-[11px] text-muted/70">· {formatDate(a.publishDate)}</p>}
        </div>
        <p className="mt-1 line-clamp-1 font-bold text-foreground">{a.title}</p>
        <p className="mt-1 line-clamp-2 text-sm text-muted">{a.body}</p>
      </div>
    </li>
  );
}

export function AnnouncementsBoard({ announcements }: { announcements: Announcement[] }) {
  const shown = announcements.slice(0, 6);
  const [featured, ...rest] = shown;

  return (
    <div className="relative overflow-hidden bg-surface-warm">
      <BandDivider shape="arc" side="top" color="text-background" />
      <div className="relative mx-auto max-w-7xl px-6 pt-24 pb-16 lg:pt-28">
        <SectionHeading eyebrow="Announcements" title="Latest Announcements" action={{ href: "/announcements", label: "View all" }} />

        {shown.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-surface/60 py-10 text-center text-sm text-muted">
            No announcements published yet.
          </p>
        ) : rest.length === 0 ? (
          // Just the one announcement so far — full width, rather than a
          // lopsided grid with an empty second column.
          <FeaturedCard a={featured} />
        ) : (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            <FeaturedCard a={featured} />
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {rest.map((a) => (
                <ListCard key={a.id} a={a} />
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
