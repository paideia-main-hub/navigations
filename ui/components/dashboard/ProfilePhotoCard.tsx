"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { removeOwnPhotoAction, updateOwnPhotoAction } from "@/domain/students/actions";
import { withFileUploadProgress, type UploadProgressState } from "@/ui/lib/fileUploadProgress";
import { UploadProgress } from "@/ui/components/UploadProgress";

type PhotoResult = { error: string | null; url?: string };

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Student profile photo: view it full size, upload/change it (with a
 * preview before saving) or remove it. The server crops and resizes the
 * image, so what's saved may be framed slightly differently from the preview's
 * centre crop. */
export function ProfilePhotoCard({
  name,
  photoUrl,
  saveAction = updateOwnPhotoAction,
  removeAction = removeOwnPhotoAction,
  caption = "Shown on your dashboard and with any published results.",
}: {
  name: string;
  photoUrl: string | null;
  saveAction?: (formData: FormData) => Promise<PhotoResult>;
  removeAction?: () => Promise<{ error: string | null }>;
  caption?: string;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [current, setCurrent] = useState(photoUrl);
  const [pending, setPending] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [viewing, setViewing] = useState(false);
  const [busy, setBusy] = useState<"save" | "remove" | null>(null);
  const [transfer, setTransfer] = useState<UploadProgressState | null>(null);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);

  // Free the object URL behind the preview when it changes or on unmount.
  useEffect(() => {
    if (!pending) return;
    const url = URL.createObjectURL(pending);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the preview URL is derived from the chosen file and must be revoked
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [pending]);

  useEffect(() => {
    if (!viewing) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setViewing(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewing]);

  function choose(file: File | undefined) {
    setMessage(null);
    setConfirmRemove(false);
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      setMessage({ tone: "error", text: "Use a JPG, PNG or WebP image (iPhone HEIC photos: export them as JPG first)." });
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setMessage({ tone: "error", text: "That image is larger than 8 MB — please choose a smaller one." });
      return;
    }
    setPending(file);
  }

  function cancel() {
    setPending(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function save() {
    if (!pending) return;
    setBusy("save");
    setMessage(null);
    const fd = new FormData();
    fd.set("photo", pending);
    const res = await withFileUploadProgress(setTransfer, () => saveAction(fd));
    setTransfer(null);
    setBusy(null);
    if (res.error) {
      setMessage({ tone: "error", text: res.error });
      return;
    }
    setCurrent(res.url ?? null);
    cancel();
    setMessage({ tone: "ok", text: "Profile photo updated." });
    router.refresh();
  }

  async function remove() {
    setBusy("remove");
    setMessage(null);
    const res = await removeAction();
    setBusy(null);
    setConfirmRemove(false);
    if (res.error) {
      setMessage({ tone: "error", text: res.error });
      return;
    }
    setCurrent(null);
    setMessage({ tone: "ok", text: "Profile photo removed." });
    router.refresh();
  }

  const shown = preview ?? current;

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-center gap-5">
        <button
          type="button"
          onClick={() => current && !preview && setViewing(true)}
          disabled={!current || Boolean(preview)}
          aria-label={current ? "View profile photo" : undefined}
          className="group relative h-28 w-28 shrink-0 overflow-hidden rounded-full ring-4 ring-accent-soft disabled:cursor-default"
        >
          {shown ? (
            // eslint-disable-next-line @next/next/no-img-element -- public Supabase Storage URL or a local preview blob
            <img src={shown} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="grid h-full w-full place-items-center bg-brand-deep text-3xl font-bold text-brand-deep-foreground">{initials(name)}</span>
          )}
          {current && !preview && (
            <span className="absolute inset-0 grid place-items-center bg-black/45 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
              View
            </span>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground">{name}</p>
          <p className="text-sm text-muted">
            {preview
              ? "Preview — save to use this photo."
              : current
                ? caption
                : "No photo yet — your initials are shown instead."}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {preview ? (
              <>
                <button
                  type="button"
                  onClick={save}
                  disabled={busy !== null}
                  className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {busy === "save" ? "Saving…" : "Save photo"}
                </button>
                <button type="button" onClick={cancel} disabled={busy !== null} className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground">
                  Cancel
                </button>
              </>
            ) : (
              <>
                {current && (
                  <button
                    type="button"
                    onClick={() => setViewing(true)}
                    className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground hover:border-accent"
                  >
                    View
                  </button>
                )}
                <label className="cursor-pointer rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90">
                  {current ? "Change photo" : "Upload photo"}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(e) => choose(e.target.files?.[0])}
                  />
                </label>
                {current &&
                  (confirmRemove ? (
                    <span className="flex items-center gap-2 text-sm">
                      <span className="text-muted">Remove it?</span>
                      <button type="button" onClick={remove} disabled={busy !== null} className="font-semibold text-red-600 hover:underline dark:text-red-400">
                        {busy === "remove" ? "Removing…" : "Yes, remove"}
                      </button>
                      <button type="button" onClick={() => setConfirmRemove(false)} className="text-muted hover:underline">
                        Keep
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmRemove(true)}
                      className="rounded-full px-3 py-2 text-sm font-semibold text-red-600 hover:underline dark:text-red-400"
                    >
                      Remove
                    </button>
                  ))}
              </>
            )}
          </div>
          {transfer ? (
            <div className="mt-3">
              <UploadProgress phase={transfer.phase} percent={transfer.percent} />
            </div>
          ) : null}
          <p className="mt-2 text-xs text-muted">JPG, PNG or WebP, up to 8 MB. It&apos;s cropped to a square automatically.</p>
          {message && (
            <p className={`mt-2 text-sm ${message.tone === "ok" ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>{message.text}</p>
          )}
        </div>
      </div>

      {viewing && current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Profile photo"
          onClick={() => setViewing(false)}
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-6"
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element -- public Supabase Storage URL */}
            <img src={current} alt={`${name}'s profile photo`} className="max-h-[80vh] max-w-[90vw] rounded-2xl shadow-2xl" />
            <button
              type="button"
              onClick={() => setViewing(false)}
              aria-label="Close"
              className="absolute -top-3 -right-3 grid h-9 w-9 place-items-center rounded-full bg-surface text-lg font-bold text-foreground shadow"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
