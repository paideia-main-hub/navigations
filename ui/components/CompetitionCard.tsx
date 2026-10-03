"use client";

import Link from "next/link";
import { useState } from "react";
import { registrationDeadlineOf } from "@/domain/competitions/service";
import { categoryLabels, statusLabels, type CompetitionSummary } from "@/domain/competitions/types";
import { ArenaBadge } from "@/ui/components/marketing/ArenaBadge";
import { CompetitionCardArt } from "@/ui/components/CompetitionCardArt";

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
  const [hovered, setHovered] = useState(false);

  return (
    // Outer shell: no overflow clip so the awards-style hover shadow can ease in/out.
    // Lift/shadow use inline transform + boxShadow so Tailwind v4 translate utilities
    // can’t skip the 0.3s transition (same pattern as AwardExpandGrid).
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

        <div className="flex flex-1 flex-col gap-3 p-6">
          <p className="text-xs font-semibold tracking-wide text-muted uppercase">{eligibilityLabel(competition)}</p>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-bold text-foreground">{competition.title}</h3>
            <ArenaBadge tone={competition.status === "open" ? "success" : competition.status === "upcoming" ? "warning" : "neutral"}>
              {statusLabels[competition.status]}
            </ArenaBadge>
          </div>
          <p className="text-sm text-muted">{competition.shortDescription}</p>
          <div className="mt-auto flex items-center justify-between border-t border-border pt-3 text-xs text-muted">
            <span>{entryTypeLabel(competition)}</span>
            <span className="font-semibold text-accent-strong">View Details →</span>
          </div>
          <p className="text-xs font-medium text-muted">
            {deadline ? `Registration closes ${new Date(deadline).toLocaleDateString("en-GB")}` : "Registration dates not yet scheduled"}
          </p>
        </div>
      </Link>
    </div>
  );
}
