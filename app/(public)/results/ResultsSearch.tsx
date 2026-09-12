"use client";

import { useMemo, useState } from "react";
import type { PublishedWinner } from "@/domain/competitions/service";

export function ResultsSearch({ winners }: { winners: PublishedWinner[] }) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (query.trim() === "") return winners;
    const q = query.toLowerCase();
    return winners.filter(
      (w) => w.studentName.toLowerCase().includes(q) || w.schoolName.toLowerCase().includes(q) || w.competitionTitle.toLowerCase().includes(q),
    );
  }, [winners, query]);

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by student, school or competition…"
        className="mt-6 w-full max-w-md rounded-full border border-border bg-surface px-4 py-2 text-sm text-foreground outline-none focus:border-accent"
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((w, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-border bg-surface">
            {w.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- admin-controlled Supabase Storage URL, not a Next Image host we need to configure
              <img src={w.photoUrl} alt={w.studentName} className="h-40 w-full object-cover" />
            ) : (
              <div className="flex h-40 w-full items-center justify-center bg-surface-muted text-sm text-muted">
                No photo
              </div>
            )}
            <div className="p-4">
              <span className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                {w.customAwardLabel ?? w.award}
              </span>
              <p className="mt-1 font-semibold text-foreground">{w.studentName}</p>
              <p className="text-sm text-muted">{w.schoolName}</p>
              <p className="mt-2 text-xs text-muted">{w.competitionTitle}</p>
            </div>
          </div>
        ))}
        {results.length === 0 && (
          <p className="col-span-full py-12 text-center text-sm text-muted">
            No published results match your search yet.
          </p>
        )}
      </div>
    </div>
  );
}
