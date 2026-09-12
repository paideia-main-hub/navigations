"use client";

import { useActionState, useEffect, useState } from "react";
import { deleteRubricAction, saveRubricAction, type ActionState } from "@/domain/competitions/actions";
import type { Competition, RubricCriterion, StageRubric } from "@/domain/competitions/types";

const initialState: ActionState = { error: null };

function DeleteRubricButton({ competitionId, rubricId }: { competitionId: string; rubricId: string }) {
  const [state, formAction, pending] = useActionState(deleteRubricAction, initialState);
  return (
    <form action={formAction}>
      <input type="hidden" name="competition_id" value={competitionId} />
      <input type="hidden" name="rubric_id" value={rubricId} />
      <button type="submit" disabled={pending} className="text-sm font-medium text-red-600 dark:text-red-400">
        {pending ? "…" : "Delete"}
      </button>
      {state.error && <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}

function stageTitle(competition: Competition, stageId: string | null): string {
  if (!stageId) return "Competition-wide";
  return competition.stages.find((s) => s.id === stageId)?.title ?? "Unknown stage";
}

export function CompetitionRubricsForm({ competition }: { competition: Competition }) {
  const [editing, setEditing] = useState<StageRubric | null>(null);
  const [criteria, setCriteria] = useState<RubricCriterion[]>(editing?.criteria ?? [{ name: "", weight: 0 }]);
  const [state, formAction, pending] = useActionState(saveRubricAction, initialState);

  useEffect(() => {
    if (state.success) {
      setEditing(null);
      setCriteria([{ name: "", weight: 0 }]);
    }
  }, [state.success]);

  function startEdit(rubric: StageRubric | null) {
    setEditing(rubric);
    setCriteria(rubric?.criteria && rubric.criteria.length > 0 ? rubric.criteria : [{ name: "", weight: 0 }]);
  }

  function updateCriterion(i: number, patch: Partial<RubricCriterion>) {
    setCriteria((prev) => prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-2">
        {competition.rubrics.map((r) => (
          <div key={r.id} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium text-foreground">
                {stageTitle(competition, r.stageId)} {!r.isPublic && "· Judges only"}
              </p>
              <div className="flex items-center gap-3">
                <button onClick={() => startEdit(r)} className="text-sm font-medium text-accent">
                  Edit
                </button>
                <DeleteRubricButton competitionId={competition.id} rubricId={r.id} />
              </div>
            </div>
            <ul className="mt-2 space-y-1">
              {r.criteria.map((c, i) => (
                <li key={i} className="flex justify-between text-sm text-muted">
                  <span>{c.name}</span>
                  <span>{c.weight}%</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {competition.rubrics.length === 0 && <p className="text-sm text-muted">No rubrics added yet.</p>}
      </div>

      <form key={editing?.id ?? "new"} action={formAction} className="space-y-3 rounded-xl border border-border bg-surface p-4">
        <h3 className="font-semibold text-foreground">{editing ? "Edit rubric" : "Add a rubric"}</h3>
        <input type="hidden" name="competition_id" value={competition.id} />
        {editing && <input type="hidden" name="rubric_id" value={editing.id} />}

        <div>
          <label className="text-sm font-medium text-foreground">Applies to</label>
          <select
            name="stage_id"
            defaultValue={editing?.stageId ?? ""}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="">Competition-wide</option>
            {competition.stages.map((s) => (
              <option key={s.id} value={s.id}>
                Stage {s.stageNumber}: {s.title}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Criteria</label>
          {criteria.map((c, i) => (
            <div key={i} className="flex gap-2">
              <input
                name={`criteria[${i}][name]`}
                placeholder="Criterion name"
                value={c.name}
                onChange={(e) => updateCriterion(i, { name: e.target.value })}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
              <input
                name={`criteria[${i}][weight]`}
                type="number"
                placeholder="Weight %"
                value={c.weight}
                onChange={(e) => updateCriterion(i, { weight: Number(e.target.value) })}
                className="w-28 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
              <button type="button" onClick={() => setCriteria((prev) => prev.filter((_, idx) => idx !== i))} className="text-sm text-red-600 dark:text-red-400">
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={() => setCriteria((prev) => [...prev, { name: "", weight: 0 }])} className="text-sm font-semibold text-accent">
            + Add criterion
          </button>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Tie-break rule</label>
          <input
            name="tie_break_rule"
            defaultValue={editing?.tieBreakRule ?? ""}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" name="is_public" defaultChecked={editing?.isPublic ?? true} />
          Public (visible to students/schools, not just judges)
        </label>

        {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
        <div className="flex gap-3">
          {editing && (
            <button type="button" onClick={() => startEdit(null)} className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground">
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Saving…" : editing ? "Save changes" : "Add rubric"}
          </button>
        </div>
      </form>
    </div>
  );
}
