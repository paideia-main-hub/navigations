import Link from "next/link";
import type { Registration, DisplayStatus } from "@/domain/registrations/types";
import { displayStatusLabels } from "@/domain/registrations/types";
import { registrationDeadlineOf, finalEventDateOf } from "@/domain/competitions/service";
import type { CompetitionSummary } from "@/domain/competitions/types";
import type { ResultInfo } from "@/domain/results/types";
import { Badge } from "@/ui/components/Badge";

const statusTone: Record<DisplayStatus, "success" | "warning" | "neutral" | "accent"> = {
  registered: "warning",
  upcoming: "neutral",
  in_progress: "accent",
  qualified: "success",
  completed: "success",
  rejected: "neutral",
};

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function RegistrationCard({
  registration: r,
  competition: c,
  result,
  status,
}: {
  registration: Registration;
  competition: CompetitionSummary | undefined;
  result: ResultInfo | undefined;
  status: DisplayStatus;
}) {
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
        <Badge tone={statusTone[status]}>{displayStatusLabels[status]}</Badge>
      </div>

      {r.entryType === "team" && r.teamMembers && r.teamMembers.length > 0 && (
        <p className="mt-2 text-xs text-muted">Team: {r.teamMembers.join(", ")}</p>
      )}

      {c &&
        (() => {
          const deadline = registrationDeadlineOf(c);
          const event = finalEventDateOf(c);
          return (
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
              {deadline && (
                <span>
                  Registration closes {new Date(deadline).toLocaleDateString()}
                  {daysUntil(deadline) >= 0 && ` (${daysUntil(deadline)}d)`}
                </span>
              )}
              {event && (
                <span>
                  Event {new Date(event).toLocaleDateString()}
                  {daysUntil(event) >= 0 && ` (${daysUntil(event)}d)`}
                </span>
              )}
            </div>
          );
        })()}

      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href={`/competitions/${r.competitionSlug}#manual`}
          className="rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground hover:border-accent"
        >
          Manual & stage rules
        </Link>
        <Link
          href={`/competitions/${r.competitionSlug}#practice`}
          className="rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground hover:border-accent"
        >
          Practice resources
        </Link>
      </div>

      <div className="mt-3 flex items-center gap-3 border-t border-border pt-3">
        {result?.photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- admin-controlled Supabase Storage / profile photo URL
          <img src={result.photoUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
        )}
        {result ? (
          <p className="text-sm text-foreground">
            Result: <span className="font-semibold">{result.customAwardLabel ?? result.award ?? "Released"}</span>
            {result.score != null && <span className="text-muted"> · Score {result.score}</span>}
          </p>
        ) : (
          <p className="text-xs text-muted">Results not yet released for this competition.</p>
        )}
      </div>
    </div>
  );
}
