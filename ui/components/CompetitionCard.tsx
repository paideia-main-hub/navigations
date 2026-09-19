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

export function CompetitionCard({ competition }: { competition: CompetitionSummary }) {
  const deadline = registrationDeadlineOf(competition);

  return (
    <Link
      href={`/competitions/${competition.slug}`}
      className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-6 transition-colors hover:border-blue-400 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500"
    >
      <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
        {eligibilityLabel(competition)}
      </p>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 dark:text-slate-50 dark:group-hover:text-blue-400">
          {competition.title}
        </h3>
        <ArenaBadge tone={competition.status === "open" ? "success" : competition.status === "upcoming" ? "warning" : "neutral"}>
          {statusLabels[competition.status]}
        </ArenaBadge>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400">{competition.shortDescription}</p>
      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <span>{entryTypeLabel(competition)}</span>
        <span className="font-semibold text-blue-600 group-hover:underline dark:text-blue-400">View Details →</span>
      </div>
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
        {deadline ? `Registration closes ${new Date(deadline).toLocaleDateString()}` : "Registration dates not yet scheduled"}
      </p>
    </Link>
  );
}
