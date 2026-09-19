import Link from "next/link";
import { registrationDeadlineOf } from "@/domain/competitions/service";
import { categoryLabels, statusLabels, type CompetitionSummary } from "@/domain/competitions/types";
import { ArenaBadge } from "@/ui/components/marketing/ArenaBadge";

function entryTypeLabel(competition: CompetitionSummary): string {
  if (competition.supportsIndividual && competition.supportsTeam) return "Individual & Team";
  if (competition.supportsTeam) return "Team";
  return "Individual";
}

// Competitions often open to more than one category (e.g. a Junior and a
// Senior rule), so the strapline spans every eligibility rule rather than
// reading only the first one.
function eligibilityLabel(competition: CompetitionSummary): string {
  const rules = competition.eligibility;
  if (rules.length === 0) return "Uncategorized";

  const categories = [...new Set(rules.map((r) => categoryLabels[r.category]))].join(" & ");
  const grades = rules.flatMap((r) => [r.minGrade, r.maxGrade]).filter((g): g is string => Boolean(g));
  if (grades.length === 0) return categories;

  const numeric = grades.map(Number).filter((n) => Number.isFinite(n));
  if (numeric.length === 0) return `${categories} — Grades ${grades[0]}`;

  const low = Math.min(...numeric);
  const high = Math.max(...numeric);
  return low === high ? `${categories} — Grade ${low}` : `${categories} — Grades ${low}–${high}`;
}

/** An admin-set image wins. Otherwise fall back to the placeholder shipped at
 * public/competitions/<slug>.jpg, which is what every competition shows until
 * real artwork is uploaded. */
function artworkFor(competition: CompetitionSummary): string {
  return competition.imageUrl || `/competitions/${competition.slug}.jpg`;
}

export function CompetitionCard({ competition }: { competition: CompetitionSummary }) {
  const deadline = registrationDeadlineOf(competition);

  return (
    <Link
      href={`/competitions/${competition.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-accent"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-surface-muted">
        {/* eslint-disable-next-line @next/next/no-img-element -- static asset in public/ or an already-public storage URL */}
        <img
          src={artworkFor(competition)}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
      <p className="text-xs font-semibold tracking-wide text-muted uppercase">
        {eligibilityLabel(competition)}
      </p>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-bold text-foreground group-hover:text-accent-strong">
          {competition.title}
        </h3>
        <ArenaBadge tone={competition.status === "open" ? "success" : competition.status === "upcoming" ? "warning" : "neutral"}>
          {statusLabels[competition.status]}
        </ArenaBadge>
      </div>
      <p className="text-sm text-muted">{competition.shortDescription}</p>
      <div className="mt-auto flex items-center justify-between border-t border-border pt-3 text-xs text-muted">
        <span>{entryTypeLabel(competition)}</span>
        <span className="font-semibold text-accent-strong group-hover:underline">View Details →</span>
      </div>
      <p className="text-xs font-medium text-muted">
        {deadline ? `Registration closes ${new Date(deadline).toLocaleDateString()}` : "Registration dates not yet scheduled"}
      </p>
      </div>
    </Link>
  );
}
