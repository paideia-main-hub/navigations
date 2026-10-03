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
  INDEPENDENT_SUBMISSIONS,
  KEY_DATES,
  ON_THE_DAY_NOTE,
  SUBMISSION_CALENDAR,
  SUBMISSION_CALENDAR_INTRO,
  WEEKEND_GAP_NOTE,
  WEEK_ONE,
  WEEK_TWO,
  type ActivityFormat,
  type AwardSubmissionEntry,
  type ScheduledActivity,
  type SubmissionEntry,
} from "@/ui/components/calendar/calendar2026";

export const metadata = { title: "Competition Calendar 2026 | Navigations" };

const JUMP_SECTIONS = [
  { id: "key-dates", label: "Key dates" },
  { id: "week-one", label: "Week one" },
  { id: "week-two", label: "Week two" },
  { id: "independent-submissions", label: "Independent submissions" },
  { id: "submission-showcase", label: "Submission & showcase" },
  { id: "award-submissions", label: "Award submissions" },
  { id: "final-event", label: "Final event programme" },
];

const formatTone: Record<ActivityFormat, "blue" | "warning" | "success" | "neutral"> = {
  "Applied Skills Challenge": "blue",
  "Independent Submission": "success",
  "Live performance": "warning",
  "Project showcase": "success",
  Submission: "neutral",
  Screening: "neutral",
  "Award ceremony": "warning",
};

function FormatBadges({ formats }: { formats: ActivityFormat[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {formats.map((f) => (
        <ArenaBadge key={f} tone={formatTone[f]}>
          {f}
        </ArenaBadge>
      ))}
    </div>
  );
}

/** Groups entries by a label (a date, or an award family) so entries sharing
 * it render under one heading, as the source calendar presents them. */
function groupBy<T>(entries: T[], key: (entry: T) => string): { key: string; items: T[] }[] {
  const groups: { key: string; items: T[] }[] = [];
  for (const entry of entries) {
    const existing = groups.find((g) => g.key === key(entry));
    if (existing) existing.items.push(entry);
    else groups.push({ key: key(entry), items: [entry] });
  }
  return groups;
}

/** One row of a timeline: a heading on the left, cards stacked on the right. */
function TimelineRow({ heading, subheading, children }: { heading: string; subheading: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-3 sm:grid-cols-[130px_1fr] sm:gap-6">
      <div className="sm:pt-4 sm:text-right">
        <p className="text-lg font-bold text-foreground">{heading}</p>
        <p className="text-sm text-muted">{subheading}</p>
      </div>
      <div className="space-y-3 sm:border-l sm:border-border sm:pl-6">{children}</div>
    </div>
  );
}

function TimelineCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted">{description}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function ScheduleTimeline({ activities }: { activities: ScheduledActivity[] }) {
  return (
    <div className="space-y-4">
      {groupBy(activities, (a) => a.date).map((group) => (
        <TimelineRow key={group.key} heading={group.key} subheading={group.items[0].day}>
          {group.items.map((item) => (
            <TimelineCard key={item.name} title={item.name} description={item.nature}>
              <FormatBadges formats={item.formats} />
            </TimelineCard>
          ))}
        </TimelineRow>
      ))}
    </div>
  );
}

function SubmissionTimeline({ entries }: { entries: SubmissionEntry[] }) {
  return (
    <div className="space-y-4">
      {groupBy(entries, (s) => s.date).map((group) => (
        <TimelineRow key={group.key} heading={group.key} subheading={group.items[0].day}>
          {group.items.map((s) => (
            <TimelineCard key={s.competition} title={s.competition} description={s.requirement}>
              <FormatBadges formats={s.formats} />
              <p className="mt-3 text-sm font-semibold text-accent-strong">{s.presentation}</p>
            </TimelineCard>
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
        <TimelineRow key={group.key} heading={group.key} subheading={group.items[0].groupNote}>
          {group.items.map((a) => (
            <TimelineCard key={a.award} title={a.award} description={a.nature}>
              <ArenaBadge tone="neutral">{a.whoMaySubmit}</ArenaBadge>
            </TimelineCard>
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

export default function CalendarPage() {
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
        {/* Strapline — three milestone markers (distinct from Key dates cards) */}
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

        {/* Key dates */}
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

        {/* Week one */}
        <section id="week-one" className="mt-12 scroll-mt-24">
          <SectionHeading
            title="Week one — 23 to 27 November"
            intro="Each activity takes place on the date shown. Where two activities share a date, separate sessions or spaces are assigned. Registration for both routes closes on 10 November."
          />
          <ScheduleTimeline activities={WEEK_ONE} />
          <div className="mt-5 rounded-xl border border-border bg-surface-muted p-4 text-sm text-muted">
            {WEEKEND_GAP_NOTE}
          </div>
          <p className="mt-3 text-xs text-muted">{ON_THE_DAY_NOTE}</p>
        </section>

        {/* Week two */}
        <section id="week-two" className="mt-12 scroll-mt-24">
          <SectionHeading title="Week two — 30 November to 4 December" />
          <ScheduleTimeline activities={WEEK_TWO} />
        </section>

        {/* Independent submissions */}
        <section id="independent-submissions" className="mt-12 scroll-mt-24">
          <SectionHeading title="Independent submissions — 30 November" />
          <ScheduleTimeline activities={INDEPENDENT_SUBMISSIONS} />
        </section>

        {/* Submission and showcase calendar */}
        <section id="submission-showcase" className="mt-12 scroll-mt-24">
          <SectionHeading title="Submission and showcase calendar" intro={SUBMISSION_CALENDAR_INTRO} />
          <SubmissionTimeline entries={SUBMISSION_CALENDAR} />
        </section>

        {/* Award submissions */}
        <section id="award-submissions" className="mt-12 scroll-mt-24">
          <SectionHeading title="Award submission categories" intro={AWARD_SUBMISSION_INTRO} />
          <AwardTimeline entries={AWARD_SUBMISSIONS} />
        </section>

        {/* Final event programme */}
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
