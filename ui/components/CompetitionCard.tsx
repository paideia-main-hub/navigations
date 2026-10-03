"use client";

import Link from "next/link";
import { useState } from "react";
import { pathwayLabels, type CompetitionSummary } from "@/domain/competitions/types";
import { CompetitionCardArt } from "@/ui/components/CompetitionCardArt";

/** Same card as the award cards on /awards (AwardExpandGrid): image on top,
 * then a small accent label, the title, a short description and a round "+"
 * marker. The label is the competition's Route 1 category, playing the role
 * the award cards give to how each award is decided. The whole card links to
 * the competition's page. */
export function CompetitionCard({ competition }: { competition: CompetitionSummary }) {
  const [hovered, setHovered] = useState(false);

  return (
    // Outer shell: no overflow clip so the awards-style hover shadow can ease in/out.
    <div
      className={`group rounded-2xl border bg-surface ${hovered ? "border-accent/40" : "border-border"}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 18px 40px -28px rgba(31,32,65,0.45)"
          : "0 18px 40px -28px rgba(31,32,65,0)",
        transition: "transform 0.3s ease-out, box-shadow 0.3s ease-out, border-color 0.3s ease-out",
      }}
    >
      <Link
        href={`/competitions/${competition.slug}`}
        className="flex h-full flex-col overflow-hidden rounded-2xl"
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
    </div>
  );
}
