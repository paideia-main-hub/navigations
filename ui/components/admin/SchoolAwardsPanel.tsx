"use client";

import { useActionState } from "react";
import {
  recomputeSchoolAwardsAction,
  publishSchoolAwardAction,
  setCollaborationScoreAction,
  type ActionState,
} from "@/domain/school-awards/actions";
import type { SchoolAwardResultRow } from "@/data/repositories/school-awards.repository";

const initialState: ActionState = { error: null };

function RecomputeButton() {
  const [state, formAction, pending] = useActionState(recomputeSchoolAwardsAction, initialState);
  return (
    <form action={formAction} className="flex items-center gap-3">
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Computing…" : "Recompute standings"}
      </button>
      {state.message && <p className="text-sm text-muted">{state.message}</p>}
      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}

function PublishButton({ categoryId }: { categoryId: string }) {
  const [state, formAction, pending] = useActionState(publishSchoolAwardAction, initialState);
  return (
    <form action={formAction}>
      <input type="hidden" name="category_id" value={categoryId} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:border-accent disabled:opacity-60"
      >
        {pending ? "…" : "Publish standings"}
      </button>
      {state.error && <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}

function CategoryResultsTable({ title, categoryId, rows, unit }: { title: string; categoryId: string | undefined; rows: SchoolAwardResultRow[]; unit: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">{title}</h3>
        {categoryId && <PublishButton categoryId={categoryId} />}
      </div>
      <table className="mt-3 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-muted">
            <th className="py-2 font-medium">Rank</th>
            <th className="py-2 font-medium">School</th>
            <th className="py-2 font-medium">{unit}</th>
            <th className="py-2 font-medium">Published</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.schoolId} className="border-b border-border last:border-0">
              <td className="py-2 text-muted">{r.rank ?? "—"}</td>
              <td className="py-2 font-medium text-foreground">{r.schoolName}{r.isWinner && " 🏆"}</td>
              <td className="py-2 text-muted">{r.computedValue}</td>
              <td className="py-2 text-muted">{r.isPublished ? "Yes" : "No"}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={4} className="py-6 text-center text-muted">
                No standings yet — recompute above.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function CollaborationScoreForm({ categoryId, schools }: { categoryId: string; schools: { id: string; officialName: string }[] }) {
  const [state, formAction, pending] = useActionState(setCollaborationScoreAction, initialState);
  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2 rounded-xl border border-border bg-surface p-4">
      <input type="hidden" name="category_id" value={categoryId} />
      <div>
        <label className="text-xs font-medium text-foreground">School</label>
        <select name="school_id" required className="mt-1 block rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
          {schools.map((s) => (
            <option key={s.id} value={s.id}>
              {s.officialName}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs font-medium text-foreground">Score (0-100)</label>
        <input name="score" type="number" min={0} max={100} required className="mt-1 block w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Set score"}
      </button>
      {state.error && <p className="w-full text-xs text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}

export function SchoolAwardsPanel({
  categories,
  resultsByCategory,
  schools,
}: {
  categories: { id: string; slug: string; title: string }[];
  resultsByCategory: Record<string, SchoolAwardResultRow[]>;
  schools: { id: string; officialName: string }[];
}) {
  const formulaic = categories.filter((c) => c.slug !== "collaboration-and-integrity");
  const collaboration = categories.find((c) => c.slug === "collaboration-and-integrity");

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-surface p-4">
        <RecomputeButton />
        <p className="mt-2 text-xs text-muted">
          Recomputes Champion School, School Excellence, Whole School Participation and Diversified School from
          current registrations and published results. Collaboration &amp; Integrity is scored directly below —
          recompute never touches it.
        </p>
      </div>

      {formulaic.map((c) => (
        <CategoryResultsTable key={c.id} title={c.title} categoryId={c.id} rows={resultsByCategory[c.id] ?? []} unit={c.slug === "diversified-school" ? "Coverage %" : c.slug === "champion-school" ? "Points" : "Count"} />
      ))}

      {collaboration && (
        <>
          <CollaborationScoreForm categoryId={collaboration.id} schools={schools} />
          <CategoryResultsTable title={collaboration.title} categoryId={collaboration.id} rows={resultsByCategory[collaboration.id] ?? []} unit="Score %" />
        </>
      )}
    </div>
  );
}
