"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { COMPETENCY_GROUPS } from "@/domain/competitions/competencies";
import {
  awardLabels,
  categoryLabels,
  pathwayLabels,
  pathwayOrder,
  type AgeCategory,
  type CompetitionPathway,
} from "@/domain/competitions/types";

export interface ResultWinner {
  place: "gold" | "silver" | "bronze";
  name: string;
  school: string;
  photoUrl: string | null;
  teamMembers: string[];
}

/** One competition in one grade category, with its published places. */
export interface ResultCard {
  key: string;
  slug: string;
  title: string;
  pathway: CompetitionPathway | null;
  groupKeys: string[];
  category: AgeCategory | null;
  gradeLabel: string;
  /** Uploaded card artwork; null shows a lettered placeholder tile. */
  imageUrl: string | null;
  winners: ResultWinner[];
}

type Mode = "route" | "category";
const PAGE_SIZE = 6;

// --- Icons -----------------------------------------------------------------

function Icon({ d, className = "h-6 w-6" }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

const ROUTE_ICONS: Record<CompetitionPathway, string> = {
  applied_skills:
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z",
  independent_submission: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z M14 2v6h6 M8 13h8 M8 17h5",
  project_showcase:
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M22 21v-2a4 4 0 0 0-3-3.9 M16 3.1a4 4 0 0 1 0 7.8",
  live_response: "M13 2 3 14h9l-1 8 10-12h-9l1-8Z",
};

const GROUP_ICONS: Record<string, string> = {
  "problem-solving": "M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04Z M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04Z",
  communication: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z",
  creativity: "M12 19l7-7 3 3-7 7-3-3Z M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5Z M2 2l7.6 7.6 M11 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  technology: "M16 18l6-6-6-6 M8 6l-6 6 6 6",
  research: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z M21 21l-4.35-4.35",
  innovation: "M9 18h6 M10 22h4 M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2Z",
  leadership: "M2 20h20 M4 20V10l4 3 4-7 4 7 4-3v10",
  citizenship: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8Z",
};

/** Badge colour per competency group, so the lead theme reads at a glance. */
const GROUP_TONES: Record<string, string> = {
  "problem-solving": "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  communication: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
  creativity: "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300",
  technology: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  research: "bg-teal-100 text-teal-800 dark:bg-teal-500/15 dark:text-teal-300",
  innovation: "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300",
  leadership: "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300",
  citizenship: "bg-lime-100 text-lime-800 dark:bg-lime-500/15 dark:text-lime-300",
};

const groupLabel = new Map(COMPETENCY_GROUPS.map((g) => [g.key, g.label]));

// --- Pieces ----------------------------------------------------------------

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Avatar({ name, photoUrl }: { name: string; photoUrl: string | null }) {
  if (photoUrl) {
    // eslint-disable-next-line @next/next/no-img-element -- consented winner photo from Supabase Storage
    return <img src={photoUrl} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-surface" />;
  }
  return (
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-deep text-sm font-bold text-brand-deep-foreground">
      {initials(name)}
    </span>
  );
}

function SelectorCard({
  active,
  icon,
  label,
  count,
  onClick,
}: {
  active: boolean;
  icon: string;
  label: string;
  count: number;
  onClick: () => void;
}) {
  const empty = count === 0;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
        active ? "border-accent bg-accent-soft" : "border-border bg-surface hover:border-accent"
      }`}
    >
      <span className={`shrink-0 ${active ? "text-accent-strong" : "text-foreground"}`}>
        <Icon d={icon} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold leading-snug text-foreground">{label}</span>
        <span className="block text-xs text-muted">
          {empty ? "No results yet" : `${count} competition${count === 1 ? "" : "s"}`}
        </span>
      </span>
      <span aria-hidden="true" className={`text-lg ${active ? "text-accent-strong" : "text-muted"}`}>
        ›
      </span>
    </button>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
        active ? "border-accent bg-accent text-accent-foreground" : "border-border bg-surface text-foreground hover:border-accent"
      }`}
    >
      {children}
    </button>
  );
}

function ResultCardView({ card }: { card: ResultCard }) {
  const lead = card.groupKeys[0];
  return (
    <article className="flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          {lead && (
            <span className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase ${GROUP_TONES[lead]}`}>
              {groupLabel.get(lead)}
            </span>
          )}
          <h3 className="mt-2 text-xl font-bold leading-tight text-foreground">{card.title}</h3>
          {card.gradeLabel && <p className="mt-1 text-sm text-muted">{card.gradeLabel}</p>}
        </div>
        {card.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded Supabase artwork
          <img src={card.imageUrl} alt="" className="h-24 w-24 shrink-0 rounded-xl object-cover" loading="lazy" />
        ) : (
          <span
            aria-hidden="true"
            className="grid h-24 w-24 shrink-0 place-items-center rounded-xl bg-surface-muted text-3xl font-black text-muted"
          >
            {card.title.charAt(0)}
          </span>
        )}
      </div>

      <ol className="mt-5 space-y-4">
        {card.winners.map((w, i) => (
          <li key={`${w.place}-${i}`} className="flex items-center gap-3">
            <Avatar name={w.name} photoUrl={w.photoUrl} />
            <div className="min-w-0">
              <p className="text-xs font-bold text-accent-strong">{awardLabels[w.place]}</p>
              <p className="truncate font-semibold text-foreground">{w.name}</p>
              <p className="truncate text-sm text-muted">{w.school}</p>
              {w.teamMembers.length > 0 && <p className="line-clamp-1 text-xs text-muted">{w.teamMembers.join(" · ")}</p>}
            </div>
          </li>
        ))}
      </ol>
    </article>
  );
}

function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  if (pages <= 1) return null;
  const btn = "grid h-9 min-w-9 place-items-center rounded-lg border px-2 text-sm font-semibold transition-colors disabled:opacity-40";
  return (
    <nav aria-label="Results pages" className="mt-8 flex items-center justify-center gap-2">
      <button type="button" className={`${btn} border-border bg-surface text-foreground`} disabled={page === 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
        ‹
      </button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          aria-current={p === page ? "page" : undefined}
          className={`${btn} ${p === page ? "border-accent bg-accent text-accent-foreground" : "border-border bg-surface text-foreground hover:border-accent"}`}
        >
          {p}
        </button>
      ))}
      <button type="button" className={`${btn} border-border bg-surface text-foreground`} disabled={page === pages} onClick={() => onChange(page + 1)} aria-label="Next page">
        ›
      </button>
    </nav>
  );
}

const MORE_WAYS = [
  { href: "/awards#spotlight", title: "Spotlight Awards", text: "Exceptional ideas, stories and changemakers.", icon: "M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1Z" },
  { href: "/awards#school_award", title: "School Excellence Awards", text: "Schools that nurture future-ready learners.", icon: "M3 21h18 M5 21V10l7-5 7 5v11 M9 21v-6h6v6" },
  { href: "/awards#teacher_parent", title: "Teacher Recognition", text: "Honouring educators who inspire.", icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M22 21v-2a4 4 0 0 0-3-3.9 M16 3.1a4 4 0 0 1 0 7.8" },
  { href: "/awards#teacher_parent", title: "Parent Support", text: "Celebrating our partnership in progress.", icon: GROUP_ICONS.citizenship },
];

// --- Explorer ----------------------------------------------------------------

export function ResultsExplorer({ cards }: { cards: ResultCard[] }) {
  const countRoute = (p: CompetitionPathway) => new Set(cards.filter((c) => c.pathway === p).map((c) => c.slug)).size;
  const countGroup = (g: string) => new Set(cards.filter((c) => c.groupKeys.includes(g)).map((c) => c.slug)).size;

  const firstRoute = pathwayOrder.find((p) => countRoute(p) > 0) ?? pathwayOrder[0];
  const firstGroup = COMPETENCY_GROUPS.find((g) => countGroup(g.key) > 0)?.key ?? COMPETENCY_GROUPS[0].key;

  const [mode, setMode] = useState<Mode>("route");
  // Route mode: a route card is picked and chips narrow by competency group.
  // Category mode: a group card is picked and chips narrow by route.
  const [route, setRoute] = useState<CompetitionPathway | "all">(firstRoute);
  const [group, setGroup] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [grade, setGrade] = useState<AgeCategory | "all">("all");
  const [page, setPage] = useState(1);

  function update(fn: () => void) {
    fn();
    setPage(1);
  }

  function switchMode(next: Mode) {
    update(() => {
      setMode(next);
      if (next === "route") {
        setRoute(firstRoute);
        setGroup("all");
      } else {
        setGroup(firstGroup);
        setRoute("all");
      }
    });
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cards.filter(
      (c) =>
        (route === "all" || c.pathway === route) &&
        (group === "all" || c.groupKeys.includes(group)) &&
        (grade === "all" || c.category === grade || c.category === null) &&
        (!q ||
          c.title.toLowerCase().includes(q) ||
          c.winners.some((w) => w.name.toLowerCase().includes(q) || w.school.toLowerCase().includes(q))),
    );
  }, [cards, route, group, grade, query]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const competitionCount = new Set(filtered.map((c) => c.slug)).size;

  const heading =
    mode === "route" ? (route === "all" ? "All routes" : pathwayLabels[route]) : group === "all" ? "All categories" : groupLabel.get(group);

  if (cards.length === 0) {
    return (
      <p className="rounded-2xl border border-border bg-surface p-10 text-center text-sm text-muted">
        Results will appear here as soon as the first competitions publish them.
      </p>
    );
  }

  return (
    <div>
      {/* Browse by route / category */}
      <div className="flex justify-center">
        <div role="tablist" aria-label="Browse results" className="inline-flex rounded-full border border-border bg-surface p-1 shadow-sm">
          {(["route", "category"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => switchMode(m)}
              className={`rounded-full px-6 py-2 text-xs font-bold tracking-wider uppercase transition-colors sm:px-10 ${
                mode === m ? "bg-accent text-accent-foreground" : "text-muted hover:text-foreground"
              }`}
            >
              Browse by {m}
            </button>
          ))}
        </div>
      </div>

      {/* Selector cards */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {mode === "route"
          ? pathwayOrder.map((p) => (
              <SelectorCard
                key={p}
                active={route === p}
                icon={ROUTE_ICONS[p]}
                label={pathwayLabels[p]}
                count={countRoute(p)}
                onClick={() =>
                  update(() => {
                    setRoute(p);
                    setGroup("all");
                  })
                }
              />
            ))
          : COMPETENCY_GROUPS.map((g) => (
              <SelectorCard
                key={g.key}
                active={group === g.key}
                icon={GROUP_ICONS[g.key]}
                label={g.label}
                count={countGroup(g.key)}
                onClick={() =>
                  update(() => {
                    setGroup(g.key);
                    setRoute("all");
                  })
                }
              />
            ))}
      </div>

      {/* Chips: the other dimension */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-bold tracking-wider text-muted uppercase">{mode === "route" ? "Category" : "Route"}</span>
        {mode === "route" ? (
          <>
            <Chip active={group === "all"} onClick={() => update(() => setGroup("all"))}>
              All
            </Chip>
            {COMPETENCY_GROUPS.map((g) => (
              <Chip key={g.key} active={group === g.key} onClick={() => update(() => setGroup(g.key))}>
                {g.label}
              </Chip>
            ))}
          </>
        ) : (
          <>
            <Chip active={route === "all"} onClick={() => update(() => setRoute("all"))}>
              All
            </Chip>
            {pathwayOrder.map((p) => (
                <Chip key={p} active={route === p} onClick={() => update(() => setRoute(p))}>
                  {pathwayLabels[p]}
                </Chip>
              ))}
          </>
        )}
      </div>

      {/* Heading, search and grade */}
      <div className="mt-8 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-baseline gap-3">
          <h2 className="text-2xl font-bold text-foreground">{heading}</h2>
          <span className="text-sm text-muted">
            {competitionCount} competition{competitionCount === 1 ? "" : "s"}
          </span>
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => update(() => setQuery(e.target.value))}
          placeholder="Search competitions, students or schools…"
          aria-label="Search results"
          className="rounded-lg border border-border bg-surface px-4 py-2 text-sm text-foreground outline-none focus:border-accent sm:w-72"
        />
        <select
          value={grade}
          onChange={(e) => update(() => setGrade(e.target.value as AgeCategory | "all"))}
          aria-label="Filter by grade category"
          className="rounded-lg border border-border bg-surface px-4 py-2 text-sm text-foreground"
        >
          <option value="all">All grades</option>
          {(Object.keys(categoryLabels) as AgeCategory[]).map((c) => (
            <option key={c} value={c}>
              {categoryLabels[c]}
            </option>
          ))}
        </select>
      </div>

      {/* Cards */}
      {visible.length > 0 ? (
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((card) => (
            <ResultCardView key={card.key} card={card} />
          ))}
        </div>
      ) : (
        <p className="mt-6 rounded-2xl border border-border bg-surface p-10 text-center text-sm text-muted">
          No published results here yet — they&apos;ll appear as soon as they&apos;re released.
        </p>
      )}

      <Pagination page={current} pages={pages} onChange={setPage} />

      {/* More ways we recognise */}
      <section className="mt-14 rounded-2xl bg-accent-soft p-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h2 className="text-sm font-bold tracking-wider text-foreground uppercase">More ways we recognise our community</h2>
          <p className="text-sm text-muted">Celebrating everyone who makes this journey possible.</p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {MORE_WAYS.map((m) => (
            <Link key={m.title} href={m.href} className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent">
              <span className="text-accent-strong">
                <Icon d={m.icon} />
              </span>
              <span>
                <span className="block text-sm font-semibold text-foreground">{m.title}</span>
                <span className="block text-xs text-muted">{m.text}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
