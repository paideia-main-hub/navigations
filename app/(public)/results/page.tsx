"use client";

import { useMemo, useState } from "react";
import { competitions } from "@/lib/data/competitions";

export default function ResultsPage() {
  const [query, setQuery] = useState("");

  const winners = useMemo(
    () =>
      competitions.flatMap((c) => c.winners.map((w) => ({ ...w, competition: c.title }))).filter(
        (w) =>
          query.trim() === "" ||
          w.studentName.toLowerCase().includes(query.toLowerCase()) ||
          w.schoolName.toLowerCase().includes(query.toLowerCase()) ||
          w.competition.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Results & Winners</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Published after admin approval, with student name, school name, competition, award and
        approved photograph where consent has been captured.
      </p>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by student, school or competition…"
        className="mt-6 w-full max-w-md rounded-full border border-black/10 bg-white px-4 py-2 text-sm outline-none focus:border-teal-500 dark:border-white/15 dark:bg-zinc-900"
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {winners.map((w, i) => (
          <div key={i} className="rounded-xl border border-black/10 p-4 dark:border-white/10">
            <span className="text-xs font-semibold uppercase tracking-wide text-amber-600">{w.award}</span>
            <p className="mt-1 font-semibold text-zinc-900 dark:text-zinc-50">{w.studentName}</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{w.schoolName}</p>
            <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">{w.competition}</p>
          </div>
        ))}
        {winners.length === 0 && (
          <p className="col-span-full py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
            No published results match your search yet.
          </p>
        )}
      </div>
    </div>
  );
}
