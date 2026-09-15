"use client";

import { useActionState, useState } from "react";
import type { JudgeAssignment } from "@/domain/judging/types";
import { submitScoreAction, type ActionState as ScoreState } from "@/domain/judging/actions";
import { Badge } from "@/ui/components/Badge";

const scoreInitialState: ScoreState = { error: null };

export function ScoreCard({ assignment }: { assignment: JudgeAssignment }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(submitScoreAction, scoreInitialState);
  const [values, setValues] = useState<Record<string, number>>(assignment.criteriaScores);

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-semibold text-foreground">{assignment.entrantName}</p>
          <p className="text-sm text-muted">
            {assignment.competitionTitle} · {assignment.stageTitle}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {assignment.locked ? (
            <Badge tone="neutral">Locked</Badge>
          ) : assignment.status === "scored" ? (
            <Badge tone="success">Scored — {assignment.totalScore}/100</Badge>
          ) : (
            <Badge tone="warning">Pending</Badge>
          )}
          {!assignment.locked && (
            <button
              onClick={() => setOpen((v) => !v)}
              className="rounded-full border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:border-accent"
            >
              {open ? "Close" : assignment.status === "scored" ? "Review" : "Score"}
            </button>
          )}
        </div>
      </div>

      {open && !assignment.locked && (
        <form action={formAction} className="mt-4 space-y-3 border-t border-border pt-4">
          <input type="hidden" name="judge_assignment_id" value={assignment.judgeAssignmentId} />
          <input type="hidden" name="registration_id" value={assignment.registrationId} />
          {assignment.criteria.map((c) => (
            <div key={c.name} className="flex items-center gap-4">
              <label className="w-40 shrink-0 text-sm text-foreground">
                {c.name} <span className="text-muted">({c.weight}%)</span>
              </label>
              <input type="hidden" name="criterion_name" value={c.name} />
              <input type="hidden" name="criterion_weight" value={c.weight} />
              <input
                type="range"
                name="criterion_value"
                min={0}
                max={100}
                value={values[c.name] ?? 50}
                onChange={(e) => setValues((prev) => ({ ...prev, [c.name]: Number(e.target.value) }))}
                className="flex-1"
              />
              <span className="w-10 text-right text-sm text-muted">{values[c.name] ?? 50}</span>
            </div>
          ))}
          <div>
            <label className="text-sm font-medium text-foreground">Comments (optional)</label>
            <textarea
              name="comments"
              rows={2}
              defaultValue={assignment.comments ?? ""}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </div>
          {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Submitting…" : "Submit score"}
          </button>
        </form>
      )}
    </div>
  );
}
