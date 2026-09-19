"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  pathwayLabels,
  pathwayOrder,
  type CompetitionPathway,
  type CompetitionSummary,
} from "@/domain/competitions/types";
import { layerLabels, type AwardCategory } from "@/domain/awards/types";
import { CompetitionCard } from "@/ui/components/CompetitionCard";

type Route = 1 | 2;

/** A competition is open to a grade when any of its eligibility rules spans
 * it. Grades are stored as text, so anything non-numeric is ignored rather
 * than guessed at. */
function coversGrade(competition: CompetitionSummary, grade: number): boolean {
  return competition.eligibility.some((rule) => {
    const min = Number(rule.minGrade);
    const max = Number(rule.maxGrade);
    if (!Number.isFinite(min) || !Number.isFinite(max)) return false;
    return grade >= min && grade <= max;
  });
}

function gradesPresent(competitions: CompetitionSummary[]): number[] {
  const seen = new Set<number>();
  for (const c of competitions) {
    for (const rule of c.eligibility) {
      const min = Number(rule.minGrade);
      const max = Number(rule.maxGrade);
      if (!Number.isFinite(min) || !Number.isFinite(max)) continue;
      for (let g = min; g <= max; g++) seen.add(g);
    }
  }
  return [...seen].sort((a, b) => a - b);
}

const selectClass =
  "rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground outline-none focus:border-accent focus-visible:ring-2 focus-visible:ring-accent";

export function ExploreRoutes({
  competitions,
  awardCategories,
}: {
  competitions: CompetitionSummary[];
  awardCategories: AwardCategory[];
}) {
  const [route, setRoute] = useState<Route>(1);
  const [grade, setGrade] = useState<string>("all");
  const [pathway, setPathway] = useState<CompetitionPathway | "all">("all");

  const grades = useMemo(() => gradesPresent(competitions), [competitions]);

  const visible = useMemo(() => {
    return competitions.filter((c) => {
      const gradeOk = grade === "all" || coversGrade(c, Number(grade));
      const pathwayOk = pathway === "all" || c.pathway === pathway;
      return gradeOk && pathwayOk;
    });
  }, [competitions, grade, pathway]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        {/* Route toggle — the two routes from "Ways to Participate". */}
        <div
          role="tablist"
          aria-label="Ways to participate"
          className="inline-flex rounded-lg border border-border bg-surface p-1"
        >
          {([1, 2] as Route[]).map((r) => (
            <button
              key={r}
              role="tab"
              type="button"
              aria-selected={route === r}
              onClick={() => setRoute(r)}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none ${
                route === r ? "bg-accent text-accent-foreground" : "text-muted hover:text-foreground"
              }`}
            >
              Route {r}
              <span className="hidden sm:inline">
                {r === 1 ? " · Competitions" : " · Awards"}
              </span>
            </button>
          ))}
        </div>

        {/* Route 2 is a short, fixed list of what a student may submit to, so
            it carries no filters. */}
        {route === 1 && (
          <>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              aria-label="Filter by grade"
              className={selectClass}
            >
              <option value="all">All grades</option>
              {grades.map((g) => (
                <option key={g} value={g}>
                  Grade {g}
                </option>
              ))}
            </select>

            <select
              value={pathway}
              onChange={(e) => setPathway(e.target.value as CompetitionPathway | "all")}
              aria-label="Filter by category"
              className={selectClass}
            >
              <option value="all">All categories</option>
              {pathwayOrder.map((p) => (
                <option key={p} value={p}>
                  {pathwayLabels[p]}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      {route === 1 ? (
        <>
          <p className="mt-5 text-sm text-muted">
            {visible.length} competition{visible.length === 1 ? "" : "s"}
          </p>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((c) => (
              <CompetitionCard key={c.slug} competition={c} />
            ))}
          </div>
          {visible.length === 0 && (
            <p className="py-12 text-center text-sm text-muted">
              No competitions match those filters.
              {competitions.some((c) => c.pathway === null) && pathway !== "all" && (
                <>
                  {" "}
                  Categories haven&apos;t been assigned yet — pick &ldquo;All categories&rdquo; to see everything.
                </>
              )}
            </p>
          )}
        </>
      ) : (
        <>
          <p className="mt-5 text-sm text-muted">
            {awardCategories.length} award{awardCategories.length === 1 ? "" : "s"} open to a submission
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {awardCategories.map((c) => (
              <Link
                key={c.id}
                href={`/awards/${c.slug}`}
                className="group flex flex-col gap-2 rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-accent"
              >
                <span className="text-xs font-semibold tracking-wide text-muted uppercase">
                  {layerLabels[c.layer]}
                </span>
                <span className="font-bold text-foreground group-hover:text-accent-strong">{c.title}</span>
                {c.description && <span className="line-clamp-3 text-sm text-muted">{c.description}</span>}
                <span className="mt-auto pt-2 text-sm font-semibold text-accent-strong group-hover:underline">
                  View award →
                </span>
              </Link>
            ))}
          </div>
          {awardCategories.length === 0 && (
            <p className="py-12 text-center text-sm text-muted">
              No award categories are open for submissions right now.
            </p>
          )}
        </>
      )}
    </div>
  );
}
