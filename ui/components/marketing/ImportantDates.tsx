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

export function ImportantDates() {
  const today = useSyncExternalStore(clock.subscribe, clock.getSnapshot, clock.getServerSnapshot);
  const live = today === null ? null : statusesAt(today * DAY);

  const statuses = live?.statuses ?? (MILESTONES.map(() => "later") as Status[]);
  const progress = live?.progress ?? 0;
  const daysToNext = live?.daysToNext ?? null;
  const highlightIndex = statuses.findIndex((s) => s === "now" || s === "next");
  // Nothing left to look forward to once every milestone is done — spotlight
  // the closing one instead of an index that no longer means "next".
  const spotlightIndex = highlightIndex === -1 ? MILESTONES.length - 1 : highlightIndex;
  const spotlight = MILESTONES[spotlightIndex];
  const spotlightStatus = statuses[spotlightIndex];

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

        {/* Spotlight (what matters right now) beside the full schedule,
            instead of four equal boxes in a row — the countdown that used to
            be a small pill in the header is the whole left panel now. */}
        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-stretch">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent p-8 sm:p-10">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-20 -right-16 h-64 w-64 animate-pulse rounded-full bg-accent/20 blur-[90px]"
              style={{ animationDuration: "4s" }}
            />

            <p className="relative text-xs font-bold tracking-[0.22em] text-brand-deep-muted uppercase">
              {spotlightStatus === "now" ? "Happening now" : spotlightStatus === "done" ? "Season complete" : "Coming up next"}
            </p>

            {live === null ? (
              <div className="mt-5 h-20 w-44 animate-pulse rounded-2xl bg-white/5" />
            ) : daysToNext !== null && daysToNext >= 0 ? (
              <div className="relative mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-7xl font-black tracking-tighter text-brand-deep-foreground tabular-nums sm:text-8xl">
                  {daysToNext}
                </span>
                <span className="text-lg font-bold text-brand-deep-muted">day{daysToNext === 1 ? "" : "s"} to go</span>
              </div>
            ) : (
              <p className="relative mt-4 text-4xl font-black tracking-tight text-brand-deep-foreground">
                {spotlightStatus === "now" ? "Underway" : "All done"}
              </p>
            )}

            <div className="relative mt-7 flex items-center gap-4 border-t border-white/10 pt-6">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent text-accent-foreground shadow-[0_0_0_6px_rgba(255,105,31,0.18)]">
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
                  {icons[spotlight.icon]}
                </svg>
              </span>
              <div className="min-w-0">
                <p className="font-bold text-brand-deep-foreground">{spotlight.label}</p>
                <p className="text-sm text-brand-deep-muted">{spotlight.display}</p>
              </div>
            </div>
            <p className="relative mt-4 text-sm leading-relaxed text-brand-deep-muted">{spotlight.note}</p>
          </div>

          {/* Full schedule — a compact vertical stepper rather than the old
              four-across row, so it reads as a list to scan next to the
              spotlight rather than needing its own separate width budget. */}
          <ol className="relative flex flex-col gap-1 rounded-[2rem] border border-white/10 bg-white/[0.03] p-3 sm:p-4">
            <div
              aria-hidden="true"
              className="absolute top-9 bottom-9 left-[2.65rem] w-0.5 overflow-hidden rounded-full bg-white/10 sm:left-[3.15rem]"
            >
              <div
                className="w-full bg-gradient-to-b from-accent to-accent-strong transition-[height] duration-700 ease-out"
                style={{ height: `${progress}%` }}
              />
            </div>

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
