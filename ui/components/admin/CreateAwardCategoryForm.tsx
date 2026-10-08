"use client";

import { useActionState, useState } from "react";
import { createCategoryAction, type ActionState } from "@/domain/awards/actions";
import { layerLabels, type AwardLayer } from "@/domain/awards/types";
import { RequiredMark } from "@/ui/components/RequiredMark";

const initialState: ActionState = { error: null };

function previewSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CreateAwardCategoryForm() {
  const [state, formAction, pending] = useActionState(createCategoryAction, initialState);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  const effectiveSlug = previewSlug(slugTouched ? slug : title);

  return (
    <form action={formAction} className="max-w-lg space-y-4 rounded-xl border border-border bg-surface p-6">
      <div>
        <label className="text-sm font-medium text-foreground">
          Title
          <RequiredMark />
        </label>
        <input
          name="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Idea of the Year"
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground">
          Slug (used in the public URL)
          <RequiredMark />
        </label>
        <input
          name="slug"
          required
          value={slugTouched ? slug : previewSlug(title)}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
        />
        <p className="mt-1 text-xs text-muted">
          Will be saved as <span className="font-mono">{effectiveSlug || "—"}</span>.
        </p>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground">
          Layer
          <RequiredMark />
        </label>
        <select name="layer" required className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
          {Object.entries(layerLabels).map(([value, label]) => (
            <option key={value} value={value as AwardLayer}>
              {label}
            </option>
          ))}
        </select>
      </div>
      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Creating…" : "Create & continue"}
      </button>
    </form>
  );
}
