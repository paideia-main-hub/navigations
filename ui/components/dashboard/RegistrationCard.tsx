import Link from "next/link";
import type { Registration, DisplayStatus } from "@/domain/registrations/types";
import { displayStatusLabels } from "@/domain/registrations/types";
import { paymentStatusLabels } from "@/domain/payments/types";
import { finalEventDateOf, resultDateOf, submissionDeadlineOf } from "@/domain/competitions/service";
import type { CompetitionSummary } from "@/domain/competitions/types";
import type { ResultInfo } from "@/domain/results/types";
import { Badge } from "@/ui/components/Badge";

/** 1 = wrapped date chips with an orange day badge on every date.
 *  2 = a timetable rail; only the next deadline is highlighted.
 *  3 = one row per date: label, date, and days remaining.
 *  4 = the next deadline as a large count; later dates stay as quiet lines.
 *  5 = indigo poster panel with the countdown, schedule on the white side. */
const CARD_DESIGN = 5;

const statusTone: Record<DisplayStatus, "success" | "warning" | "neutral" | "accent"> = {
  registered: "warning",
  upcoming: "neutral",
  in_progress: "accent",
  qualified: "success",
  completed: "success",
  rejected: "neutral",
};

const paymentTone: Record<string, "success" | "warning" | "neutral"> = {
  approved: "success",
  pending_review: "warning",
  rejected: "neutral",
};

type CardProps = {
  registration: Registration;
  competition: CompetitionSummary | undefined;
  result: ResultInfo | undefined;
  status: DisplayStatus;
};

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB");
}

function daysRemainingLabel(days: number): string {
  return days === 1 ? "1 day remaining" : `${days} days remaining`;
}

function LinkArrow() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const resourceLinkClass =
  "inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-accent hover:text-accent-strong";

function scheduleOf(competition: CompetitionSummary | undefined) {
  if (!competition) return [];
  const rows: { label: string; date: string }[] = [];
  const onlineSubmission = competition.hasOnlineSubmission ? submissionDeadlineOf(competition) : undefined;
  const event = finalEventDateOf(competition);
  const resultDay = resultDateOf(competition);
  if (onlineSubmission) rows.push({ label: "Online submission", date: onlineSubmission });
  if (event) rows.push({ label: "Event", date: event });
  if (resultDay) rows.push({ label: "Result day", date: resultDay });
  return rows;
}

function ResourceLinks({ slug }: { slug: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link href={`/competitions/${slug}#manual`} className={resourceLinkClass}>
        Manual & stage rules
        <LinkArrow />
      </Link>
      <Link href={`/competitions/${slug}#practice`} className={resourceLinkClass}>
        Practice resources
        <LinkArrow />
      </Link>
    </div>
  );
}

function ResultLine({ result }: { result: ResultInfo | undefined }) {
  if (!result) {
    return <p className="text-xs text-muted">Results not yet released for this competition.</p>;
  }
  return (
    <div className="flex items-center gap-3">
      {result.photoUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- admin-controlled Supabase Storage / profile photo URL
        <img src={result.photoUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
      )}
      <p className="text-sm text-foreground">
        Result: <span className="font-semibold">{result.customAwardLabel ?? result.award ?? "Released"}</span>
        {result.score != null && <span className="text-muted"> · Score {result.score}</span>}
      </p>
    </div>
  );
}

function RegistrationCardDesign1({ registration: r, competition: c, result, status }: CardProps) {
  const rows = scheduleOf(c);

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <Link href={`/competitions/${r.competitionSlug}`} className="font-semibold text-foreground hover:text-accent">
            {r.competitionTitle}
          </Link>
          <p className="text-sm text-muted">
            {r.entrantName} <span className="capitalize">({r.entryType})</span> · {r.registrationNumber}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge tone={statusTone[status]}>{displayStatusLabels[status]}</Badge>
          {r.paymentStatus && <Badge tone={paymentTone[r.paymentStatus]}>{paymentStatusLabels[r.paymentStatus]}</Badge>}
        </div>
      </div>

      {r.entryType === "team" && r.teamMembers && r.teamMembers.length > 0 && (
        <p className="mt-2 text-xs text-muted">Team: {r.teamMembers.join(", ")}</p>
      )}

      {rows.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {rows.map((row) => {
            const days = daysUntil(row.date);
            return (
              <p key={row.label} className="inline-flex items-center gap-2 rounded-lg bg-surface-muted px-3 py-1.5 text-sm text-foreground">
                <span className="text-muted">{row.label}</span>
                <span className="font-semibold">{formatDate(row.date)}</span>
                {days >= 0 && (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground">{days}d</span>
                )}
              </p>
            );
          })}
        </div>
      )}

      <div className="mt-3">
        <ResourceLinks slug={r.competitionSlug} />
      </div>

      <div className="mt-3 border-t border-border pt-3">
        <ResultLine result={result} />
      </div>
    </div>
  );
}

function RegistrationCardDesign2({ registration: r, competition: c, result, status }: CardProps) {
  const rows = scheduleOf(c);
  const upcoming = rows.map((row) => daysUntil(row.date)).filter((days) => days >= 0);
  const nextIn = upcoming.length > 0 ? Math.min(...upcoming) : null;

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-4 pb-3">
        <div className="min-w-0">
          <Link href={`/competitions/${r.competitionSlug}`} className="font-heading text-lg font-bold text-foreground hover:text-accent">
            {r.competitionTitle}
          </Link>
          <p className="mt-0.5 text-sm text-muted">
            {r.entrantName} <span className="capitalize">({r.entryType})</span>
            <span className="mx-1.5 text-border">·</span>
            <span className="font-mono text-xs">{r.registrationNumber}</span>
          </p>
          {r.entryType === "team" && r.teamMembers && r.teamMembers.length > 0 && (
            <p className="mt-1 text-xs text-muted">Team: {r.teamMembers.join(", ")}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone={statusTone[status]}>{displayStatusLabels[status]}</Badge>
          {r.paymentStatus && <Badge tone={paymentTone[r.paymentStatus]}>{paymentStatusLabels[r.paymentStatus]}</Badge>}
        </div>
      </div>

      {rows.length > 0 && (
        <div className="grid grid-cols-2 gap-px border-y border-border bg-border sm:grid-cols-[repeat(auto-fit,minmax(10rem,1fr))]">
          {rows.map((row) => {
            const days = daysUntil(row.date);
            const next = days === nextIn;
            return (
              <div key={row.label} className="bg-surface px-4 py-3">
                <p className="text-[0.65rem] font-semibold tracking-[0.12em] text-muted uppercase">{row.label}</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{formatDate(row.date)}</p>
                {days >= 0 && (
                  <p className={`mt-0.5 text-xs font-semibold ${next ? "text-accent-strong" : "text-muted"}`}>
                    {daysRemainingLabel(days)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="space-y-3 px-4 py-3">
        <ResourceLinks slug={r.competitionSlug} />
        <ResultLine result={result} />
      </div>
    </article>
  );
}

function RegistrationCardDesign3({ registration: r, competition: c, result, status }: CardProps) {
  const rows = scheduleOf(c);
  const upcoming = rows.map((row) => daysUntil(row.date)).filter((days) => days >= 0);
  const nextIn = upcoming.length > 0 ? Math.min(...upcoming) : null;

  return (
    <article className="rounded-xl border border-border bg-surface">
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-4 pb-3">
        <div className="min-w-0">
          <Link href={`/competitions/${r.competitionSlug}`} className="font-heading text-lg font-bold text-foreground hover:text-accent">
            {r.competitionTitle}
          </Link>
          <p className="mt-0.5 text-sm text-muted">
            {r.entrantName} <span className="capitalize">({r.entryType})</span>
            <span className="mx-1.5 text-border">·</span>
            <span className="font-mono text-xs">{r.registrationNumber}</span>
          </p>
          {r.entryType === "team" && r.teamMembers && r.teamMembers.length > 0 && (
            <p className="mt-1 text-xs text-muted">Team: {r.teamMembers.join(", ")}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone={statusTone[status]}>{displayStatusLabels[status]}</Badge>
          {r.paymentStatus && <Badge tone={paymentTone[r.paymentStatus]}>{paymentStatusLabels[r.paymentStatus]}</Badge>}
        </div>
      </div>

      {rows.length > 0 && (
        <ul className="divide-y divide-border border-y border-border">
          {rows.map((row) => {
            const days = daysUntil(row.date);
            const next = days === nextIn;
            return (
              <li
                key={row.label}
                className={`grid gap-1 border-l-2 px-4 py-2.5 sm:grid-cols-[minmax(0,1.3fr)_7.5rem_auto] sm:items-center sm:gap-4 ${
                  next ? "border-accent bg-accent-soft/60" : "border-transparent"
                }`}
              >
                <p className="text-sm font-medium text-foreground">{row.label}</p>
                <p className="font-mono text-sm text-foreground">{formatDate(row.date)}</p>
                {days >= 0 && (
                  <p className={`text-sm font-semibold sm:text-right ${next ? "text-accent-strong" : "text-muted"}`}>
                    {daysRemainingLabel(days)}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <div className="space-y-3 px-4 py-3">
        <ResourceLinks slug={r.competitionSlug} />
        <ResultLine result={result} />
      </div>
    </article>
  );
}

function RegistrationCardDesign4({ registration: r, competition: c, result, status }: CardProps) {
  const rows = scheduleOf(c).map((row) => ({ ...row, days: daysUntil(row.date) }));
  const upcoming = rows.map((row) => row.days).filter((days) => days >= 0);
  const nextIn = upcoming.length > 0 ? Math.min(...upcoming) : null;
  const nextRows = nextIn === null ? [] : rows.filter((row) => row.days === nextIn);
  const laterRows = nextIn === null ? rows : rows.filter((row) => row.days !== nextIn);

  return (
    <article className="rounded-2xl border border-border bg-surface shadow-sm shadow-black/5">
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5">
        <div className="min-w-0">
          <Link href={`/competitions/${r.competitionSlug}`} className="font-heading text-xl font-extrabold tracking-tight text-foreground hover:text-accent">
            {r.competitionTitle}
          </Link>
          <p className="mt-1 text-sm text-muted">
            {r.entrantName} <span className="capitalize">({r.entryType})</span>
            <span className="mx-1.5 text-border">·</span>
            <span className="font-mono text-xs">{r.registrationNumber}</span>
          </p>
          {r.entryType === "team" && r.teamMembers && r.teamMembers.length > 0 && (
            <p className="mt-1 text-xs text-muted">Team: {r.teamMembers.join(", ")}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone={statusTone[status]}>{displayStatusLabels[status]}</Badge>
          {r.paymentStatus && <Badge tone={paymentTone[r.paymentStatus]}>{paymentStatusLabels[r.paymentStatus]}</Badge>}
        </div>
      </div>

      {nextIn !== null && (
        <div className="mx-5 mt-4 flex items-end gap-4 rounded-2xl bg-accent-soft px-4 py-4">
          <p className="font-heading text-5xl leading-none font-extrabold text-accent-strong">{nextIn}</p>
          <div className="min-w-0 pb-1">
            <p className="text-sm font-semibold text-foreground">days remaining</p>
            {nextRows.map((row) => (
              <p key={row.label} className="truncate text-xs text-muted">
                {row.label} · {formatDate(row.date)}
              </p>
            ))}
          </div>
        </div>
      )}

      {laterRows.length > 0 && (
        <ul className="mt-3 space-y-1.5 px-5">
          {laterRows.map((row) => (
            <li key={row.label} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 text-sm">
              <span className="text-muted">{row.label}</span>
              <span className="font-medium text-foreground">
                {formatDate(row.date)}
                {row.days >= 0 && <span className="font-normal text-muted"> · {daysRemainingLabel(row.days)}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 space-y-3 border-t border-border px-5 py-4">
        <ResourceLinks slug={r.competitionSlug} />
        <ResultLine result={result} />
      </div>
    </article>
  );
}

function RegistrationCardDesign5({ registration: r, competition: c, result, status }: CardProps) {
  const rows = scheduleOf(c).map((row) => ({ ...row, days: daysUntil(row.date) }));
  const upcoming = rows.map((row) => row.days).filter((days) => days >= 0);
  const nextIn = upcoming.length > 0 ? Math.min(...upcoming) : null;

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_50px_-32px_rgba(31,32,65,0.55)]">
      <div className="grid md:grid-cols-[minmax(18rem,22rem)_1fr]">
        <div className="bg-brand-deep px-5 py-5 text-brand-deep-foreground">
          {rows.length > 0 && (
            <ul className="space-y-3">
              {rows.map((row) => {
                const next = row.days === nextIn;
                return (
                  <li key={row.label}>
                    <p className={`flex items-center gap-2 text-sm ${next ? "font-semibold" : "text-brand-deep-muted"}`}>
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${next ? "bg-accent" : "bg-white/30"}`} />
                      {row.label}
                    </p>
                    <p className="mt-0.5 pl-3.5 text-sm">
                      {formatDate(row.date)}
                      {row.days >= 0 && (
                        <span className={next ? "font-semibold text-accent" : "text-brand-deep-muted"}>
                          {" "}
                          · {daysRemainingLabel(row.days)}
                        </span>
                      )}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex min-w-0 flex-col">
          <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5">
            <div className="min-w-0">
              <Link href={`/competitions/${r.competitionSlug}`} className="font-heading text-xl font-extrabold tracking-tight text-foreground hover:text-accent">
                {r.competitionTitle}
              </Link>
              <p className="mt-1 text-sm text-muted">
                {r.entrantName} <span className="capitalize">({r.entryType})</span>
                <span className="mx-1.5 text-border">·</span>
                <span className="font-mono text-xs">{r.registrationNumber}</span>
              </p>
              {r.entryType === "team" && r.teamMembers && r.teamMembers.length > 0 && (
                <p className="mt-1 text-xs text-muted">Team: {r.teamMembers.join(", ")}</p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge tone={statusTone[status]}>{displayStatusLabels[status]}</Badge>
              {r.paymentStatus && <Badge tone={paymentTone[r.paymentStatus]}>{paymentStatusLabels[r.paymentStatus]}</Badge>}
            </div>
          </div>

          <div className="mt-auto space-y-3 px-5 pt-4 pb-5">
            <ResourceLinks slug={r.competitionSlug} />
            <ResultLine result={result} />
          </div>
        </div>
      </div>
    </article>
  );
}

export function RegistrationCard(props: CardProps) {
  if (CARD_DESIGN === 1) return <RegistrationCardDesign1 {...props} />;
  if (CARD_DESIGN === 2) return <RegistrationCardDesign2 {...props} />;
  if (CARD_DESIGN === 3) return <RegistrationCardDesign3 {...props} />;
  if (CARD_DESIGN === 4) return <RegistrationCardDesign4 {...props} />;
  return <RegistrationCardDesign5 {...props} />;
}
