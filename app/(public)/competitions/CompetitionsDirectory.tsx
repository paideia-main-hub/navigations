"use client";

import { useMemo, useState } from "react";
import { filterCompetitionsClientSide } from "@/domain/competitions/service";
import {
  categoryLabels,
  pathwayLabels,
  pathwayOrder,
  statusLabels,
  type AgeCategory,
  type CompetitionPathway,
  type CompetitionStatus,
  type CompetitionSummary,
} from "@/domain/competitions/types";
import { CompetitionCard } from "@/ui/components/CompetitionCard";

type SortOption = "deadline" | "event-date" | "alphabetical";

export function CompetitionsDirectory({
  initialQuery,
  initialCategory = "all",
  initialPathway = "all",
  initialStatus = "all",
  competitions,
}: {
  initialQuery: string;
  initialCategory?: AgeCategory | "all";
  initialPathway?: CompetitionPathway | "all";
  initialStatus?: CompetitionStatus | "all";
  competitions: CompetitionSummary[];
}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<AgeCategory | "all">(initialCategory);
  const [pathway, setPathway] = useState<CompetitionPathway | "all">(initialPathway);
  const [status, setStatus] = useState<CompetitionStatus | "all">(initialStatus);
  const [sort, setSort] = useState<SortOption>("deadline");

  const results = useMemo(
    () => filterCompetitionsClientSide(competitions, { query, category, pathway, status, sort }),
    [competitions, query, category, pathway, status, sort],
  );

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-center">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by competition name…"
          className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground outline-none focus:border-accent"
        />
        <select
          value={pathway}
          onChange={(e) => setPathway(e.target.value as CompetitionPathway | "all")}
          aria-label="Filter by Route 1 category"
          className="rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground"
        >
          <option value="all">All Route 1 categories</option>
          {pathwayOrder.map((p) => (
            <option key={p} value={p}>
              {pathwayLabels[p]}
            </option>
          ))}
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as AgeCategory | "all")}
          aria-label="Filter by grade category"
          className="rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground"
        >
          <option value="all">All grade categories</option>
          {Object.entries(categoryLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as CompetitionStatus | "all")}
          className="rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground"
        >
          <option value="all">Any status</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground"
        >
          <option value="deadline">Registration closing soon</option>
          <option value="event-date">Event date</option>
          <option value="alphabetical">Alphabetical</option>
        </select>
      </div>

      <p className="mb-4 text-sm text-muted">
        {results.length} competition{results.length === 1 ? "" : "s"} found
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((c) => (
          <CompetitionCard key={c.slug} competition={c} />
        ))}
        {results.length === 0 && (
          <p className="col-span-full py-12 text-center text-sm text-muted">
            No competitions match your filters.
          </p>
        )}
      </div>
    </div>
  );
}
