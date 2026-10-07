"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { AdminSubmissionRow } from "@/data/repositories/submissions.repository";
import { categoryLabels, type AgeCategory } from "@/domain/competitions/types";
import { submissionStatusLabels, type SubmissionStatus } from "@/domain/submissions/config";

export function SubmissionsTable({
  submissions,
  competitions,
  initialCompetition,
}: {
  submissions: AdminSubmissionRow[];
  competitions: { slug: string; title: string }[];
  initialCompetition: string;
}) {
  const [competition, setCompetition] = useState(initialCompetition);
  const [status, setStatus] = useState<SubmissionStatus | "all">("all");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return submissions.filter(
      (s) =>
        s.competitionSlug === competition &&
        (status === "all" || s.status === status) &&
        (!q || [s.entrantName, s.frlId, s.registrationNumber, s.schoolName, s.answers.title].some((v) => v?.toLowerCase().includes(q))),
    );
  }, [submissions, competition, status, query]);

  function select(slug: string) {
    setCompetition(slug);
    const url = new URL(window.location.href);
    url.searchParams.set("competition", slug);
    window.history.replaceState(null, "", url);
  }

  return (
    <div>
      <div role="tablist" aria-label="Competition" className="inline-flex flex-wrap rounded-full border border-border bg-surface p-1">
        {competitions.map((c) => {
          const count = submissions.filter((s) => s.competitionSlug === c.slug).length;
          const pending = submissions.filter((s) => s.competitionSlug === c.slug && s.status === "submitted").length;
          const active = competition === c.slug;
          return (
            <button
              key={c.slug}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => select(c.slug)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${active ? "bg-accent text-accent-foreground" : "text-muted hover:text-foreground"}`}
            >
              {c.title}
              <span className={`ml-2 text-xs ${active ? "opacity-90" : ""}`}>
                {count}
                {pending > 0 ? ` · ${pending} new` : ""}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search student, FRL ID, registration no., school or title…"
          className="min-w-64 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as SubmissionStatus | "all")}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
        >
          <option value="all">All statuses</option>
          <option value="submitted">Awaiting review</option>
          <option value="scored">Scored</option>
        </select>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted">
              <th className="px-4 py-3 font-medium">Student / team</th>
              <th className="px-4 py-3 font-medium">FRL ID</th>
              <th className="px-4 py-3 font-medium">Entry title</th>
              <th className="px-4 py-3 font-medium">School · category</th>
              <th className="px-4 py-3 font-medium">Submitted</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Score</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{s.entrantName}</p>
                  <p className="text-xs text-muted">{s.registrationNumber}</p>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-foreground">{s.frlId ?? "—"}</td>
                <td className="max-w-56 px-4 py-3 text-foreground">
                  <span className="line-clamp-2">{s.answers.title || "—"}</span>
                </td>
                <td className="px-4 py-3 text-muted">
                  {s.schoolName ?? "Independent"}
                  {s.category ? ` · ${categoryLabels[s.category as AgeCategory] ?? s.category}` : ""}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-muted">{s.submittedAt ? new Date(s.submittedAt).toLocaleDateString("en-GB") : "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${
                      s.status === "scored"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
                    }`}
                  >
                    {s.status === "scored" ? "Scored" : "Awaiting review"}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold whitespace-nowrap text-foreground">
                  {s.totalScore != null ? `${s.totalScore} / ${s.maxScore}` : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/submissions/${s.id}`} className="text-sm font-semibold whitespace-nowrap text-accent">
                    {s.status === "scored" ? "View / re-score →" : "Review & score →"}
                  </Link>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-muted">
                  No {status === "all" ? "" : `${submissionStatusLabels[status].toLowerCase()} `}submissions for{" "}
                  {competitions.find((c) => c.slug === competition)?.title ?? "this competition"} yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
