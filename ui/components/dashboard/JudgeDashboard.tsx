"use client";

import { useState } from "react";
import type { JudgeAssignment } from "@/domain/judging/types";
import { Badge } from "@/ui/components/Badge";
import { StatCard } from "./StatCard";

export function JudgeDashboard({ assignments: initial }: { assignments: JudgeAssignment[] }) {
  const [assignments, setAssignments] = useState(initial);
  const [openId, setOpenId] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, Record<string, number>>>({});

  function setCriterionScore(assignmentId: string, criterion: string, value: number) {
    setScores((prev) => ({
      ...prev,
      [assignmentId]: { ...prev[assignmentId], [criterion]: value },
    }));
  }

  function submitScore(assignment: JudgeAssignment) {
    const criteriaScores = scores[assignment.id] ?? {};
    const total = assignment.criteria.reduce((sum, c) => {
      const raw = criteriaScores[c.name] ?? 0;
      return sum + (raw * c.weight) / 100;
    }, 0);

    setAssignments((prev) =>
      prev.map((a) => (a.id === assignment.id ? { ...a, status: "scored", totalScore: Math.round(total) } : a)),
    );
    setOpenId(null);
  }

  const pending = assignments.filter((a) => a.status === "pending").length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Judging</h1>
      <p className="mt-2 max-w-xl text-muted">
        Score your assigned entrants against the published rubric. Scores are not final until
        submitted — this demo doesn&apos;t persist beyond your current session.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Assigned" value={assignments.length} />
        <StatCard label="Pending" value={pending} />
        <StatCard label="Scored" value={assignments.length - pending} />
      </div>

      <div className="mt-8 space-y-3">
        {assignments.map((a) => (
          <div key={a.id} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-foreground">{a.entrantName}</p>
                <p className="text-sm text-muted">
                  {a.competitionTitle} · {a.stageTitle}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {a.status === "scored" ? (
                  <Badge tone="success">Scored — {a.totalScore}/100</Badge>
                ) : (
                  <Badge tone="warning">Pending</Badge>
                )}
                <button
                  onClick={() => setOpenId(openId === a.id ? null : a.id)}
                  className="rounded-full border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:border-accent"
                >
                  {openId === a.id ? "Close" : a.status === "scored" ? "Review" : "Score"}
                </button>
              </div>
            </div>

            {openId === a.id && (
              <div className="mt-4 space-y-3 border-t border-border pt-4">
                {a.criteria.map((c) => (
                  <div key={c.name} className="flex items-center gap-4">
                    <label className="w-40 shrink-0 text-sm text-foreground">
                      {c.name} <span className="text-muted">({c.weight}%)</span>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      defaultValue={50}
                      onChange={(e) => setCriterionScore(a.id, c.name, Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="w-10 text-right text-sm text-muted">
                      {scores[a.id]?.[c.name] ?? 50}
                    </span>
                  </div>
                ))}
                <button
                  onClick={() => submitScore(a)}
                  className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90"
                >
                  Submit score
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
