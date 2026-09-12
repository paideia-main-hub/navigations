"use client";

import { useActionState, useState } from "react";
import { expireAnnouncementAction, type ActionState } from "@/domain/announcements/actions";
import { announcementCategoryLabels, type Announcement } from "@/domain/announcements/types";
import type { Competition } from "@/domain/competitions/types";
import { Badge } from "@/ui/components/Badge";
import { AnnouncementForm } from "./AnnouncementForm";

const initialState: ActionState = { error: null };

function ExpireButton({ announcementId }: { announcementId: string }) {
  const [state, formAction, pending] = useActionState(expireAnnouncementAction, initialState);
  return (
    <form action={formAction}>
      <input type="hidden" name="announcement_id" value={announcementId} />
      <button type="submit" disabled={pending} className="text-sm font-medium text-red-600 dark:text-red-400">
        {pending ? "…" : "Expire"}
      </button>
      {state.error && <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}

export function AdminAnnouncementsList({
  announcements,
  competitions,
}: {
  announcements: Announcement[];
  competitions: Pick<Competition, "id" | "slug" | "title">[];
}) {
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        {announcements.map((a) => (
          <div key={a.id} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={a.isImportant ? "accent" : "neutral"}>{announcementCategoryLabels[a.category]}</Badge>
                <span className="text-xs text-muted">{a.competitionTitle ?? "Site-wide"}</span>
                <span className="text-xs text-muted">
                  {new Date(a.publishDate).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setEditing(a)} className="text-sm font-medium text-accent">
                  Edit
                </button>
                <ExpireButton announcementId={a.id} />
              </div>
            </div>
            <p className="mt-2 font-semibold text-foreground">{a.title}</p>
            <p className="mt-1 text-sm text-muted">{a.body}</p>
          </div>
        ))}
        {announcements.length === 0 && <p className="text-sm text-muted">No announcements yet.</p>}
      </div>

      {editing ? (
        <AnnouncementForm competitions={competitions} editing={editing} onDone={() => setEditing(null)} />
      ) : creating ? (
        <AnnouncementForm competitions={competitions} editing={null} onDone={() => setCreating(false)} />
      ) : (
        <button
          onClick={() => setCreating(true)}
          className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground hover:border-accent"
        >
          + New announcement
        </button>
      )}
    </div>
  );
}
