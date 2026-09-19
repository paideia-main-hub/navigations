"use client";

import { useMemo, useState } from "react";
import { filterCompetitionsClientSide } from "@/domain/competitions/service";
import { categoryLabels, statusLabels, type AgeCategory, type CompetitionStatus, type CompetitionSummary } from "@/domain/competitions/types";
import { CompetitionCard } from "@/ui/components/CompetitionCard";

type SortOption = "deadline" | "event-date" | "alphabetical";

export function CompetitionsDirectory({
  initialQuery,
  initialCategory = "all",
  initialStatus = "all",
  competitions,
}: {
  initialQuery: string;
  initialCategory?: AgeCategory | "all";
  initialStatus?: CompetitionStatus | "all";
  competitions: CompetitionSummary[];
}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<AgeCategory | "all">(initialCategory);
  const [status, setStatus] = useState<CompetitionStatus | "all">(initialStatus);
  const [sort, setSort] = useState<SortOption>("deadline");

  const results = useMemo(
    () => filterCompetitionsClientSide(competitions, { query, category, status, sort }),
    [competitions, query, category, status, sort],
  );

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-center dark:border-slate-800 dark:bg-slate-900">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by competition name…"
          className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as AgeCategory | "all")}
          className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
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
          className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
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
          className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        >
          <option value="deadline">Registration closing soon</option>
          <option value="event-date">Event date</option>
          <option value="alphabetical">Alphabetical</option>
        </select>
      </div>

      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
        {results.length} competition{results.length === 1 ? "" : "s"} found
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((c) => (
          <CompetitionCard key={c.slug} competition={c} />
        ))}
        {results.length === 0 && (
          <p className="col-span-full py-12 text-center text-sm text-slate-500 dark:text-slate-400">
            No competitions match your filters.
          </p>
        )}
      </div>
    </div>
  );
}
