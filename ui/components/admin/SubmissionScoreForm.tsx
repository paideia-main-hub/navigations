"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { scoreSubmissionAction } from "@/domain/submissions/actions";
import type { RubricGroup } from "@/domain/submissions/config";

/** One mark per rubric criterion (0–max, half marks allowed), a running total
 * and feedback for the student. The server re-validates every mark and
 * computes the total itself. */
export function SubmissionScoreForm({
  submissionId,
  rubric,
  initialScores,
  initialFeedback,
  scored,
}: {
  submissionId: string;
  rubric: RubricGroup[];
  initialScores: Record<string, number>;
  initialFeedback: string;
  scored: boolean;
}) {
  const router = useRouter();
  const criteria = rubric.flatMap((g) => g.criteria);
  const max = criteria.reduce((s, c) => s + c.max, 0);
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(criteria.map((c) => [c.key, initialScores[c.key] != null ? String(initialScores[c.key]) : ""])),
  );
  const [feedback, setFeedback] = useState(initialFeedback);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  const numbers = criteria.map((c) => Number(values[c.key]));
  const complete = criteria.every((c) => values[c.key] !== "" && Number.isFinite(Number(values[c.key])));
  const total = numbers.reduce((s, n) => s + (Number.isFinite(n) ? n : 0), 0);
  const invalid = criteria.filter((c) => {
    const v = values[c.key];
    if (v === "") return false;
    const n = Number(v);
    return !Number.isFinite(n) || n < 0 || n > c.max || Math.round(n * 2) !== n * 2;
  });

  async function save() {
    setSaving(true);
    setMessage(null);
    const res = await scoreSubmissionAction({
      submissionId,
      scores: Object.fromEntries(criteria.map((c) => [c.key, Number(values[c.key])])),
      feedback,
    });
    setSaving(false);
    if (res.error) {
      setMessage({ tone: "error", text: res.error });
      return;
    }
    setMessage({ tone: "ok", text: `Saved — ${res.total} / ${max}. The student can now see their score and feedback.` });
    router.refresh();
  }

  return (
    <div className="space-y-4 rounded-xl border border-border bg-surface p-4">
      {rubric.map((group, gi) => {
        const groupMax = group.criteria.reduce((s, c) => s + c.max, 0);
        const groupTotal = group.criteria.reduce((s, c) => s + (Number(values[c.key]) || 0), 0);
        return (
          <div key={gi} className="space-y-2">
            {group.title && (
              <div className="flex justify-between gap-2 text-xs font-semibold text-muted">
                <span>{group.title}</span>
                <span className="shrink-0">
                  {groupTotal} / {groupMax}
                </span>
              </div>
            )}
            {group.criteria.map((c) => {
              const bad = invalid.includes(c);
              return (
                <label key={c.key} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-foreground">{c.label}</span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      max={c.max}
                      step={0.5}
                      value={values[c.key]}
                      onChange={(e) => setValues((prev) => ({ ...prev, [c.key]: e.target.value }))}
                      className={`w-16 rounded-md border bg-background px-2 py-1 text-right text-sm text-foreground outline-none focus:border-accent ${
                        bad ? "border-red-500" : "border-border"
                      }`}
                    />
                    <span className="w-8 text-xs text-muted">/ {c.max}</span>
                  </span>
                </label>
              );
            })}
          </div>
        );
      })}

      <div className="flex items-baseline justify-between border-t border-border pt-3">
        <span className="text-sm font-semibold text-foreground">Total</span>
        <span className="text-2xl font-black text-foreground">
          {total} <span className="text-sm font-semibold text-muted">/ {max}</span>
        </span>
      </div>

      <label className="block text-sm font-medium text-foreground">
        Feedback for the student <span className="font-normal text-muted">(optional)</span>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={4}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
        />
      </label>

      {invalid.length > 0 && <p className="text-xs text-red-600 dark:text-red-400">Marks must be 0 to the criterion maximum, in steps of 0.5.</p>}
      {message && (
        <p className={`text-sm ${message.tone === "ok" ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>{message.text}</p>
      )}

      <button
        type="button"
        onClick={save}
        disabled={saving || !complete || invalid.length > 0}
        className="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-50"
      >
        {saving ? "Saving…" : scored ? "Update score" : "Save score"}
      </button>
    </div>
  );
}
