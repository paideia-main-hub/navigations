"use client";

import { useState } from "react";
import { COMPETENCIES, competencyLabel, normalizeCompetencies } from "@/domain/competitions/competencies";

/** Tags a competition with the competencies it develops. Framework
 * competencies are toggle chips; anything outside the framework list can be
 * typed in and added. Each selection is submitted as its own hidden
 * `competencies` field, which the server action reads with getAll(). */
export function CompetencyPicker({ defaultValue = [] }: { defaultValue?: string[] }) {
  const [selected, setSelected] = useState<string[]>(defaultValue);
  const [custom, setCustom] = useState("");

  const knownCodes = new Set(COMPETENCIES.map((c) => c.code));
  const customSelected = selected.filter((v) => !knownCodes.has(v));

  function toggle(value: string) {
    setSelected((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  }

  function addCustom() {
    const value = custom.trim();
    if (!value) return;
    // Typing a framework name or code ("Leadership", "c26") selects that
    // competency rather than creating a duplicate custom entry.
    const match = COMPETENCIES.find(
      (c) => c.code.toLowerCase() === value.toLowerCase() || c.name.toLowerCase() === value.toLowerCase(),
    );
    setSelected((prev) => normalizeCompetencies([...prev, match ? match.code : value]));
    setCustom("");
  }

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label className="text-sm font-medium text-foreground">Competencies</label>
        <span className="text-xs text-muted">{selected.length} selected</span>
      </div>
      <p className="mt-1 text-xs text-muted">
        The competencies this competition develops. Used to categorise and filter competitions on the public directory.
      </p>

      {selected.map((value) => (
        <input key={value} type="hidden" name="competencies" value={value} />
      ))}

      <div className="mt-3 flex max-h-64 flex-wrap gap-2 overflow-y-auto rounded-lg border border-border bg-background p-3">
        {COMPETENCIES.map((c) => {
          const active = selected.includes(c.code);
          return (
            <button
              key={c.code}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(c.code)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                active
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border bg-surface text-foreground hover:border-accent"
              }`}
            >
              <span className="font-mono opacity-80">{c.code}</span> {c.name}
            </button>
          );
        })}
      </div>

      {customSelected.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {customSelected.map((value) => (
            <span
              key={value}
              className="inline-flex items-center gap-1.5 rounded-full border border-accent bg-accent-soft px-3 py-1 text-xs font-medium text-accent-strong"
            >
              {competencyLabel(value)}
              <button type="button" onClick={() => toggle(value)} aria-label={`Remove ${value}`} className="hover:opacity-70">
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            // Enter adds the competency instead of submitting the whole form.
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
          placeholder="Add another competency…"
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
        />
        <button
          type="button"
          onClick={addCustom}
          className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:border-accent"
        >
          Add
        </button>
      </div>
    </div>
  );
}
