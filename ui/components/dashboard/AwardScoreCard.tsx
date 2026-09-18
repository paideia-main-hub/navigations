"use client";

import { useActionState, useState } from "react";
import type { AwardJudgeAssignment } from "@/domain/award-judging/types";
import { submitAwardScoreAction, type ActionState as ScoreState } from "@/domain/award-judging/actions";
import { Badge } from "@/ui/components/Badge";

const scoreInitialState: ScoreState = { error: null };

export function AwardScoreCard({ assignment }: { assignment: AwardJudgeAssignment }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(submitAwardScoreAction, scoreInitialState);
  const [values, setValues] = useState<Record<string, number>>(assignment.criteriaScores);

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-semibold text-foreground">{assignment.nomineeName}</p>
          <p className="text-sm text-muted">{assignment.categoryTitle}</p>
        </div>
        <div className="flex items-center gap-3">
          {assignment.locked ? (
            <Badge tone="neutral">Locked</Badge>
          ) : assignment.status === "scored" ? (
            <Badge tone="success">Scored — {assignment.totalScore}%</Badge>
          ) : (
            <Badge tone="warning">Pending</Badge>
          )}
          {!assignment.locked && (
            <button onClick={() => setOpen((v) => !v)} className="rounded-full border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:border-accent">
              {open ? "Close" : assignment.status === "scored" ? "Review" : "Score"}
            </button>
          )}
        </div>
      </div>

      {open && !assignment.locked && (
        <form action={formAction} className="mt-4 space-y-3 border-t border-border pt-4">
          <input type="hidden" name="award_judge_assignment_id" value={assignment.awardJudgeAssignmentId} />
          <input type="hidden" name="nomination_id" value={assignment.nominationId} />
          {assignment.criteria.map((c) => (
            <div key={c.key} className="flex items-center gap-4">
              <label className="w-48 shrink-0 text-sm text-foreground">
                {c.label} <span className="text-muted">({c.weight}%)</span>
              </label>
              <input type="hidden" name="criterion_key" value={c.key} />
              <input type="hidden" name="criterion_weight" value={c.weight} />
              <input
                type="range"
                name="criterion_value"
                min={0}
                max={100}
                value={values[c.key] ?? 50}
                onChange={(e) => setValues((prev) => ({ ...prev, [c.key]: Number(e.target.value) }))}
                className="flex-1"
              />
              <span className="w-10 text-right text-sm text-muted">{values[c.key] ?? 50}</span>
            </div>
          ))}
          <div>
            <label className="text-sm font-medium text-foreground">Comments (optional)</label>
            <textarea name="comments" rows={2} defaultValue={assignment.comments ?? ""} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" />
          </div>
          {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
          <button type="submit" disabled={pending} className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60">
            {pending ? "Submitting…" : "Submit score"}
          </button>
        </form>
      )}
    </div>
  );
}
