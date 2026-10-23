"use client";

import Link from "next/link";
import { pathwayLabels, type CompetitionSummary } from "@/domain/competitions/types";
import { CompetitionCardArt } from "@/ui/components/CompetitionCardArt";

/** Route 1 competition card. Hover lift is permanent below `lg` (no image zoom).
 * “View details” sits on a shared baseline via flex so equal-height cards align. */
export function CompetitionCard({ competition }: { competition: CompetitionSummary }) {
  return (
    <div className="group flex h-full flex-col rounded-2xl border border-accent/40 bg-surface shadow-[0_18px_40px_-28px_rgba(31,32,65,0.45)] transition-[translate,box-shadow,border-color] duration-300 ease-out max-lg:-translate-y-1 lg:translate-y-0 lg:border-border lg:shadow-[0_18px_40px_-28px_rgba(31,32,65,0)] lg:hover:-translate-y-1 lg:hover:border-accent/40 lg:hover:shadow-[0_18px_40px_-28px_rgba(31,32,65,0.45)]">
      <Link
        href={`/competitions/${competition.slug}`}
        className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-2xl"
      >
        <CompetitionCardArt imageUrl={competition.imageUrl} title={competition.title} />

        <div className="flex min-h-0 flex-1 flex-col p-5">
          <div className="min-w-0">
            {competition.pathway && (
              <span className="text-[0.68rem] font-semibold tracking-[0.16em] text-accent-strong uppercase">
                {pathwayLabels[competition.pathway]}
              </span>
            )}
            <span className="mt-1 block leading-snug font-bold text-foreground">{competition.title}</span>
            <span className="mt-1.5 line-clamp-3 block text-sm text-muted">{competition.shortDescription}</span>
          </div>

          <span className="mt-auto self-end pt-4 text-sm font-semibold text-accent-strong">
            View details
            <span
              aria-hidden="true"
              className="ml-1 inline-block transition-transform duration-300 group-hover:translate-x-0.5"
            >
              →
            </span>
          </span>
        </div>
      </Link>
    </div>
  );
}
