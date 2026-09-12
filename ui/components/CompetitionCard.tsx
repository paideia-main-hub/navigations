import Link from "next/link";
import { registrationDeadlineOf } from "@/domain/competitions/service";
import { categoryLabels, statusLabels, type Competition } from "@/domain/competitions/types";
import { Badge } from "./Badge";

function entryTypeLabel(competition: Competition): string {
  if (competition.supportsIndividual && competition.supportsTeam) return "Individual & Team";
  if (competition.supportsTeam) return "Team";
  return "Individual";
}

export function CompetitionCard({ competition }: { competition: Competition }) {
  const deadline = registrationDeadlineOf(competition);

  return (
    <Link
      href={`/competitions/${competition.slug}`}
      className="group flex flex-col gap-3 rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-accent"
    >
      <div className="flex items-center justify-between gap-2">
        <Badge>{competition.domain}</Badge>
        <Badge tone={competition.status === "open" ? "success" : competition.status === "upcoming" ? "warning" : "neutral"}>
          {statusLabels[competition.status]}
        </Badge>
      </div>
      <h3 className="text-lg font-semibold text-foreground group-hover:text-accent">{competition.title}</h3>
      <p className="text-sm text-muted">{competition.shortDescription}</p>
      <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
        {competition.eligibility.map((e) => (
          <span key={e.id} className="rounded-md bg-surface-muted px-2 py-0.5 text-xs text-muted">
            {categoryLabels[e.category]}
          </span>
        ))}
        <span className="rounded-md bg-surface-muted px-2 py-0.5 text-xs text-muted">{entryTypeLabel(competition)}</span>
      </div>
      <p className="text-xs font-medium text-muted">
        {deadline ? `Registration closes ${new Date(deadline).toLocaleDateString()}` : "Registration dates not yet scheduled"}
      </p>
    </Link>
  );
}
