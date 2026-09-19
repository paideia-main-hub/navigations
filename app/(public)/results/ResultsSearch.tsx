"use client";

import { useMemo, useState } from "react";
import type { PublishedWinner } from "@/domain/competitions/service";
import { categoryLabels, type AgeCategory } from "@/domain/competitions/types";
import { ArenaBadge } from "@/ui/components/marketing/ArenaBadge";

export function ResultsSearch({ winners }: { winners: PublishedWinner[] }) {
  const [query, setQuery] = useState("");
  const [competition, setCompetition] = useState("all");
  const [season, setSeason] = useState("all");
  const [category, setCategory] = useState<AgeCategory | "all">("all");

  const competitionOptions = useMemo(
    () => Array.from(new Set(winners.map((w) => w.competitionTitle))).sort(),
    [winners],
  );
  const seasonOptions = useMemo(
    () => Array.from(new Set(winners.map((w) => w.season).filter((s): s is string => Boolean(s)))).sort(),
    [winners],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return winners.filter((w) => {
      const matchesQuery =
        q === "" || w.studentName.toLowerCase().includes(q) || w.schoolName.toLowerCase().includes(q) || w.competitionTitle.toLowerCase().includes(q);
      const matchesCompetition = competition === "all" || w.competitionTitle === competition;
      const matchesSeason = season === "all" || w.season === season;
      const matchesCategory = category === "all" || w.category === category;
      return matchesQuery && matchesCompetition && matchesSeason && matchesCategory;
    });
  }, [winners, query, competition, season, category]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by student, school or competition…"
          className="flex-1 rounded-lg border border-border bg-surface px-4 py-2 text-sm text-foreground outline-none focus:border-accent"
        />
        <select
          value={competition}
          onChange={(e) => setCompetition(e.target.value)}
          className="rounded-lg border border-border bg-surface px-4 py-2 text-sm text-foreground"
        >
          <option value="all">All competitions</option>
          {competitionOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as AgeCategory | "all")}
          className="rounded-lg border border-border bg-surface px-4 py-2 text-sm text-foreground"
        >
          <option value="all">All categories</option>
          {Object.entries(categoryLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {seasonOptions.length > 0 && (
          <select
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            className="rounded-lg border border-border bg-surface px-4 py-2 text-sm text-foreground"
          >
            <option value="all">All seasons</option>
            {seasonOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((w, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-border bg-surface">
            {w.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- admin-controlled Supabase Storage URL
              <img src={w.photoUrl} alt={w.studentName} className="h-40 w-full object-cover" />
            ) : (
              <div className="flex h-40 w-full items-center justify-center bg-surface-muted text-sm text-muted">
                No photo
              </div>
            )}
            <div className="p-4">
              <ArenaBadge tone="warning">{w.customAwardLabel ?? w.award}</ArenaBadge>
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
