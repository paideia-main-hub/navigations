"use client";

import { useActionState, useState } from "react";
import { createCompetitionAction, type ActionState } from "@/domain/competitions/actions";
import { FormField } from "@/ui/components/FormField";

const initialState: ActionState = { error: null };

// Mirrors the server-side slugify() in domain/competitions/actions.ts — shown
// here only as a live preview so the admin sees exactly what will be saved.
function previewSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CreateCompetitionForm() {
  const [state, formAction, pending] = useActionState(createCompetitionAction, initialState);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  const effectiveSlug = previewSlug(slugTouched ? slug : title);

  return (
    <form action={formAction} className="max-w-lg space-y-4 rounded-xl border border-border bg-surface p-6">
      <div>
        <label className="text-sm font-medium text-foreground">Title</label>
        <input
          name="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground">Slug (used in the public URL)</label>
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
          Will be saved as <span className="font-mono">{effectiveSlug || "—"}</span> — spaces and punctuation are
          converted to hyphens automatically.
        </p>
      </div>
      <FormField label="Short description" name="short_description" />
      <FormField label="Important Dates card 1" name="dates_card_one" />
      <FormField label="Important Dates card 2" name="dates_card_two" />
      <p className="-mt-2 text-xs text-muted">
        These two lines appear as the small cards under the competition name on the Important Dates carousel.
      </p>
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
