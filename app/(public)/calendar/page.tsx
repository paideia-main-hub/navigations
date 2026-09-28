import { createClient } from "@/data/supabase/server";
import { upcomingDates } from "@/domain/competitions/service";
import { PageBanner } from "@/ui/components/marketing/PageBanner";
import { ArenaBadge } from "@/ui/components/marketing/ArenaBadge";
import {
  ADDITIONAL_NOMINATIONS_NOTE,
  AWARD_SUBMISSIONS,
  AWARD_SUBMISSION_INTRO,
  CALENDAR_INTRO,
  CALENDAR_STRAPLINE,
  FINAL_EVENT_NOTE,
  FINAL_EVENT_PROGRAMME,
  FORMAT_LEGEND,
  KEY_DATES,
  ON_THE_DAY_NOTE,
  SCHEDULING_NOTE,
  SUBMISSION_CALENDAR,
  SUBMISSION_CALENDAR_INTRO,
  WEEKEND_GAP_NOTE,
  WEEK_ONE,
  WEEK_TWO,
  type ActivityFormat,
  type ScheduledActivity,
} from "@/ui/components/calendar/calendar2026";

export const metadata = { title: "Competition Calendar 2026 | Navigations" };

const formatTone: Record<ActivityFormat, "blue" | "warning" | "success" | "neutral"> = {
  "One-day activity": "blue",
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

/** Groups a week's activities by their date so two competitions sharing a
 * date render under one date heading, as the source calendar presents them. */
function groupByDate(activities: ScheduledActivity[]): { date: string; day: string; items: ScheduledActivity[] }[] {
  const groups: { date: string; day: string; items: ScheduledActivity[] }[] = [];
  for (const activity of activities) {
    const existing = groups.find((g) => g.date === activity.date);
    if (existing) existing.items.push(activity);
    else groups.push({ date: activity.date, day: activity.day, items: [activity] });
  }
  return groups;
}

function ScheduleTimeline({ activities }: { activities: ScheduledActivity[] }) {
  return (
    <div className="space-y-4">
      {groupByDate(activities).map((group) => (
        <div key={group.date} className="grid gap-3 sm:grid-cols-[130px_1fr] sm:gap-6">
          <div className="sm:pt-4 sm:text-right">
            <p className="text-lg font-bold text-foreground">{group.date}</p>
            <p className="text-sm text-muted">{group.day}</p>
          </div>
          <div className="space-y-3 sm:border-l sm:border-border sm:pl-6">
            {group.items.map((item) => (
              <div key={item.name} className="rounded-xl border border-border bg-surface p-4">
                <p className="font-semibold text-foreground">{item.name}</p>
                <p className="mt-1 text-sm text-muted">{item.nature}</p>
                <div className="mt-3">
                  <FormatBadges formats={item.formats} />
                </div>
              </div>
            ))}
          </div>
        </div>
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
  const dates = await upcomingDates(supabase);

  return (
    <div className="bg-background">
      <PageBanner eyebrow="Competition Calendar 2026" title="Future Ready League Calendar" subtitle={CALENDAR_INTRO} />

      <div className="mx-auto max-w-5xl px-6 py-12">
        {/* Strapline */}
        <div className="flex flex-wrap gap-3">
          {CALENDAR_STRAPLINE.map((item) => (
            <span
              key={item}
              className="rounded-full border border-accent bg-accent-soft px-4 py-2 text-sm font-semibold text-accent-strong"
            >
              {item}
            </span>
          ))}
        </div>

        {/* Key dates */}
        <section className="mt-12">
          <SectionHeading title="Key dates" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {KEY_DATES.map((d) => (
              <div key={d.milestone} className="rounded-xl border border-border bg-surface p-5">
                <p className="text-xs font-semibold tracking-wide text-accent-strong uppercase">{d.milestone}</p>
                <p className="mt-2 font-bold text-foreground">{d.date}</p>
                <p className="mt-2 text-sm text-muted">{d.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Format legend */}
        <section className="mt-12">
          <SectionHeading title="Activity formats" />
          <div className="grid gap-3 sm:grid-cols-2">
            {FORMAT_LEGEND.map((f) => (
              <div key={f.format} className="rounded-xl border border-border bg-surface p-4">
                <ArenaBadge tone={formatTone[f.format]}>{f.format}</ArenaBadge>
                <p className="mt-2 text-sm text-muted">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Week one */}
        <section className="mt-12">
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
        <section className="mt-12">
          <SectionHeading title="Week two — 30 November to 4 December" />
          <ScheduleTimeline activities={WEEK_TWO} />
        </section>

        {/* Final event programme */}
        <section className="mt-12">
          <SectionHeading title="Final event programme" />
          <div className="grid gap-4 sm:grid-cols-2">
            {FINAL_EVENT_PROGRAMME.map((p) => (
              <div key={p.date} className="rounded-xl border border-border bg-surface p-5">
                <p className="font-bold text-foreground">{p.date}</p>
                <p className="mt-2 text-sm text-muted">{p.detail}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted">{FINAL_EVENT_NOTE}</p>
        </section>

        {/* Submission and showcase calendar */}
        <section className="mt-12">
          <SectionHeading title="Submission and showcase calendar" intro={SUBMISSION_CALENDAR_INTRO} />
          <div className="overflow-x-auto rounded-xl border border-border bg-surface">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="px-4 py-3 font-medium">Competition</th>
                  <th className="px-4 py-3 font-medium">Required submission</th>
                  <th className="px-4 py-3 font-medium">Format</th>
                  <th className="px-4 py-3 font-medium">Presentation or display</th>
                </tr>
              </thead>
              <tbody>
                {SUBMISSION_CALENDAR.map((s) => (
                  <tr key={s.competition} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground align-top">{s.competition}</td>
                    <td className="px-4 py-3 text-muted align-top">{s.requirement}</td>
                    <td className="px-4 py-3 align-top">
                      <FormatBadges formats={s.formats} />
                    </td>
                    <td className="px-4 py-3 text-muted align-top">{s.presentation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Award submissions */}
        <section className="mt-12">
          <SectionHeading title="Award submission categories" intro={AWARD_SUBMISSION_INTRO} />
          <div className="overflow-x-auto rounded-xl border border-border bg-surface">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="px-4 py-3 font-medium">Award</th>
                  <th className="px-4 py-3 font-medium">Nature of submission</th>
                  <th className="px-4 py-3 font-medium">Who may submit</th>
                </tr>
              </thead>
              <tbody>
                {AWARD_SUBMISSIONS.map((a) => (
                  <tr key={a.award} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground align-top">{a.award}</td>
                    <td className="px-4 py-3 text-muted align-top">{a.nature}</td>
                    <td className="px-4 py-3 text-muted align-top">{a.whoMaySubmit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted">{ADDITIONAL_NOMINATIONS_NOTE}</p>
        </section>

        {/* Scheduling note */}
        <p className="mt-12 rounded-xl border border-border bg-surface p-4 text-xs text-muted">
          {SCHEDULING_NOTE}
        </p>

        {/* Per-competition dates set in the admin CMS — only shown once some exist. */}
        {dates.length > 0 && (
          <section className="mt-12">
            <SectionHeading title="Competition-specific dates" intro="Round, deadline and result dates published per competition." />
            <div className="divide-y divide-border rounded-2xl border border-border bg-surface">
              {dates.map((d, i) => (
                <div key={i} className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <ArenaBadge tone="blue">{d.label}</ArenaBadge>
                    <p className="mt-1 font-semibold text-foreground">{d.competition}</p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-accent-strong">
                    {new Date(d.date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
