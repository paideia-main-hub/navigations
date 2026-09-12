"use client";

import { useActionState, useEffect, useState } from "react";
import { saveFaqsAction, type ActionState } from "@/domain/competitions/actions";
import type { Competition, CompetitionFaq } from "@/domain/competitions/types";

const initialState: ActionState = { error: null };

type DraftFaq = Partial<CompetitionFaq>;

export function CompetitionFaqsForm({ competition }: { competition: Competition }) {
  const [state, formAction, pending] = useActionState(saveFaqsAction, initialState);
  const [rows, setRows] = useState<DraftFaq[]>(competition.faqs.length > 0 ? competition.faqs : [{ question: "", answer: "" }]);

  useEffect(() => {
    setRows(competition.faqs.length > 0 ? competition.faqs : [{ question: "", answer: "" }]);
  }, [competition]);

  function updateRow(i: number, patch: Partial<DraftFaq>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  return (
    <form action={formAction} className="max-w-2xl space-y-4">
      <input type="hidden" name="competition_id" value={competition.id} />

      {rows.map((row, i) => (
        <div key={i} className="space-y-2 rounded-xl border border-border bg-surface p-4">
          <div>
            <label className="text-sm font-medium text-foreground">Question</label>
            <input
              name={`faqs[${i}][question]`}
              value={row.question ?? ""}
              onChange={(e) => updateRow(i, { question: e.target.value })}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Answer</label>
            <textarea
              name={`faqs[${i}][answer]`}
              rows={2}
              value={row.answer ?? ""}
              onChange={(e) => updateRow(i, { answer: e.target.value })}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </div>
          <button
            type="button"
            onClick={() => setRows((prev) => prev.filter((_, idx) => idx !== i))}
            className="text-sm font-medium text-red-600 dark:text-red-400"
          >
            Remove FAQ
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => setRows((prev) => [...prev, { question: "", answer: "" }])}
        className="text-sm font-semibold text-accent"
      >
        + Add FAQ
      </button>

      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      {state.success && <p className="text-sm text-emerald-600 dark:text-emerald-400">Saved.</p>}
      <div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save FAQs"}
        </button>
      </div>
    </form>
  );
}
