import Link from "next/link";
import { resolveCompetitionCardImage } from "@/domain/competitions/cardImage";
import type { Registration, DisplayStatus } from "@/domain/registrations/types";
import { displayStatusLabels } from "@/domain/registrations/types";
import { paymentStatusLabels, type PaymentStatus } from "@/domain/payments/types";
import { finalEventDateOf, resultDateOf, submissionDeadlineOf } from "@/domain/competitions/service";
import type { CompetitionSummary } from "@/domain/competitions/types";
import type { ResultInfo } from "@/domain/results/types";
import { Badge } from "@/ui/components/Badge";
import {
  dashboardCardEyebrowClass,
  dashboardCardRuleClass,
  dashboardCardTitleClass,
  dashboardGlowCardClass,
  dashboardGlowOrbClass,
} from "@/ui/components/dashboard/dashboardGlowCard";

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

export type CardEntrant = {
  name: string;
  entryType: "individual" | "team";
  registrationNumber: string;
  standing: "applied" | "registered";
};

type CardProps = {
  registration: Registration;
  competition: CompetitionSummary | undefined;
  result: ResultInfo | undefined;
  status: DisplayStatus;
  /** School view: every student on this competition, instead of one entrant. */
  entrants?: CardEntrant[];
  /** Overrides the lead registration when one card covers several payments. */
  paymentStatus?: PaymentStatus | null;
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

export function RegistrationCard({ registration: r, competition: c, result, status, entrants, paymentStatus }: CardProps) {
  const payment = paymentStatus === undefined ? r.paymentStatus : paymentStatus;
  const rows = scheduleOf(c).map((row) => ({ ...row, days: daysUntil(row.date) }));
  const upcoming = rows.map((row) => row.days).filter((days) => days >= 0);
  const nextIn = upcoming.length > 0 ? Math.min(...upcoming) : null;
  const imageSrc = resolveCompetitionCardImage(c?.imageUrl);

  return (
    <article className={`${dashboardGlowCardClass}`}>
      <div aria-hidden className={dashboardGlowOrbClass} />
      <div className="relative grid md:grid-cols-[13rem_minmax(0,1fr)]">
        <div className="bg-brand-deep px-4 py-5 text-brand-deep-foreground">
          <p className="text-[11px] font-bold tracking-[0.16em] text-white/55 uppercase">Schedule</p>
          <span aria-hidden className="mt-2 block h-0.5 w-8 rounded-full bg-accent" />
          {rows.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {rows.map((row) => {
                const next = row.days === nextIn;
                return (
                  <li key={row.label}>
                    <p className={`flex items-center gap-2 text-sm ${next ? "font-semibold" : "text-brand-deep-muted"}`}>
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${next ? "bg-accent" : "bg-white/30"}`} />
                      {row.label}
                    </p>
                    <p className="mt-0.5 pl-3.5 text-sm">{formatDate(row.date)}</p>
                    {row.days >= 0 && (
                      <p className={`pl-3.5 text-sm ${next ? "text-accent" : "text-brand-deep-muted"}`}>{daysRemainingLabel(row.days)}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-brand-deep-muted">Dates coming soon.</p>
          )}
        </div>

        <div className="relative flex min-w-0 flex-col overflow-hidden">
          {imageSrc ? (
            <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-full overflow-hidden md:w-1/2">
              {/* eslint-disable-next-line @next/next/no-img-element -- public Supabase Storage URL */}
              <img
                src={imageSrc}
                alt=""
                loading="lazy"
                className="h-full w-full origin-right object-cover object-top transition-transform duration-300 ease-out group-hover:scale-[1.04]"
              />
              {/* Mobile: lighter wash so the photo reads. Desktop: merge into white on the left, clearer image on the right. */}
              <div className="absolute inset-0 bg-white/80 md:bg-gradient-to-r md:from-white md:via-white/55 md:to-transparent" />
            </div>
          ) : null}
          <div className="relative flex min-h-0 flex-1 flex-col">
            <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5">
              <div className="min-w-0">
                <p className={dashboardCardEyebrowClass}>Competition</p>
                <span aria-hidden className={dashboardCardRuleClass} />
                <Link
                  href={`/competitions/${r.competitionSlug}`}
                  className={`mt-3 block ${dashboardCardTitleClass} hover:text-accent`}
                >
                  {r.competitionTitle}
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge tone={statusTone[status]}>{displayStatusLabels[status]}</Badge>
                {payment ? <Badge tone={paymentTone[payment] ?? "neutral"}>{paymentStatusLabels[payment]}</Badge> : null}
              </div>
            </div>
            {entrants && entrants.length > 0 ? (
              <div className="mt-3 px-5">
                <table className="w-full table-fixed border-collapse text-left text-sm">
                  <thead>
                    <tr className="text-xs font-semibold tracking-wide text-muted uppercase">
                      <th className="w-[30%] pb-2 pr-3 font-semibold">Student</th>
                      <th className="w-[16%] pb-2 pr-3 font-semibold">Entry</th>
                      <th className="w-[36%] pb-2 pr-3 font-semibold">Registration number</th>
                      <th className="w-[18%] pb-2 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entrants.map((entrant) => (
                      <tr key={`${entrant.registrationNumber}-${entrant.name}`} className="border-t border-border">
                        <td className="py-2 pr-3 font-medium break-words text-foreground">{entrant.name}</td>
                        <td className="py-2 pr-3 capitalize break-words text-muted">{entrant.entryType}</td>
                        <td className="py-2 pr-3 font-mono text-xs break-all text-foreground">{entrant.registrationNumber}</td>
                        <td className="py-2 break-words text-muted">{entrant.standing === "registered" ? "Registered" : "Applied"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-5">
                <p className="mt-1 text-sm text-muted">
                  {r.entrantName} <span className="capitalize">({r.entryType})</span>
                  <span className="mx-1.5 text-border">·</span>
                  <span className="font-mono text-xs">{r.registrationNumber}</span>
                </p>
                {r.entryType === "team" && r.teamMembers && r.teamMembers.length > 0 && (
                  <p className="mt-1 text-xs text-muted">Team: {r.teamMembers.join(", ")}</p>
                )}
              </div>
            )}

            <div className="mt-auto space-y-3 px-5 pt-4 pb-5">
              <ResourceLinks slug={r.competitionSlug} />
              <ResultLine result={result} />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
