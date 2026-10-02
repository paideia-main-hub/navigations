"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { removeAwardImageAction, type ActionState } from "@/domain/awards/actions";
import type { AwardCategory } from "@/domain/awards/types";
import { resolveAwardCardImage } from "@/domain/awards/cardImage";

const initialState: ActionState = { error: null };

type UploadPhase = "idle" | "uploading" | "processing" | "done";

export function AwardCategoryImageUploader({ category }: { category: AwardCategory }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [removeState, removeAction, removing] = useActionState(removeAwardImageAction, initialState);
  const [previewUrl, setPreviewUrl] = useState(() =>
    category.imageUrl ? resolveAwardCardImage(category.imageUrl, category.slug) : null,
  );
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const busy = phase === "uploading" || phase === "processing";

  useEffect(() => {
    setPreviewUrl(category.imageUrl ? resolveAwardCardImage(category.imageUrl, category.slug) : null);
  }, [category.imageUrl, category.slug]);

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
    body.set("category_id", category.id);
    body.set("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/award-image");

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
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
    <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
      <div>
        <p className="text-sm font-medium text-foreground">Card image</p>
        <p className="mt-1 text-xs text-muted">
          Uploaded images are compressed and converted to WebP before storage. Without an uploaded
          image, the public awards page uses the static file at{" "}
          <code className="text-[0.7rem]">/awards/{category.slug}.webp</code>.
        </p>
      </div>

      <div className="flex flex-wrap items-start gap-4">
        <div className="relative aspect-[16/9] w-64 shrink-0 overflow-hidden rounded-lg bg-surface-muted sm:w-72">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- admin preview of a Supabase public URL
            <img src={previewUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center px-3 text-center text-xs text-muted">
              No uploaded image yet
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
                id={`award-image-${category.id}`}
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
              {category.imageUrl ? (
                <button
                  type="button"
                  disabled={removing || busy}
                  className="text-xs font-medium text-red-600 dark:text-red-400 disabled:opacity-60"
                  onClick={() => {
                    const fd = new FormData();
                    fd.set("category_id", category.id);
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

            {(error || removeState.error) && (
              <p className="text-xs text-red-600 dark:text-red-400">{error ?? removeState.error}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
