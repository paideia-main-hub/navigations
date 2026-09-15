import Link from "next/link";
import { registrationDeadlineOf } from "@/domain/competitions/service";
import { categoryLabels, statusLabels, type Competition } from "@/domain/competitions/types";
import { ArenaBadge } from "@/ui/components/marketing/ArenaBadge";

function entryTypeLabel(competition: Competition): string {
  if (competition.supportsIndividual && competition.supportsTeam) return "Individual & Team";
  if (competition.supportsTeam) return "Team";
  return "Individual";
}

export function CompetitionCard({ competition }: { competition: Competition }) {
  const deadline = registrationDeadlineOf(competition);
  const primaryCategory = competition.eligibility[0]?.category;

  return (
    <Link
      href={`/competitions/${competition.slug}`}
      className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-6 transition-colors hover:border-blue-400 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500"
    >
      <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
        {primaryCategory ? categoryLabels[primaryCategory] : "Uncategorized"} — Ages {competition.eligibility[0]?.minGrade ?? "—"}
        {"–"}
        {competition.eligibility[0]?.maxGrade ?? "—"}
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
