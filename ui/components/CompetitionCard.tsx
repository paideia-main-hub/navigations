import Link from "next/link";
import { pathwayLabels, type CompetitionSummary } from "@/domain/competitions/types";
import { CompetitionCardArt } from "@/ui/components/CompetitionCardArt";

/** Same card as the award cards on /awards (AwardExpandGrid): image on top,
 * then a small accent label, the title, a short description and a round "+"
 * marker. The label is the competition's Route 1 category, playing the role
 * the award cards give to how each award is decided. The whole card links to
 * the competition's page. */
export function CompetitionCard({ competition }: { competition: CompetitionSummary }) {
  return (
    <Link
      href={`/competitions/${competition.slug}`}
      className="group block overflow-hidden rounded-2xl border border-border bg-surface transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_18px_40px_-28px_rgba(31,32,65,0.45)]"
    >
      <CompetitionCardArt imageUrl={competition.imageUrl} title={competition.title} />

      <div className="flex items-start gap-3 p-5">
        <span className="flex-1">
          {competition.pathway && (
            <span className="text-[0.68rem] font-semibold tracking-[0.16em] text-accent-strong uppercase">
              {pathwayLabels[competition.pathway]}
            </span>
          )}
          <span className="mt-1 block leading-snug font-bold text-foreground">{competition.title}</span>
          <span className="mt-1.5 line-clamp-3 block text-sm text-muted">{competition.shortDescription}</span>
        </span>
        <span
          aria-hidden="true"
          className="relative mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-border text-muted transition-colors duration-300 group-hover:border-accent group-hover:text-accent"
        >
          <span className="absolute h-2.5 w-px bg-current" />
          <span className="absolute h-px w-2.5 bg-current" />
        </span>
      </div>
    </Link>
  );
}
