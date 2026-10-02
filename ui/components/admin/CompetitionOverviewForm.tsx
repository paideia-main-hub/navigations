"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  removeCompetitionImageAction,
  updateCompetitionCoreAction,
  type ActionState,
} from "@/domain/competitions/actions";
import { pathwayLabels, pathwayOrder, type Competition } from "@/domain/competitions/types";
import { FormField } from "@/ui/components/FormField";
import { resolveCompetitionCardImage } from "@/domain/competitions/cardImage";

const initialState: ActionState = { error: null };

type UploadPhase = "idle" | "uploading" | "processing" | "done";

function CompetitionImageUploader({ competition }: { competition: Competition }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [removeState, removeAction, removing] = useActionState(removeCompetitionImageAction, initialState);
  const [previewUrl, setPreviewUrl] = useState(() => resolveCompetitionCardImage(competition.imageUrl));
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const busy = phase === "uploading" || phase === "processing";

  useEffect(() => {
    setPreviewUrl(resolveCompetitionCardImage(competition.imageUrl));
  }, [competition.imageUrl]);

  useEffect(() => {
    if (!removeState.success) return;
    setPreviewUrl(null);
    setPhase("idle");
    setProgress(0);
    setFileName(null);
    router.refresh();
  }, [removeState.success, router]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Choose an image to upload.");
      return;
    }

    setError(null);
    setPhase("uploading");
    setProgress(0);

    const body = new FormData();
    body.set("competition_id", competition.id);
    body.set("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/competition-image");

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      // Leave the last ~12% for server-side WebP conversion + Supabase write.
      const pct = Math.round((event.loaded / event.total) * 88);
      setProgress(pct);
    };

    xhr.upload.onload = () => {
      setPhase("processing");
      setProgress((p) => Math.max(p, 90));
    };

    xhr.onload = () => {
      let payload: { error?: string; url?: string } = {};
      try {
        payload = JSON.parse(xhr.responseText) as { error?: string; url?: string };
      } catch {
        /* non-JSON error body */
      }

      if (xhr.status >= 200 && xhr.status < 300 && payload.url) {
        setProgress(100);
        setPhase("done");
        setPreviewUrl(payload.url);
        setFileName(null);
        if (fileRef.current) fileRef.current.value = "";
        router.refresh();
        return;
      }

      setPhase("idle");
      setProgress(0);
      setError(payload.error ?? "Upload failed.");
    };

    xhr.onerror = () => {
      setPhase("idle");
      setProgress(0);
      setError("Network error — try again.");
    };

    xhr.send(body);
  }

  return (
    <div className="space-y-3 rounded-xl border border-border bg-surface p-4 sm:col-span-2">
      <div>
        <p className="text-sm font-medium text-foreground">Card image</p>
        <p className="mt-1 text-xs text-muted">
          Uploaded images are compressed and converted to WebP before storage. Portrait images are
          centre-cropped to 16:9 (card banner shape). Without an image, cards show a placeholder on the
          public site.
        </p>
      </div>

      <div className="flex flex-wrap items-start gap-4">
        <div className="relative aspect-[16/9] w-64 shrink-0 overflow-hidden rounded-lg bg-surface-muted sm:w-72">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- admin preview of a Supabase public URL
            <img src={previewUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center px-3 text-center text-xs text-muted">
              No image yet
            </div>
          )}
        </div>

        <div className="min-w-[14rem] flex-1 space-y-2">
          <form onSubmit={onSubmit} className="space-y-2">
            <div>
              <p className="text-sm font-medium text-foreground">Choose file</p>
              <div className="mt-1 flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => fileRef.current?.click()}
                  className="shrink-0 rounded-full bg-accent-soft px-4 py-2 text-sm font-semibold text-accent-strong hover:bg-accent-soft/80 disabled:opacity-60"
                >
                  Choose file
                </button>
                <span className="truncate text-sm text-muted">{fileName ?? "No file chosen"}</span>
              </div>
              <input
                ref={fileRef}
                id={`competition-image-${competition.id}`}
                type="file"
                name="file"
                accept="image/*"
                disabled={busy}
                className="sr-only"
                onChange={(e) => {
                  const name = e.target.files?.[0]?.name ?? null;
                  setFileName(name);
                  setError(null);
                  setPhase("idle");
                }}
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="submit"
                disabled={busy || !fileName}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:border-accent disabled:opacity-60"
              >
                {phase === "uploading"
                  ? "Uploading…"
                  : phase === "processing"
                    ? "Processing…"
                    : previewUrl
                      ? "Replace image"
                      : "Upload image"}
              </button>
              {previewUrl ? (
                <button
                  type="button"
                  disabled={removing || busy}
                  className="text-xs font-medium text-red-600 dark:text-red-400 disabled:opacity-60"
                  onClick={() => {
                    const fd = new FormData();
                    fd.set("competition_id", competition.id);
                    // useActionState dispatch accepts FormData as the action payload
                    removeAction(fd);
                  }}
                >
                  {removing ? "Removing…" : "Remove image"}
                </button>
              ) : null}
            </div>

            {busy && (
              <div className="space-y-1.5" aria-live="polite">
                <div className="flex items-center justify-between text-[0.7rem] font-medium text-muted">
                  <span>{phase === "processing" ? "Compressing & saving…" : "Uploading…"}</span>
                  <span>{progress}%</span>
                </div>
                <div
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progress}
                  className="h-1.5 overflow-hidden rounded-full bg-surface-muted"
                >
                  <div
                    className={`h-full rounded-full bg-accent transition-[width] duration-150 ease-out ${
                      phase === "processing" ? "animate-pulse" : ""
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
            {phase === "done" && !error && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400">Image saved.</p>
            )}
            {removeState.error && <p className="text-xs text-red-600 dark:text-red-400">{removeState.error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}

export function CompetitionOverviewForm({ competition }: { competition: Competition }) {
  const [state, formAction, pending] = useActionState(updateCompetitionCoreAction, initialState);

  return (
    <div className="max-w-2xl space-y-6">
      <CompetitionImageUploader competition={competition} />

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="competition_id" value={competition.id} />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Title" name="title" required defaultValue={competition.title} />
          <div>
            <FormField label="Slug" name="slug" required defaultValue={competition.slug} />
            <p className="mt-1 text-xs text-muted">Used in the public URL — spaces/punctuation are converted to hyphens automatically.</p>
          </div>
        </div>
        <FormField label="Short description" name="short_description" defaultValue={competition.shortDescription} />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Important Dates card 1" name="dates_card_one" defaultValue={competition.datesCardOne} />
          <FormField label="Important Dates card 2" name="dates_card_two" defaultValue={competition.datesCardTwo} />
        </div>
        <p className="-mt-2 text-xs text-muted">
          Shown as small cards at the bottom of this competition&apos;s Important Dates slide. Leave a field blank to hide that card.
        </p>
        <div>
          <label className="text-sm font-medium text-foreground">Overview</label>
          <textarea
            name="overview"
            rows={5}
            defaultValue={competition.overview}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
          />
        </div>
        <FormField label="Domain / competency area" name="domain" defaultValue={competition.domain} />

        <div>
          <label className="text-sm font-medium text-foreground">Participation category</label>
          <select
            name="pathway"
            defaultValue={competition.pathway ?? ""}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
          >
            <option value="">Not assigned</option>
            {pathwayOrder.map((p) => (
              <option key={p} value={p}>
                {pathwayLabels[p]}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted">Which Route 1 card this appears under on the home page.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" name="supports_individual" defaultChecked={competition.supportsIndividual} />
            Supports individual entries
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" name="supports_team" defaultChecked={competition.supportsTeam} />
            Supports team entries
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FormField label="Fee amount" name="fee_amount" type="number" defaultValue={competition.feeAmount?.toString() ?? ""} />
            <p className="mt-1 text-xs text-muted">
              Every registration requires a fee receipt upload regardless — leave blank if the amount isn&apos;t set yet and
              students will see &ldquo;to be confirmed&rdquo;.
            </p>
          </div>
          <FormField label="Season" name="season" defaultValue={competition.season ?? ""} />
        </div>

        {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
        {state.success && <p className="text-sm text-emerald-600 dark:text-emerald-400">Saved.</p>}
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save overview"}
        </button>
      </form>
    </div>
  );
}
