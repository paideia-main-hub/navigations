import Link from "next/link";
import { createClient } from "@/data/supabase/server";
import { shortEventLabels, shortLabelForEvent, sortCompetitionEvents } from "@/domain/competitions/dateLabels";
import { listPublicCompetitions } from "@/domain/competitions/service";
import {
  pathwayLabels,
  type CompetitionPathway,
  type CompetitionSummary,
  type EventType,
} from "@/domain/competitions/types";
import { formatEventDateOnly } from "@/ui/components/admin/eventDateFormat";
import { PageBanner } from "@/ui/components/marketing/PageBanner";
import { ArenaBadge } from "@/ui/components/marketing/ArenaBadge";
import { KeyDateCard } from "@/ui/components/calendar/KeyDateCard";
import { AwardsSectionJump } from "@/ui/components/awards/AwardsSectionJump";
import {
  AWARD_SUBMISSIONS,
  AWARD_SUBMISSION_INTRO,
  CALENDAR_INTRO,
  CALENDAR_STRAPLINE,
  FINAL_EVENT_PROGRAMME,
  KEY_DATES,
  ON_THE_DAY_NOTE,
  SUBMISSION_CALENDAR,
  SUBMISSION_CALENDAR_INTRO,
  WEEKEND_GAP_NOTE,
  type ActivityFormat,
  type AwardSubmissionEntry,
  type SubmissionEntry,
} from "@/ui/components/calendar/calendar2026";

export const metadata = { title: "Competition Calendar 2026 | Navigations" };

const JUMP_SECTIONS = [
  { id: "key-dates", label: "Key dates" },
  { id: "applied-skills", label: "Applied Skills" },
  { id: "independent-submissions", label: "Independent submissions" },
  { id: "other-competitions", label: "Showcases & live" },
  { id: "submission-showcase", label: "Submission & showcase" },
  { id: "award-submissions", label: "Award submissions" },
  { id: "final-event", label: "Final event programme" },
];

const PATHWAY_FORMAT: Record<CompetitionPathway, ActivityFormat> = {
  applied_skills: "Applied Skills Challenge",
  independent_submission: "Independent Submission",
  project_showcase: "Project showcase",
  live_response: "Live performance",
};

const formatTone: Record<ActivityFormat, "blue" | "warning" | "success" | "neutral"> = {
  "Applied Skills Challenge": "blue",
  "Independent Submission": "success",
  "Live performance": "warning",
  "Project showcase": "success",
  Submission: "neutral",
  Screening: "neutral",
  "Award ceremony": "warning",
};

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

type TimelineItem = {
  competition: CompetitionSummary;
  /** YYYY-MM-DD used for sorting / grouping */
  dayKey: string;
  heading: string;
  subheading: string;
  /** What the left-column date represents (e.g. Contest day). */
  dateLabel: string;
};

function localDayParts(iso: string): { dayKey: string; heading: string; subheading: string; ms: number } | null {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const [, y, m, d] = match;
  const ms = Date.parse(`${y}-${m}-${d}T12:00:00`);
  if (Number.isNaN(ms)) return null;
  const date = new Date(ms);
  return {
    dayKey: `${y}-${m}-${d}`,
    heading: `${Number(d)} ${MONTHS_SHORT[Number(m) - 1]}`,
    subheading: WEEKDAYS[date.getDay()]!,
    ms,
  };
}

/** Primary calendar day for the left column: contest day, else submission, else earliest. */
function primaryEventAnchor(
  competition: CompetitionSummary,
): { iso: string; type: EventType } | null {
  const rounds = competition.events
    .filter((e) => e.type === "round")
    .map((e) => e.eventDate)
    .sort();
  if (rounds[0]) return { iso: rounds[0], type: "round" };
  const submissions = competition.events
    .filter((e) => e.type === "submission_deadline")
    .map((e) => e.eventDate)
    .sort();
  if (submissions[0]) return { iso: submissions[0], type: "submission_deadline" };
  const sorted = sortCompetitionEvents(competition.events);
  const first = sorted[0];
  if (!first) return null;
  return { iso: first.eventDate, type: first.type };
}

function toTimelineItems(competitions: CompetitionSummary[]): TimelineItem[] {
  const items: TimelineItem[] = [];
  for (const competition of competitions) {
    const anchor = primaryEventAnchor(competition);
    if (!anchor) continue;
    const parts = localDayParts(anchor.iso);
    if (!parts) continue;
    items.push({
      competition,
      dayKey: parts.dayKey,
      heading: parts.heading,
      subheading: parts.subheading,
      dateLabel: shortEventLabels[anchor.type],
    });
  }
  return items.sort((a, b) => a.dayKey.localeCompare(b.dayKey) || a.competition.title.localeCompare(b.competition.title));
}

function inInclusiveRange(dayKey: string, from: string, to: string): boolean {
  return dayKey >= from && dayKey <= to;
}

function FormatBadge({ format }: { format: ActivityFormat }) {
  return (
    <ArenaBadge tone={formatTone[format]}>
      {format}
    </ArenaBadge>
  );
}

function groupBy<T>(entries: T[], key: (entry: T) => string): { key: string; items: T[] }[] {
  const groups: { key: string; items: T[] }[] = [];
  for (const entry of entries) {
    const existing = groups.find((g) => g.key === key(entry));
    if (existing) existing.items.push(entry);
    else groups.push({ key: key(entry), items: [entry] });
  }
  return groups;
}

function TimelineRow({
  heading,
  subheading,
  dateLabel,
  children,
}: {
  heading: string;
  subheading: string;
  dateLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-[150px_1fr] sm:gap-6">
      <div className="sm:pt-4 sm:text-right">
        {dateLabel ? (
          <p className="text-[11px] font-semibold tracking-wide text-accent uppercase">{dateLabel}</p>
        ) : null}
        <p className={`text-lg font-bold text-foreground ${dateLabel ? "mt-0.5" : ""}`}>{heading}</p>
        <p className="text-sm text-muted">{subheading}</p>
      </div>
      <div className="space-y-3 sm:border-l sm:border-border sm:pl-6">{children}</div>
    </div>
  );
}

function CompetitionTimelineCard({ competition }: { competition: CompetitionSummary }) {
  const events = sortCompetitionEvents(competition.events);
  const notes = [competition.datesCardOne, competition.datesCardTwo].map((n) => n.trim()).filter(Boolean);
  const description =
    notes.join(" · ") ||
    competition.shortDescription ||
    "Dates and details for this competition.";
  const format = competition.pathway ? PATHWAY_FORMAT[competition.pathway] : null;

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <Link
        href={`/competitions/${competition.slug}`}
        className="text-[18px] font-semibold text-foreground hover:text-accent"
      >
        {competition.title}
      </Link>
      <p className="mt-1 text-base text-muted">{description}</p>

      {(format || competition.pathway) ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {format ? <FormatBadge format={format} /> : null}
          {competition.pathway && !format ? (
            <ArenaBadge tone="neutral">{pathwayLabels[competition.pathway]}</ArenaBadge>
          ) : null}
        </div>
      ) : null}

      {events.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
          {events.map((event) => (
            <span
              key={event.id}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-muted px-2 py-1 text-xs leading-tight"
            >
              <span className="font-semibold text-foreground">{shortLabelForEvent(event)}</span>
              <span aria-hidden className="text-muted">
                ·
              </span>
              <span className="font-medium tabular-nums text-foreground/90">
                {formatEventDateOnly(event.eventDate)}
              </span>
            </span>
          ))}
        </div>
      ) : null}

      {competition.venue ? (
        <p className="mt-2 text-xs text-muted">
          Venue: <span className="font-medium text-foreground">{competition.venue}</span>
        </p>
      ) : null}
    </div>
  );
}

function CompetitionScheduleTimeline({ items }: { items: TimelineItem[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-surface px-4 py-8 text-center text-sm text-muted">
        Competition dates will appear here once they are set in the admin dashboard.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {groupBy(items, (item) => item.dayKey).map((group) => {
        const labels = [...new Set(group.items.map((item) => item.dateLabel))];
        const dateLabel = labels.length === 1 ? labels[0] : "Key date";
        return (
          <TimelineRow
            key={group.key}
            heading={group.items[0]!.heading}
            subheading={group.items[0]!.subheading}
            dateLabel={dateLabel}
          >
            {group.items.map((item) => (
              <CompetitionTimelineCard key={item.competition.id} competition={item.competition} />
            ))}
          </TimelineRow>
        );
      })}
    </div>
  );
}

function SubmissionTimeline({ entries }: { entries: SubmissionEntry[] }) {
  return (
    <div className="space-y-4">
      {groupBy(entries, (s) => s.date).map((group) => (
        <TimelineRow key={group.key} heading={group.key} subheading={group.items[0]!.day}>
          {group.items.map((s) => (
            <div key={s.competition} className="rounded-xl border border-border bg-surface p-4">
              <p className="font-semibold text-foreground">{s.competition}</p>
              <p className="mt-1 text-sm text-muted">{s.requirement}</p>
              <div className="mt-3">
                <FormatBadge format={s.formats[0]!} />
              </div>
              <p className="mt-3 text-sm font-semibold text-accent-strong">{s.presentation}</p>
            </div>
          ))}
        </TimelineRow>
      ))}
    </div>
  );
}

function AwardTimeline({ entries }: { entries: AwardSubmissionEntry[] }) {
  return (
    <div className="space-y-4">
      {groupBy(entries, (a) => a.group).map((group) => (
        <TimelineRow key={group.key} heading={group.key} subheading={group.items[0]!.groupNote}>
          {group.items.map((a) => (
            <div key={a.award} className="rounded-xl border border-border bg-surface p-4">
              <p className="font-semibold text-foreground">{a.award}</p>
              <p className="mt-1 text-sm text-muted">{a.nature}</p>
              <div className="mt-3">
                <ArenaBadge tone="neutral">{a.whoMaySubmit}</ArenaBadge>
              </div>
            </div>
          ))}
        </TimelineRow>
      ))}
    </div>
  );
}

function SectionHeading({ title, intro }: { title: string; intro?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-xl font-bold text-foreground sm:text-2xl">{title}</h2>
      {intro && <p className="mt-2 max-w-3xl text-sm text-muted">{intro}</p>}
    </div>
  );
}

export default async function CalendarPage() {
  const supabase = await createClient();
  const competitions = await listPublicCompetitions(supabase);
  const timeline = toTimelineItems(competitions);

  const applied = timeline.filter((item) => item.competition.pathway === "applied_skills");
  const weekOne = applied.filter((item) => inInclusiveRange(item.dayKey, "2026-11-23", "2026-11-27"));
  const weekTwo = applied.filter((item) => inInclusiveRange(item.dayKey, "2026-11-30", "2026-12-04"));
  const appliedOutsideWeeks = applied.filter(
    (item) =>
      !inInclusiveRange(item.dayKey, "2026-11-23", "2026-11-27") &&
      !inInclusiveRange(item.dayKey, "2026-11-30", "2026-12-04"),
  );
  const showAppliedAsOneBlock = weekOne.length === 0 && weekTwo.length === 0 && applied.length > 0;

  const independent = timeline.filter((item) => item.competition.pathway === "independent_submission");
  const otherLive = timeline.filter(
    (item) =>
      item.competition.pathway !== "applied_skills" &&
      item.competition.pathway !== "independent_submission",
  );

  return (
    <div className="bg-background">
      <PageBanner
        title="Future Ready League Calendar"
        subtitle={CALENDAR_INTRO}
        className="-mt-24 pt-28 pb-28 sm:-mt-28 sm:pt-32 sm:pb-32 lg:pt-36 lg:pb-36"
        showNet
        netLattice="angular"
        curvedBottom
      />

      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid gap-3 sm:grid-cols-3">
          {CALENDAR_STRAPLINE.map((item, i) => (
            <div
              key={item.label}
              className="relative overflow-hidden rounded-2xl border border-border bg-surface px-5 py-4 shadow-sm"
            >
              <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-accent" />
              <div className="pl-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black tracking-[0.18em] text-muted">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span aria-hidden className="h-px flex-1 bg-border" />
                </div>
                <p className="mt-2 text-xs font-semibold tracking-[0.14em] text-accent-strong uppercase">
                  {item.label}
                </p>
                <p className="mt-1 text-sm font-bold text-foreground sm:text-base">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>

        <section id="key-dates" className="mt-12 scroll-mt-24">
          <SectionHeading title="Key dates" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {KEY_DATES.map((d, i) => (
              <KeyDateCard
                key={d.milestone}
                milestone={d.milestone}
                date={d.date}
                note={d.note}
                shadeIndex={i}
              />
            ))}
          </div>
        </section>

        <section id="applied-skills" className="mt-12 scroll-mt-24">
          {showAppliedAsOneBlock ? (
            <>
              <SectionHeading
                title="Applied Skills Challenges"
                intro="Contest days from the admin schedule. Each card lists every date set for that competition."
              />
              <CompetitionScheduleTimeline items={applied} />
              <p className="mt-3 text-xs text-muted">{ON_THE_DAY_NOTE}</p>
            </>
          ) : (
            <>
              <SectionHeading
                title="Week one — 23 to 27 November"
                intro="Each activity takes place on the date shown. Where two activities share a date, separate sessions or spaces are assigned. Registration for both routes closes on 10 November."
              />
              <CompetitionScheduleTimeline items={weekOne} />
              <div className="mt-5 rounded-xl border border-border bg-surface-muted p-4 text-sm text-muted">
                {WEEKEND_GAP_NOTE}
              </div>
              <p className="mt-3 text-xs text-muted">{ON_THE_DAY_NOTE}</p>

              <div className="mt-12">
                <SectionHeading title="Week two — 30 November to 4 December" />
                <CompetitionScheduleTimeline items={weekTwo} />
              </div>

              {appliedOutsideWeeks.length > 0 ? (
                <div className="mt-12">
                  <SectionHeading
                    title="Other Applied Skills dates"
                    intro="Applied Skills competitions whose contest day falls outside the two League weeks."
                  />
                  <CompetitionScheduleTimeline items={appliedOutsideWeeks} />
                </div>
              ) : null}
            </>
          )}
        </section>

        <section id="independent-submissions" className="mt-12 scroll-mt-24">
          <SectionHeading title="Independent submissions" />
          <CompetitionScheduleTimeline items={independent} />
        </section>

        <section id="other-competitions" className="mt-12 scroll-mt-24">
          <SectionHeading
            title="Project showcases & live performances"
            intro="Contest and performance days from the admin schedule."
          />
          <CompetitionScheduleTimeline items={otherLive} />
        </section>

        <section id="submission-showcase" className="mt-12 scroll-mt-24">
          <SectionHeading title="Submission and showcase calendar" intro={SUBMISSION_CALENDAR_INTRO} />
          <SubmissionTimeline entries={SUBMISSION_CALENDAR} />
        </section>

        <section id="award-submissions" className="mt-12 scroll-mt-24">
          <SectionHeading title="Award submission categories" intro={AWARD_SUBMISSION_INTRO} />
          <AwardTimeline entries={AWARD_SUBMISSIONS} />
        </section>

        <section id="final-event" className="mt-12 scroll-mt-24">
          <SectionHeading title="Final event programme — 11 & 12 December" />
          <div className="grid gap-5 md:grid-cols-2">
            {FINAL_EVENT_PROGRAMME.map((p) => (
              <div key={p.date} className="overflow-hidden rounded-2xl border border-border bg-surface">
                <div className="bg-brand-deep px-5 py-4">
                  <p className="text-xs font-semibold tracking-wider text-accent uppercase">{p.day}</p>
                  <p className="mt-1 text-2xl font-extrabold text-white">{p.date}</p>
                  <p className="mt-1 font-semibold text-brand-deep-muted">{p.title}</p>
                </div>
                <div className="space-y-5 p-5">
                  <p className="text-sm text-muted">{p.summary}</p>
                  {p.groups.map((g) => (
                    <div key={g.label}>
                      <p className="text-xs font-semibold tracking-wide text-accent-strong uppercase">{g.label}</p>
                      <ul className="mt-2 flex flex-wrap gap-2">
                        {g.items.map((item) => (
                          <li
                            key={item}
                            className="rounded-lg border border-border bg-surface-muted px-3 py-1.5 text-sm font-semibold text-foreground"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <AwardsSectionJump sections={JUMP_SECTIONS} />
    </div>
  );
}
