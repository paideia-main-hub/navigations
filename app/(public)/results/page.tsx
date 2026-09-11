"use client";

import { useMemo, useState } from "react";
import { listPublishedWinners } from "@/domain/competitions/service";

export default function ResultsPage() {
  const [query, setQuery] = useState("");

  const winners = useMemo(() => {
    const all = listPublishedWinners();
    if (query.trim() === "") return all;
    return all.filter(
      (w) =>
        w.studentName.toLowerCase().includes(query.toLowerCase()) ||
        w.schoolName.toLowerCase().includes(query.toLowerCase()) ||
        w.competitionTitle.toLowerCase().includes(query.toLowerCase()),
    );
  }, [query]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold text-foreground">Results & Winners</h1>
      <p className="mt-2 text-muted">
        Published after admin approval, with student name, school name, competition, award and
        approved photograph where consent has been captured.
      </p>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by student, school or competition…"
        className="mt-6 w-full max-w-md rounded-full border border-border bg-surface px-4 py-2 text-sm text-foreground outline-none focus:border-accent"
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {winners.map((w, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface p-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
              {w.award}
            </span>
            <p className="mt-1 font-semibold text-foreground">{w.studentName}</p>
            <p className="text-sm text-muted">{w.schoolName}</p>
            <p className="mt-2 text-xs text-muted">{w.competitionTitle}</p>
          </div>
        ))}
        {winners.length === 0 && (
          <p className="col-span-full py-12 text-center text-sm text-muted">
            No published results match your search yet.
          </p>
        )}
      </div>
    </div>
  );
}
