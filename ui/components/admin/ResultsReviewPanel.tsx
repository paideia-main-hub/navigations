"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import {
  generateResultsAction,
  overrideAwardAction,
  publishResultsAction,
  unpublishResultAction,
  uploadWinnerPhotoAction,
  type ActionState,
} from "@/domain/results/actions";
import { awardLabels, type AwardType } from "@/domain/competitions/types";
import type { DraftResultRow } from "@/domain/results/types";
import { Badge } from "@/ui/components/Badge";
import { DataTable } from "@/ui/components/DataTable";

const initialState: ActionState = { error: null };

function GenerateButton({ competitionId }: { competitionId: string }) {
  const [state, formAction, pending] = useActionState(generateResultsAction, initialState);
  return (
    <form action={formAction} className="flex items-center gap-3">
      <input type="hidden" name="competition_id" value={competitionId} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Computing…" : "Generate / refresh standings"}
      </button>
      {state.message && <p className="text-sm text-muted">{state.message}</p>}
      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}

function AwardOverrideForm({ row }: { row: DraftResultRow }) {
  const [state, formAction, pending] = useActionState(overrideAwardAction, initialState);
  const [award, setAward] = useState<AwardType>((row.award as AwardType) ?? "finalist");

  if (!row.resultId) return <p className="text-xs text-muted">Generate standings first.</p>;

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="result_id" value={row.resultId} />
      <select
        name="award"
        value={award}
        onChange={(e) => setAward(e.target.value as AwardType)}
        disabled={row.isPublished}
        className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground disabled:opacity-60"
      >
        {Object.entries(awardLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      {award === "custom" && (
        <input
          name="custom_award_label"
          defaultValue={row.customAwardLabel ?? ""}
          placeholder="Custom label"
          disabled={row.isPublished}
          className="w-28 rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground disabled:opacity-60"
        />
      )}
      {!row.isPublished && (
        <button
          type="submit"
          disabled={pending}
          className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:border-accent disabled:opacity-60"
        >
          {pending ? "…" : "Save"}
        </button>
      )}
      {state.error && <p className="w-full text-xs text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}

function PhotoUploadForm({ resultId }: { resultId: string }) {
  const [state, formAction, pending] = useActionState(uploadWinnerPhotoAction, initialState);
  return (
    <form action={formAction} className="flex flex-col gap-1">
      <input type="hidden" name="result_id" value={resultId} />
      <input type="file" name="file" accept="image/*" className="text-xs text-muted" />
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-full border border-border px-3 py-1 text-xs font-semibold text-foreground hover:border-accent disabled:opacity-60"
      >
        {pending ? "Uploading…" : "Upload photo"}
      </button>
      {state.error && <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}

function UnpublishButton({ resultId, competitionSlug }: { resultId: string; competitionSlug: string }) {
  const [state, formAction, pending] = useActionState(unpublishResultAction, initialState);
  return (
    <form action={formAction}>
      <input type="hidden" name="result_id" value={resultId} />
      <input type="hidden" name="competition_slug" value={competitionSlug} />
      <button type="submit" disabled={pending} className="text-xs font-semibold text-red-600 dark:text-red-400">
        {pending ? "…" : "Unpublish"}
      </button>
      {state.error && <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}

const awardTone: Record<string, "success" | "warning" | "accent" | "neutral"> = {
  gold: "warning",
  silver: "neutral",
  bronze: "warning",
  finalist: "accent",
  merit: "accent",
  custom: "neutral",
};

export function ResultsReviewPanel({ competitionId, competitionSlug, rows }: { competitionId: string; competitionSlug: string; rows: DraftResultRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [publishing, setPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState<string | null>(null);

  const publishable = rows.filter((r) => r.resultId && !r.isPublished && r.hasResultConsent);
  const scored = rows.filter((r) => r.judgeCount > 0);
  const unscored = rows.filter((r) => r.judgeCount === 0);

  function toggle(resultId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(resultId)) next.delete(resultId);
      else next.add(resultId);
      return next;
    });
  }

  async function handlePublish() {
    if (selected.size === 0) return;
    setPublishing(true);
    setPublishMessage(null);
    const formData = new FormData();
    selected.forEach((id) => formData.append("result_id", id));
    formData.set("competition_slug", competitionSlug);

    const result = await publishResultsAction({ error: null }, formData);
    setPublishing(false);
    setPublishMessage(result.message ?? result.error ?? null);
    if (result.success) {
      setSelected(new Set());
      router.refresh();
    }
  }

  return (
    <div>
      <div className="rounded-xl border border-border bg-surface p-4">
        <GenerateButton competitionId={competitionId} />
        <p className="mt-2 text-xs text-muted">
          Averages every judge&apos;s score per entrant, ranks them, and assigns Gold/Silver/Bronze to the top 3 — everyone
          else who was scored gets Finalist. Safe to re-run any time a judge updates a score; it never touches a row that&apos;s
          already published.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-surface p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{rows.length}</p>
          <p className="text-xs text-muted">Registered entrants</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{scored.length}</p>
          <p className="text-xs text-muted">Scored by at least one judge</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{rows.filter((r) => r.isPublished).length}</p>
          <p className="text-xs text-muted">Published</p>
        </div>
      </div>

      {publishable.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-accent/30 bg-accent-soft p-4">
          <p className="text-sm font-medium text-foreground">{selected.size} selected</p>
          <button
            onClick={handlePublish}
            disabled={publishing || selected.size === 0}
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
          >
            {publishing ? "Publishing…" : "Approve & publish selected"}
          </button>
          <button
            onClick={() => setSelected(new Set(publishable.map((r) => r.resultId!)))}
            className="text-sm font-semibold text-accent"
          >
            Select all publishable
          </button>
          {publishMessage && <p className="w-full text-sm text-muted">{publishMessage}</p>}
        </div>
      )}

      <div className="mt-6">
        <DataTable
          rows={rows}
          searchPlaceholder="Search by entrant or school…"
          searchFields={(row) => [row.entrantName, row.schoolName]}
          filters={[
            {
              label: "Award",
              options: Object.entries(awardLabels).map(([value, label]) => ({ value, label })),
              predicate: (row, value) => row.award === value,
            },
            {
              label: "Status",
              options: [
                { value: "published", label: "Published" },
                { value: "draft", label: "Draft" },
                { value: "ungenerated", label: "Ungenerated" },
              ],
              predicate: (row, value) =>
                value === "published" ? row.isPublished : value === "draft" ? Boolean(row.resultId) && !row.isPublished : !row.resultId,
            },
          ]}
          emptyMessage="No registrations yet for this competition."
        >
          {(pageRows) => (
            <div className="overflow-x-auto rounded-xl border border-border bg-surface">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-muted">
                    <th className="px-3 py-3 font-medium"></th>
                    <th className="px-3 py-3 font-medium">Entrant</th>
                    <th className="px-3 py-3 font-medium">Category</th>
                    <th className="px-3 py-3 font-medium">School</th>
                    <th className="px-3 py-3 font-medium">Score</th>
                    <th className="px-3 py-3 font-medium">Judges scored</th>
                    <th className="px-3 py-3 font-medium">Award</th>
                    <th className="px-3 py-3 font-medium">Consent</th>
                    <th className="px-3 py-3 font-medium">Photo</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((row) => (
                    <tr key={row.registrationId} className="border-b border-border last:border-0 align-top">
                      <td className="px-3 py-3">
                        {row.resultId && !row.isPublished && (
                          <input type="checkbox" checked={selected.has(row.resultId)} onChange={() => toggle(row.resultId!)} disabled={!row.hasResultConsent} />
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-medium text-foreground">{row.entrantName}</p>
                        <p className="text-xs text-muted">{row.entryType === "team" ? "Team" : "Individual"}</p>
                      </td>
                      <td className="px-3 py-3 text-muted capitalize">{row.category}</td>
                      <td className="px-3 py-3 text-muted">{row.schoolName ?? "—"}</td>
                      <td className="px-3 py-3 font-semibold text-foreground">{row.averageScore ?? "—"}</td>
                      <td className="px-3 py-3 text-muted">{row.judgeCount}</td>
                      <td className="px-3 py-3">
                        {row.award ? (
                          <div className="space-y-1">
                            <Badge tone={awardTone[row.award] ?? "neutral"}>{awardLabels[row.award]}</Badge>
                            <AwardOverrideForm row={row} />
                          </div>
                        ) : (
                          <p className="text-xs text-muted">Not generated</p>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <div className="space-y-1 text-xs">
                          <p className={row.hasResultConsent ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
                            {row.hasResultConsent ? "Result ✓" : "Result ✗"}
                          </p>
                          <p className={row.hasPhotoConsent ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>
                            {row.hasPhotoConsent ? "Photo ✓" : "Photo ✗"}
                          </p>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        {row.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element -- admin-controlled Supabase Storage / student profile URL
                          <img src={row.photoUrl} alt={row.entrantName} className="h-10 w-10 rounded-full object-cover" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-surface-muted" />
                        )}
                        {row.resultId && <div className="mt-1"><PhotoUploadForm resultId={row.resultId} /></div>}
                      </td>
                      <td className="px-3 py-3">
                        {row.isPublished ? (
                          <div className="space-y-1">
                            <Badge tone="success">Published</Badge>
                            {row.resultId && <UnpublishButton resultId={row.resultId} competitionSlug={competitionSlug} />}
                          </div>
                        ) : row.resultId ? (
                          <Badge tone="neutral">Draft</Badge>
                        ) : (
                          <Badge tone="neutral">Ungenerated</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DataTable>
      </div>

      {unscored.length > 0 && (
        <p className="mt-3 text-xs text-muted">
          {unscored.length} entrant(s) haven&apos;t been scored by any judge yet and won&apos;t appear in a generated result.
        </p>
      )}
    </div>
  );
}
