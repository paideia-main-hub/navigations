"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { bulkSaveAwardClosingDatesAction, type ActionState } from "@/domain/awards/actions";
import {
  categoryStatusLabels,
  layerLabels,
  type AwardCategory,
} from "@/domain/awards/types";
import { formatEventDateOnly } from "@/ui/components/admin/eventDateFormat";
import { DateField } from "@/ui/components/DateField";
import { RequiredMark } from "@/ui/components/RequiredMark";

const initialState: ActionState = { error: null };

export function BulkAwardDatesForm({ categories }: { categories: AwardCategory[] }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(bulkSaveAwardClosingDatesAction, initialState);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [query, setQuery] = useState("");
  const [fieldsKey, setFieldsKey] = useState(0);
  const [flash, setFlash] = useState<string | null>(null);
  const [flashError, setFlashError] = useState<string | null>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (pending) {
      wasPending.current = true;
      setFlash(null);
      setFlashError(null);
      return;
    }
    if (!wasPending.current) return;
    wasPending.current = false;

    if (state.error) {
      setFlashError(state.error);
      return;
    }
    if (!state.success) return;

    setFlash(state.message ?? "Saved.");
    setSelected(new Set());
    setQuery("");
    setFieldsKey((k) => k + 1);
    router.refresh();
  }, [pending, state.error, state.success, state.message, router]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        layerLabels[c.layer].toLowerCase().includes(q),
    );
  }, [categories, query]);

  const filteredIds = useMemo(() => filtered.map((c) => c.id), [filtered]);
  const allFilteredSelected = filteredIds.length > 0 && filteredIds.every((id) => selected.has(id));

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllFiltered() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        for (const id of filteredIds) next.delete(id);
      } else {
        for (const id of filteredIds) next.add(id);
      }
      return next;
    });
  }

  return (
    <form action={formAction} className="space-y-6">
      {flashError && <p className="text-sm text-red-600 dark:text-red-400">{flashError}</p>}
      {flash && <p className="text-sm text-emerald-600 dark:text-emerald-400">{flash}</p>}

      <div className="max-w-2xl space-y-4 rounded-xl border border-border bg-surface p-4">
        <p className="text-sm text-muted">
          Set the same nomination closing date on multiple award categories at once.
        </p>

        <div>
          <label className="text-sm font-medium text-foreground">
            Nomination closing date
            <RequiredMark />
          </label>
          <DateField
            key={`closing-${fieldsKey}`}
            name="closing_at"
            label="Nomination closing date"
            required
            className="mt-1"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Award categories</h2>
            <p className="text-sm text-muted">
              {selected.size} selected out of {categories.length}
              {query.trim() ? ` · ${filtered.length} shown` : ""}
            </p>
          </div>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, slug, or layer…"
            className="w-full max-w-xs rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground sm:w-64"
          />
        </div>

        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="px-4 py-3 font-medium">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={toggleAllFiltered}
                      className="rounded border-border"
                    />
                    <span>Select</span>
                  </label>
                </th>
                <th className="px-4 py-3 font-medium">Award</th>
                <th className="px-4 py-3 font-medium">Layer</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Current closing date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted">
                    No award categories match this search.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        name="category_id"
                        value={c.id}
                        checked={selected.has(c.id)}
                        onChange={() => toggle(c.id)}
                        className="rounded border-border"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{c.title}</p>
                      <p className="text-xs text-muted">/{c.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-muted">{layerLabels[c.layer]}</td>
                    <td className="px-4 py-3 text-muted">{categoryStatusLabels[c.status]}</td>
                    <td className="px-4 py-3 text-muted">
                      {c.closingAt ? formatEventDateOnly(c.closingAt) : "Not set"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <button
        type="submit"
        disabled={pending || selected.size === 0}
        className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
      >
        {pending
          ? "Saving…"
          : `Apply to ${selected.size || "selected"} categor${selected.size === 1 ? "y" : "ies"}`}
      </button>
    </form>
  );
}
