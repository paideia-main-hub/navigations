"use client";

import { useActionState, useEffect, useState } from "react";
import { createAnnouncementAction, updateAnnouncementAction, type ActionState } from "@/domain/announcements/actions";
import { announcementCategoryLabels, type Announcement, type AnnouncementCategory } from "@/domain/announcements/types";
import type { Competition } from "@/domain/competitions/types";
import { FormField } from "@/ui/components/FormField";

const initialState: ActionState = { error: null };

/** Calendar day in the admin's timezone, matching how the public site formats it. */
function toDateInputValue(iso?: string): string {
  const date = iso ? new Date(iso) : new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function AnnouncementForm({
  competitions,
  editing,
  onDone,
}: {
  competitions: Pick<Competition, "id" | "slug" | "title">[];
  editing: Announcement | null;
  onDone: () => void;
}) {
  const action = editing ? updateAnnouncementAction : createAnnouncementAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [competitionSlug, setCompetitionSlug] = useState(editing?.competitionSlug ?? "");

  useEffect(() => {
    if (state.success) onDone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  const selectedCompetition = competitions.find((c) => c.slug === competitionSlug);

  return (
    <form key={editing?.id ?? "new"} action={formAction} className="space-y-3 rounded-xl border border-border bg-surface p-4">
      <h3 className="font-semibold text-foreground">{editing ? "Edit announcement" : "New announcement"}</h3>
      {editing && <input type="hidden" name="announcement_id" value={editing.id} />}
      <input type="hidden" name="competition_id" value={selectedCompetition?.id ?? ""} />
      <input type="hidden" name="competition_slug" value={competitionSlug} />

      <div>
        <label className="text-sm font-medium text-foreground">Scope</label>
        <select
          value={competitionSlug}
          onChange={(e) => setCompetitionSlug(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
        >
          <option value="">Site-wide</option>
          {competitions.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">Category</label>
        <select
          name="category"
          defaultValue={editing?.category ?? ("general" as AnnouncementCategory)}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
        >
          {Object.entries(announcementCategoryLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <FormField label="Title" name="title" required defaultValue={editing?.title} />
      <FormField
        label="Date shown on the site"
        name="publish_date"
        type="date"
        required
        defaultValue={toDateInputValue(editing?.publishDate)}
      />
      <div>
        <label className="text-sm font-medium text-foreground">Body</label>
        <textarea
          name="body"
          rows={3}
          required
          defaultValue={editing?.body}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" name="is_important" defaultChecked={editing?.isImportant ?? false} />
        Pin as important
      </label>

      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      <div className="flex gap-3">
        {editing && (
          <button type="button" onClick={onDone} className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground">
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Saving…" : editing ? "Save changes" : "Publish announcement"}
        </button>
      </div>
    </form>
  );
}
