"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  competitions,
  categoryLabels,
  statusLabels,
  type AgeCategory,
  type CompetitionStatus,
} from "@/lib/data/competitions";

type SortOption = "deadline" | "event-date" | "alphabetical";

export function CompetitionsDirectory({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<AgeCategory | "all">("all");
  const [status, setStatus] = useState<CompetitionStatus | "all">("all");
  const [sort, setSort] = useState<SortOption>("deadline");

  const results = useMemo(() => {
    let list = competitions.filter((c) => {
      const matchesQuery =
        query.trim() === "" ||
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.domain.toLowerCase().includes(query.toLowerCase());
      const matchesCategory =
        category === "all" || c.eligibility.some((e) => e.category === category);
      const matchesStatus = status === "all" || c.status === status;
      return matchesQuery && matchesCategory && matchesStatus;
    });

    list = [...list].sort((a, b) => {
      if (sort === "alphabetical") return a.title.localeCompare(b.title);
      if (sort === "event-date")
        return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
      return new Date(a.registrationDeadline).getTime() - new Date(b.registrationDeadline).getTime();
    });

    return list;
  }, [query, category, status, sort]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-black/10 p-4 dark:border-white/10 sm:flex-row sm:flex-wrap sm:items-center">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by competition name…"
          className="flex-1 rounded-full border border-black/10 bg-white px-4 py-2 text-sm outline-none focus:border-teal-500 dark:border-white/15 dark:bg-zinc-900"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as AgeCategory | "all")}
          className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm dark:border-white/15 dark:bg-zinc-900"
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
          className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm dark:border-white/15 dark:bg-zinc-900"
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
          className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm dark:border-white/15 dark:bg-zinc-900"
        >
          <option value="deadline">Registration closing soon</option>
          <option value="event-date">Event date</option>
          <option value="alphabetical">Alphabetical</option>
        </select>
      </div>

      <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
        {results.length} competition{results.length === 1 ? "" : "s"} found
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((c) => (
          <Link
            key={c.slug}
            href={`/competitions/${c.slug}`}
            className="flex flex-col gap-3 rounded-2xl border border-black/10 p-6 hover:border-teal-500 dark:border-white/10"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                {c.domain}
              </span>
              <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                {statusLabels[c.status]}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{c.title}</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{c.shortDescription}</p>
            <div className="mt-auto flex flex-wrap gap-1 text-xs text-zinc-500 dark:text-zinc-500">
              {c.eligibility.map((e) => (
                <span key={e.category} className="rounded bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
                  {categoryLabels[e.category]}
                </span>
              ))}
              <span className="rounded bg-zinc-100 px-2 py-0.5 capitalize dark:bg-zinc-800">
                {c.participationType}
              </span>
            </div>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-500">
              Registration closes {new Date(c.registrationDeadline).toLocaleDateString()}
            </p>
          </Link>
        ))}
        {results.length === 0 && (
          <p className="col-span-full py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
            No competitions match your filters.
          </p>
        )}
      </div>
    </div>
  );
}
