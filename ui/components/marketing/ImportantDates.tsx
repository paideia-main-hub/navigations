"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import type { CompetitionSummary } from "@/domain/competitions/types";
import { BandDivider } from "./BandDivider";

/** The published 2026 programme, from ui/components/calendar/calendar2026.ts. */
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
  calendar: <path d="M8 2v4m8-4v4M3 10h18M5 6h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />,
  trophy: <path d="M8 21h8m-4-4v4m-6-17h12v5a6 6 0 0 1-12 0V4Zm0 2H4a2 2 0 0 0 0 4h2m12-4h2a2 2 0 0 1 0 4h-2" />,
  check: <path d="M20 6 9 17l-5-5" />,
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

/** Same "don't animate for someone who asked the OS not to" check already
 * used in OrbitCardStack.tsx/LeagueSpotlight.tsx. */
function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

function pickNext(current: number, length: number): number {
  if (length <= 1) return current;
  let next = current;
  while (next === current) next = Math.floor(Math.random() * length);
  return next;
}

/** Replaces the old static "next milestone" preview with a rotating pick
 * from the real competition catalogue — just its title and short
 * description, cycling on its own. Flies in from the right at reduced size,
 * grows to full size crossing the middle, then shrinks away to the left
 * (animate-text-flythrough, app/globals.css), advancing to a new random
 * competition exactly when that flight finishes (`onAnimationEnd`) rather
 * than on a separately-timed interval, so the swap and the animation can
 * never drift out of sync.
 *
 * Starts at a fixed index (0), not a random one: picking randomly during
 * render would make the server's pick and the client's first-hydration pick
 * disagree. Every rotation *after* that first paint is a genuine client-only
 * random pick, via `pickNext` in the animation's own end handler. */
function CompetitionSpotlight({ competitions }: { competitions: CompetitionSummary[] }) {
  const reduceMotion = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);

  if (competitions.length === 0) return null;

  const item = competitions[index]!;

  return (
    <div className="relative w-full overflow-hidden">
      <div
        key={index}
        onAnimationEnd={() => {
          if (!reduceMotion) setIndex((i) => pickNext(i, competitions.length));
        }}
        className={`text-center ${reduceMotion ? "" : "animate-text-flythrough"}`}
      >
        <p className="text-2xl font-black tracking-tight text-brand-deep-foreground sm:text-3xl">{item.title}</p>
        <p className="mx-auto mt-3 line-clamp-3 max-w-md text-base text-brand-deep-muted">{item.shortDescription}</p>
      </div>
    </div>
  );
}

export function ImportantDates({ competitions }: { competitions: CompetitionSummary[] }) {
  const today = useSyncExternalStore(clock.subscribe, clock.getSnapshot, clock.getServerSnapshot);
  const live = today === null ? null : statusesAt(today * DAY);

  const statuses = live?.statuses ?? (MILESTONES.map(() => "later") as Status[]);

  return (
    <section className="relative overflow-hidden bg-brand-deep px-6 pt-24 pb-28 lg:pt-28 lg:pb-32">
      {/* Platinum on both sides of this band — the section above and below
          are both bg-background. */}
      <BandDivider shape="tilt" side="top" color="text-background" />
      <BandDivider shape="arc" side="bottom" color="text-background" />

      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 left-1/4 h-80 w-80 rounded-full bg-accent/10 blur-[130px]" />
        <div className="absolute right-0 -bottom-32 h-96 w-96 rounded-full bg-accent/[0.06] blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <h2 className="flex items-center gap-3 text-sm font-bold tracking-wider text-brand-deep-foreground uppercase">
          <span aria-hidden="true" className="h-0.5 w-8 bg-accent" />
          Important Dates
        </h2>

        {/* Spotlight (a rotating competition) beside the full schedule,
            instead of four equal boxes in a row. */}
        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-stretch">
          <div className="relative flex min-h-[280px] flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent p-8 text-center sm:p-10">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-20 -right-16 h-64 w-64 animate-pulse rounded-full bg-accent/20 blur-[90px]"
              style={{ animationDuration: "4s" }}
            />

            <CompetitionSpotlight competitions={competitions} />
          </div>

          {/* Full schedule — a compact vertical stepper rather than the old
              four-across row, so it reads as a list to scan next to the
              spotlight rather than needing its own separate width budget. */}
          <ol className="relative flex flex-col gap-1 rounded-[2rem] border border-white/10 bg-white/[0.03] p-3 sm:p-4">
            {MILESTONES.map((m, i) => {
              const status = statuses[i];
              const active = status === "now" || status === "next";
              return (
                <li
                  key={m.label}
                  className="group relative flex items-center gap-4 overflow-hidden rounded-2xl px-3 py-3.5 transition-colors duration-200 hover:bg-white/[0.06] sm:px-4"
                >
                  {/* Giant faint step number, same trick as the About page's
                      audience cards — a shape behind the words, not a second
                      thing to read. */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-3 right-2 text-[5rem] leading-none font-black tabular-nums text-brand-deep-foreground/[0.04] select-none"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <span
                    className={`relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full ring-4 ring-brand-deep transition-all duration-300 sm:h-13 sm:w-13 ${
                      status === "done"
                        ? "bg-accent/70 text-accent-foreground"
                        : active
                          ? "bg-accent text-accent-foreground shadow-[0_0_0_6px_rgba(255,105,31,0.18)]"
                          : "bg-white/10 text-brand-deep-foreground"
                    }`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className="h-5 w-5"
                    >
                      {icons[status === "done" ? "check" : m.icon]}
                    </svg>
                  </span>

                  <div className="relative z-10 min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <p className={`text-sm font-extrabold ${active ? "text-accent" : "text-brand-deep-foreground"}`}>
                        {m.display}
                      </p>
                      <p className="text-sm font-semibold text-brand-deep-muted">{m.label}</p>
                    </div>
                    {/* Truncated at rest so four rows never fight for height;
                        the full note is one hover away. */}
                    <p className="mt-0.5 truncate text-xs text-brand-deep-muted/80 group-hover:text-clip group-hover:whitespace-normal">
                      {m.note}
                    </p>
                  </div>

                  {active && (
                    <span className="relative z-10 hidden shrink-0 rounded-full bg-accent/15 px-2.5 py-1 text-[10px] font-bold tracking-wide text-accent uppercase sm:inline-block">
                      {status === "now" ? "Now" : "Next"}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
