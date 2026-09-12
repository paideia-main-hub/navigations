"use client";

import { useMemo, useState } from "react";
import { filterCompetitionsClientSide } from "@/domain/competitions/service";
import { categoryLabels, statusLabels, type AgeCategory, type Competition, type CompetitionStatus } from "@/domain/competitions/types";
import { CompetitionCard } from "@/ui/components/CompetitionCard";

type SortOption = "deadline" | "event-date" | "alphabetical";

export function CompetitionsDirectory({
  initialQuery,
  competitions,
}: {
  initialQuery: string;
  competitions: Competition[];
}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<AgeCategory | "all">("all");
  const [status, setStatus] = useState<CompetitionStatus | "all">("all");
  const [sort, setSort] = useState<SortOption>("deadline");

  const results = useMemo(
    () => filterCompetitionsClientSide(competitions, { query, category, status, sort }),
    [competitions, query, category, status, sort],
  );

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:flex-wrap sm:items-center">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by competition name…"
          className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground outline-none focus:border-accent"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as AgeCategory | "all")}
          className="rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground"
        >
          <option value="all">All categories</option>
          {Object.entries(categoryLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as CompetitionStatus | "all")}
          className="rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground"
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
          className="rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground"
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
