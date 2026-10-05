"use client";

import { useActionState, useEffect, useState } from "react";
import { updateCategoryAction, type ActionState } from "@/domain/awards/actions";
import type { AwardCategory, RubricCriterion } from "@/domain/awards/types";
import { isJudgedLayer } from "@/domain/awards/types";
import { AwardCategoryImageUploader } from "@/ui/components/admin/AwardCategoryImageUploader";

const initialState: ActionState = { error: null };

function normalizeCriteria(raw: RubricCriterion[] | null | undefined): RubricCriterion[] {
  if (!Array.isArray(raw) || raw.length === 0) return [{ key: "", label: "", weight: 0 }];
  return raw.map((c) => ({
    key: String(c?.key ?? ""),
    label: String(c?.label ?? ""),
    weight: Number(c?.weight) || 0,
  }));
}

export function EditAwardCategoryForm({ category }: { category: AwardCategory }) {
  const [state, formAction, pending] = useActionState(updateCategoryAction, initialState);
  const [criteria, setCriteria] = useState<RubricCriterion[]>(() => normalizeCriteria(category.rubricCriteria));

  // Soft navigations between award edit pages reuse this client component —
  // re-sync so saved rubric rows always appear for the open category.
  useEffect(() => {
    setCriteria(normalizeCriteria(category.rubricCriteria));
    // Only re-load when switching awards — not on every parent re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: keyed by category.id
  }, [category.id]);

  const totalWeight = criteria.reduce((sum, c) => sum + (Number(c.weight) || 0), 0);
  const judged = isJudgedLayer(category.layer);
  const savedCriteriaCount = Array.isArray(category.rubricCriteria) ? category.rubricCriteria.length : 0;
  const showJudgingControls = judged || savedCriteriaCount > 0;

  function updateCriterion(i: number, patch: Partial<RubricCriterion>) {
    setCriteria((prev) => prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  }

  return (
    <div className="max-w-2xl space-y-6">
      <AwardCategoryImageUploader category={category} />

      <form action={formAction} className="space-y-6">
      <input type="hidden" name="category_id" value={category.id} />
      <input type="hidden" name="layer" value={category.layer} />
      <input type="hidden" name="rubric_fields_present" value="1" />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-foreground">Title</label>
          <input
            name="title"
            defaultValue={category.title}
            required
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Slug</label>
          <input
            name="slug"
            defaultValue={category.slug}
            required
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">Description</label>
        <p className="mt-0.5 text-xs text-muted">Short line under the award title on the public awards card.</p>
        <textarea
          name="description"
          defaultValue={category.description}
          rows={2}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">Details</label>
        <p className="mt-0.5 text-xs text-muted">Expanded body shown under the divider when the awards card is opened.</p>
        <textarea
          name="details"
          defaultValue={category.details}
          rows={6}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
        />
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" name="requires_school" defaultChecked={category.requiresSchool} />
          Requires a school to submit
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" name="allows_independent" defaultChecked={category.allowsIndependent} />
          Allows independent nominators
        </label>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Rubric criteria (shown as pills on the public card)</label>
        <p className="text-xs text-muted">
          {savedCriteriaCount > 0
            ? `${savedCriteriaCount} saved criter${savedCriteriaCount === 1 ? "ion" : "ia"} loaded below. Weights should total 100% when used.`
            : "No criteria saved yet. Add rows below, or leave empty if this award has none."}
        </p>
        {criteria.map((c, i) => (
          <div key={`${category.id}-criterion-${i}`} className="flex flex-col gap-2 sm:flex-row">
            <input
              name={`criteria[${i}][key]`}
              placeholder="key (e.g. evidence)"
              value={c.key}
              onChange={(e) => updateCriterion(i, { key: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground sm:w-40"
            />
            <input
              name={`criteria[${i}][label]`}
              placeholder="Label (e.g. Evidence and learning)"
              value={c.label}
              onChange={(e) => updateCriterion(i, { label: e.target.value })}
              className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
            <input
              name={`criteria[${i}][weight]`}
              type="number"
              placeholder="Weight %"
              value={Number.isFinite(c.weight) ? c.weight : 0}
              onChange={(e) => updateCriterion(i, { weight: Number(e.target.value) })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground sm:w-28"
            />
            <button
              type="button"
              onClick={() =>
                setCriteria((prev) => {
                  const next = prev.filter((_, idx) => idx !== i);
                  return next.length > 0 ? next : [{ key: "", label: "", weight: 0 }];
                })
              }
              className="text-sm text-red-600 dark:text-red-400"
            >
              Remove
            </button>
          </div>
        ))}
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => setCriteria((prev) => [...prev, { key: "", label: "", weight: 0 }])} className="text-sm font-semibold text-accent">
            + Add criterion
          </button>
          <p className={`text-xs ${totalWeight === 100 || totalWeight === 0 ? "text-muted" : "text-amber-600 dark:text-amber-400"}`}>
            Total: {totalWeight}%
          </p>
        </div>
      </div>

      {showJudgingControls ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-foreground">Pass threshold (%)</label>
            <input
              name="pass_threshold"
              type="number"
              defaultValue={category.passThreshold}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Tie-break order (criterion keys, comma-separated)</label>
            <input
              name="tie_break_order"
              defaultValue={category.tieBreakOrder.join(", ")}
              placeholder="evidence, originality"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="text-sm font-medium text-foreground">Max winners (blank = unlimited)</label>
          <input
            name="max_winners"
            type="number"
            defaultValue={category.maxWinners ?? ""}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Evidence period start</label>
          <input
            name="evidence_period_start"
            type="date"
            defaultValue={category.evidencePeriodStart ?? ""}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Evidence period end</label>
          <input
            name="evidence_period_end"
            type="date"
            defaultValue={category.evidencePeriodEnd ?? ""}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">Nomination closing date</label>
        <input
          name="closing_at"
          type="date"
          defaultValue={category.closingAt ? category.closingAt.slice(0, 10) : ""}
          className="mt-1 w-full max-w-xs rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
        />
      </div>

      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      {state.success && <p className="text-sm text-emerald-600 dark:text-emerald-400">Saved.</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
    </div>
  );
}
