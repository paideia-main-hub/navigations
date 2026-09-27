import Link from "next/link";
import type { ReactNode } from "react";
import type { UpcomingDate } from "@/domain/competitions/service";
import { eventTypeLabels, type EventType } from "@/domain/competitions/types";
import { SectionHeading } from "./SectionHeading";
import { BandDivider } from "./BandDivider";

const DAY = 86_400_000;
/** Enough of the season to read as a schedule without turning into the
 * calendar page, which this section links out to. */
const MAX_GROUPS = 4;
/** Every competition shares a handful of dates, so one date can carry twenty
 * names. Show a readable row and send the rest to /calendar. */
const MAX_CHIPS = 8;

const icons: Record<EventType, ReactNode> = {
  registration_close: <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-14v4.2l2.8 1.8" />,
  round: <path d="M5 22V3m0 0h12l-2.2 4L17 11H5" />,
  result_date: (
    <path d="M9 3h6v2.5H9zM7.5 5H6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1.5M9 14l2 2 4-4" />
  ),
  final_event: <path d="M8 21h8m-4-4v4m-6-17h12v5a6 6 0 0 1-12 0V4Zm0 2H4a2 2 0 0 0 0 4h2m12-4h2a2 2 0 0 1 0 4h-2" />,
  other: <path d="M12 8.2v5m0 2.9h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" />,
};

interface Entry {
  competition: string;
  slug: string;
}

interface LabelGroup {
  key: string;
  label: string;
  type: EventType;
  entries: Entry[];
}

interface DayGroup {
  key: string;
  ms: number;
  daysAway: number;
  labels: LabelGroup[];
  total: number;
}

/** Local midnight for a YYYY-MM-DD date column. new Date(value) would read it
 * as UTC midnight and land on the previous day west of Greenwich. */
function startOfDay(date: string): number {
  return Date.parse(date.slice(0, 10) + "T00:00:00");
}

/** One row per competition per date reads as twenty identical rows when the
 * whole League shares a deadline, so here dates are the rows and competitions
 * are their contents. Dates arrive already sorted ascending. */
function buildGroups(dates: UpcomingDate[], todayMs: number): DayGroup[] {
  const byDay = new Map<string, DayGroup>();

  for (const d of dates) {
    const ms = startOfDay(d.date);
    if (Number.isNaN(ms) || ms < todayMs) continue;

    const dayKey = d.date.slice(0, 10);
    let day = byDay.get(dayKey);
    if (!day) {
      day = {
        key: dayKey,
        ms,
        daysAway: Math.round((ms - todayMs) / DAY),
        labels: [],
        total: 0,
      };
      byDay.set(dayKey, day);
    }

    // `other` has no meaningful shared label, so those keep their own title.
    const labelKey = d.type === "other" ? d.label : d.type;
    let label = day.labels.find((l) => l.key === labelKey);
    if (!label) {
      label = {
        key: labelKey,
        label: d.type === "other" ? d.label : eventTypeLabels[d.type],
        type: d.type,
        entries: [],
      };
      day.labels.push(label);
    }

    label.entries.push({ competition: d.competition, slug: d.slug });
    day.total += 1;
  }

  return Array.from(byDay.values())
    .sort((a, b) => a.ms - b.ms)
    .slice(0, MAX_GROUPS);
}

function relativeLabel(daysAway: number): string {
  if (daysAway <= 0) return "Today";
  if (daysAway === 1) return "Tomorrow";
  return "In " + daysAway + " days";
}

function EventIcon({ type }: { type: EventType }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
    >
      {icons[type]}
    </svg>
  );
}

export function UpcomingEventsBoard({ dates }: { dates: UpcomingDate[] }) {
  // The home page is request-rendered (it reads cookies for the Supabase
  // session), so "today" is current on every visit and no client clock is
  // needed to keep the countdown honest.
  const now = new Date();
  const todayMs = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const groups = buildGroups(dates, todayMs);
  const next = groups[0];
  const competitions = new Set(dates.map((d) => d.slug)).size;

  return (
    <section className="relative bg-surface-alt px-6 pt-24 pb-28 lg:pt-28 lg:pb-32">
      {/* Platinum on both sides of this band, shaped differently top and
          bottom so the two seams do not mirror each other. No
          overflow-hidden: this section's own decorative elements (the two
          BandDividers below) are already exactly the size of their own box
          with nothing bleeding past it, and the sidebar further down needs
          to be position: sticky, which any overflow other than visible on
          an ancestor silently breaks. */}
      <BandDivider shape="wave" side="top" color="text-background" />
      <BandDivider shape="curve" side="bottom" color="text-background" flip />

      <div className="relative mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Competition Calendar"
          title="Upcoming Events"
          action={{ href: "/calendar", label: "View full calendar" }}
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
          {groups.length > 0 ? (
            <ol className="space-y-4">
              {groups.map((group, i) => {
                const date = new Date(group.ms);
                // A month heading only where the month actually turns over.
                const newMonth = i === 0 || new Date(groups[i - 1].ms).getMonth() !== date.getMonth();
                const isNext = i === 0;
                // Dimming the weekday/month drops Space Indigo on Atomic
                // Tangerine to 3.8:1, so only the muted tile carries it.
                const tileLabel = `text-[11px] font-bold tracking-wider uppercase${isNext ? "" : " opacity-75"}`;

                return (
                  <li key={group.key}>
                    {newMonth && (
                      <p className="mt-7 mb-3 flex items-center gap-3 text-xs font-bold tracking-widest text-muted uppercase first:mt-0">
                        {date.toLocaleDateString(undefined, {
                          month: "long",
                          year: "numeric",
                        })}
                        <span aria-hidden="true" className="h-px flex-1 bg-border" />
                      </p>
                    )}

                    <article
                      className={`grid gap-5 rounded-2xl border bg-surface p-5 transition-shadow sm:grid-cols-[auto_minmax(0,1fr)] ${
                        isNext
                          ? "border-accent/50 shadow-[0_20px_45px_-32px_rgba(31,32,65,0.6)]"
                          : "border-border hover:shadow-[0_18px_40px_-34px_rgba(31,32,65,0.6)]"
                      }`}
                    >
                      <div
                        className={`flex w-full flex-row items-center justify-center gap-3 rounded-xl py-3 sm:w-20 sm:flex-col sm:gap-0 ${
                          isNext ? "bg-accent text-accent-foreground" : "bg-surface-muted text-foreground"
                        }`}
                      >
                        <span className={tileLabel}>
                          {date.toLocaleDateString(undefined, {
                            weekday: "short",
                          })}
                        </span>
                        <span className="text-3xl leading-none font-black">{date.getDate()}</span>
                        <span className={tileLabel}>
                          {date.toLocaleDateString(undefined, {
                            month: "short",
                          })}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                              isNext ? "bg-accent-soft text-accent-strong" : "bg-surface-muted text-muted"
                            }`}
                          >
                            {relativeLabel(group.daysAway)}
                          </span>
                          <span className="text-xs font-semibold text-muted">
                            {group.total} {group.total === 1 ? "entry" : "entries"}
                          </span>
                        </div>

                        {group.labels.map((label) => (
                          <div key={label.key} className="mt-4">
                            <p className="flex items-center gap-2 text-xs font-bold tracking-wide text-accent-strong uppercase">
                              <EventIcon type={label.type} />
                              {label.label}
                            </p>
                            <ul className="mt-2 flex flex-wrap gap-1.5">
                              {label.entries.slice(0, MAX_CHIPS).map((entry) => (
                                <li key={entry.slug}>
                                  <Link
                                    href={`/competitions/${entry.slug}`}
                                    className="inline-flex rounded-lg border border-border bg-surface-muted px-2.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent-strong"
                                  >
                                    {entry.competition}
                                  </Link>
                                </li>
                              ))}
                              {label.entries.length > MAX_CHIPS && (
                                <li>
                                  <Link
                                    href="/calendar"
                                    className="inline-flex rounded-lg px-2.5 py-1.5 text-xs font-bold text-accent-strong hover:underline"
                                  >
                                    +{label.entries.length - MAX_CHIPS} more
                                  </Link>
                                </li>
                              )}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </article>
                  </li>
                );
              })}
            </ol>
          ) : (
            <div className="rounded-2xl border border-border bg-surface p-8 text-center">
              <p className="font-semibold text-foreground">No dates scheduled yet</p>
              <p className="mt-1 text-sm text-muted">
                Registration and round dates appear here as soon as they are published.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
            {next && (
              <div className="relative overflow-hidden rounded-2xl bg-brand-deep p-6">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-16 -right-10 h-44 w-44 rounded-full bg-accent/20 blur-3xl"
                />
                <p className="relative text-[11px] font-bold tracking-widest text-accent uppercase">Next deadline</p>
                <p className="relative mt-3 flex items-baseline gap-2">
                  <span className="text-5xl leading-none font-black text-brand-deep-foreground">
                    {next.daysAway <= 0 ? "Today" : next.daysAway}
                  </span>
                  {next.daysAway > 0 && (
                    <span className="text-sm font-semibold text-brand-deep-muted">
                      {next.daysAway === 1 ? "day away" : "days away"}
                    </span>
                  )}
                </p>
                <p className="relative mt-4 font-bold text-brand-deep-foreground">{next.labels[0].label}</p>
                <p className="relative mt-1 text-sm text-brand-deep-muted">
                  {new Date(next.ms).toLocaleDateString(undefined, {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}

            <div className="rounded-2xl border border-border bg-surface p-6">
              <p className="text-[11px] font-bold tracking-widest text-accent-strong uppercase">Stay on schedule</p>
              <p className="mt-2 font-bold text-foreground">Everything in one calendar</p>
              <p className="mt-1 text-sm text-muted">
                Every registration deadline, round and closing date
                {competitions > 0 ? ` across all ${competitions} competitions` : ""}, without checking back here.
              </p>
              <Link
                href="/calendar"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground transition-colors hover:bg-accent/90 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none"
              >
                View Competition Calendar
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
