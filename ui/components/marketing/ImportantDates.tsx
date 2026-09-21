"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { BandDivider } from "./BandDivider";

/** The published 2026 programme, from ui/components/calendar/calendar2026.ts.
 * Four milestones rather than three: the calendar puts a submission deadline
 * between registration closing and the activity period, and award nominations
 * hang off it, so collapsing it into the others would lose a real date. */
const MILESTONES = [
  {
    label: "Registration",
    display: "8 Oct – 10 Nov 2026",
    note: "School and individual registration is open for both routes.",
    from: "2026-10-08",
    to: "2026-11-10",
    icon: "document",
  },
  {
    label: "Submissions Close",
    display: "22 Nov 2026",
    note: "Advance work, project records and Route 2 nomination evidence are due.",
    from: "2026-11-22",
    to: "2026-11-22",
    icon: "upload",
  },
  {
    label: "Activity Period",
    display: "23 Nov – 4 Dec 2026",
    note: "Applied Skills Challenges run on weekdays only.",
    from: "2026-11-23",
    to: "2026-12-04",
    icon: "calendar",
  },
  {
    label: "Finals & Recognition",
    display: "5 – 6 Dec 2026",
    note: "Live arenas and project showcases, then the closing award ceremony.",
    from: "2026-12-05",
    to: "2026-12-06",
    icon: "trophy",
  },
] as const;

const icons: Record<string, ReactNode> = {
  document: <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7l-5-5Zm0 0v5h5M9 13h6M9 17h4" />,
  upload: <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M12 3v13m0-13 4 4m-4-4-4 4" />,
  calendar: <path d="M8 2v4m8-4v4M3 10h18M5 6h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />,
  trophy: <path d="M8 21h8m-4-4v4m-6-17h12v5a6 6 0 0 1-12 0V4Zm0 2H4a2 2 0 0 0 0 4h2m12-4h2a2 2 0 0 1 0 4h-2" />,
};

type Status = "done" | "now" | "next" | "later";

const DAY = 86_400_000;

function statusesAt(now: number): { statuses: Status[]; progress: number; daysToNext: number | null } {
  const spans = MILESTONES.map((m) => ({
    from: Date.parse(`${m.from}T00:00:00`),
    // inclusive of the closing day
    to: Date.parse(`${m.to}T00:00:00`) + DAY - 1,
  }));

  const statuses: Status[] = spans.map((s) => (now > s.to ? "done" : now >= s.from ? "now" : "later"));
  const firstLater = statuses.indexOf("later");
  // Mark the soonest upcoming milestone unless something is already running.
  if (firstLater !== -1 && !statuses.includes("now")) statuses[firstLater] = "next";

  // Fill the rail to the active node, plus however far through it we are, so
  // the line lands on a node rather than at an arbitrary point between two.
  const last = MILESTONES.length - 1;
  let filled = 0;
  const activeIndex = statuses.findIndex((s) => s === "now");
  if (activeIndex !== -1) {
    const span = spans[activeIndex];
    const within = (now - span.from) / (span.to - span.from);
    filled = (activeIndex + Math.min(1, Math.max(0, within))) / last;
  } else if (statuses.every((s) => s === "done")) {
    filled = 1;
  } else {
    const upcoming = statuses.findIndex((s) => s === "next");
    filled = Math.max(0, upcoming - 1) / last;
    if (upcoming <= 0) filled = 0;
  }

  const nextIndex = statuses.findIndex((s) => s === "next" || s === "now");
  const daysToNext =
    nextIndex === -1 || statuses[nextIndex] === "now"
      ? null
      : Math.ceil((spans[nextIndex].from - now) / DAY);

  return { statuses, progress: Math.min(1, Math.max(0, filled)) * 100, daysToNext };
}

/** Today, as a whole-day number. Day granularity is all the comparisons need,
 * and it keeps the snapshot stable between renders — Date.now() would change
 * on every read and spin. The server snapshot is null so the first client
 * render matches the server's, then the real value arrives. */
const clock = {
  subscribe(onChange: () => void) {
    const id = setInterval(onChange, 3_600_000);
    return () => clearInterval(id);
  },
  getSnapshot: () => Math.floor(Date.now() / DAY),
  getServerSnapshot: () => null,
};

export function ImportantDates() {
  const today = useSyncExternalStore(clock.subscribe, clock.getSnapshot, clock.getServerSnapshot);
  const live = today === null ? null : statusesAt(today * DAY);

  const statuses = live?.statuses ?? (MILESTONES.map(() => "later") as Status[]);
  const progress = live?.progress ?? 0;
  const daysToNext = live?.daysToNext ?? null;
  const highlightIndex = statuses.findIndex((s) => s === "now" || s === "next");

  return (
    <section className="relative overflow-hidden bg-brand-deep px-6 pt-24 pb-28 lg:pt-28 lg:pb-32">
      {/* Warm Explore above slants into this band; Platinum below scoops up. */}
      <BandDivider shape="tilt" side="top" color="text-surface-warm" />
      <BandDivider shape="arc" side="bottom" color="text-background" />

      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 left-1/4 h-80 w-80 rounded-full bg-accent/10 blur-[130px]" />
        <div className="absolute right-0 -bottom-32 h-96 w-96 rounded-full bg-accent/[0.06] blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="flex items-center gap-3 text-sm font-bold tracking-wider text-brand-deep-foreground uppercase">
            <span aria-hidden="true" className="h-0.5 w-8 bg-accent" />
            Important Dates
          </h2>
          {daysToNext !== null && daysToNext >= 0 && (
            <p className="rounded-full bg-accent px-4 py-1.5 text-sm font-bold text-accent-foreground">
              {daysToNext === 0
                ? `${MILESTONES[highlightIndex].label} opens today`
                : `${MILESTONES[highlightIndex].label} opens in ${daysToNext} day${daysToNext === 1 ? "" : "s"}`}
            </p>
          )}
        </div>

        <ol className="relative mt-12 grid gap-10 md:grid-cols-4 md:gap-6">
          {/* The rail runs behind the nodes, aligned to their centres: a node
              is 3.5rem tall, so its middle sits 1.75rem down. */}
          <div aria-hidden="true" className="absolute top-7 right-0 left-0 hidden h-0.5 bg-white/15 md:block">
            <div
              className="h-full bg-gradient-to-r from-accent to-accent-strong transition-[width] duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {MILESTONES.map((m, i) => {
            const status = statuses[i];
            const active = status === "now" || status === "next";
            return (
              <li key={m.label} className="relative flex gap-5 md:block">
                <div
                  className={`relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-full ring-8 ring-brand-deep transition-colors duration-300 ${
                    status === "done"
                      ? "bg-accent text-accent-foreground"
                      : active
                        ? "bg-accent text-accent-foreground shadow-[0_0_0_6px_rgba(255,105,31,0.18)]"
                        : "bg-brand-deep-foreground/10 text-brand-deep-foreground"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="h-6 w-6"
                  >
                    {icons[m.icon]}
                  </svg>
                  <span className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-brand-deep text-[10px] font-bold text-brand-deep-foreground ring-2 ring-brand-deep">
                    {i + 1}
                  </span>
                </div>

                <div className="md:mt-6">
                  <p
                    className={`text-lg font-extrabold tracking-tight transition-colors ${
                      active ? "text-accent" : "text-brand-deep-foreground"
                    }`}
                  >
                    {m.display}
                  </p>
                  <p className="mt-0.5 font-semibold text-brand-deep-foreground">{m.label}</p>
                  <p className="mt-1.5 max-w-xs text-sm text-brand-deep-muted">{m.note}</p>
                  {status === "done" && (
                    <p className="mt-2 text-xs font-semibold tracking-wide text-brand-deep-muted uppercase">Complete</p>
                  )}
                  {status === "now" && (
                    <p className="mt-2 text-xs font-bold tracking-wide text-accent uppercase">Happening now</p>
                  )}
                </div>

                {/* Vertical rail for the stacked layout. */}
                {i < MILESTONES.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute top-14 left-7 h-[calc(100%+2.5rem-3.5rem)] w-0.5 -translate-x-1/2 bg-white/15 md:hidden"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
