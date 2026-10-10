"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient as createStorageClient } from "@supabase/supabase-js";
import { createWorkFileUploadAction, saveSubmissionAction } from "@/domain/submissions/actions";
import {
  isFieldVisible,
  MAX_UPLOAD_MB,
  submissionStatusLabels,
  validateForSubmit,
  wordCount,
  type FieldDef,
  type SubmissionCompetition,
  type SubmissionFile,
  type WorkSubmission,
} from "@/domain/submissions/config";
import { withFileUploadProgress, type UploadProgressState } from "@/ui/lib/fileUploadProgress";
import { RequiredMark } from "@/ui/components/RequiredMark";
import { SelectField } from "@/ui/components/SelectField";
import { UploadProgress } from "@/ui/components/UploadProgress";

const control =
  "mt-1 h-[38px] w-full rounded-md border border-border bg-background px-2 text-sm leading-[38px] text-foreground outline-none focus:border-accent disabled:opacity-70";
const area =
  "mt-1 min-h-20 w-full resize-y rounded-md border border-border bg-background px-2 py-2 text-sm leading-5 text-foreground outline-none focus:border-accent disabled:opacity-70";

/** Uploads with the signed token only, so a missing browser session cannot
 * reject the file before it is stored. */
function workStorage() {
  return createStorageClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

function formatSize(bytes: number): string {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function FieldLabel({ children, required }: { children: string; required?: boolean }) {
  return (
    <span className="text-xs font-semibold tracking-wide text-foreground">
      {children}
      {required ? <RequiredMark /> : null}
    </span>
  );
}

/** The student's entry form for one Independent Submission competition,
 * generated from domain/submissions/config.ts. A signed upload token is
 * issued on the server, then the file goes straight from the browser into
 * the private work-submissions bucket (under the student's own folder).
 * Typed answers and file references are saved with saveSubmissionAction. */
function formatPakistan(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    timeZone: "Asia/Karachi",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SubmissionForm({
  registrationId,
  registrationNumber,
  config,
  initial,
}: {
  registrationId: string;
  registrationNumber: string;
  config: SubmissionCompetition;
  initial: WorkSubmission | null;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>(initial?.answers ?? {});
  const [files, setFiles] = useState<Record<string, SubmissionFile>>(initial?.files ?? {});
  const [uploading, setUploading] = useState<{ fieldId: string; name: string; size: number } | null>(null);
  const [transfer, setTransfer] = useState<UploadProgressState | null>(null);
  const [uploadError, setUploadError] = useState<{ fieldId: string; text: string } | null>(null);
  const [saving, setSaving] = useState<"draft" | "submit" | null>(null);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [problems, setProblems] = useState<string[]>([]);
  const status = initial?.status ?? null;
  const locked = status === "scored";

  function set(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  async function upload(field: Extract<FieldDef, { kind: "file" }>, file: File) {
    setMessage(null);
    setUploadError(null);
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!field.extensions.includes(ext)) {
      setUploadError({ fieldId: field.id, text: `Please choose a ${field.extensions.join(", ").toUpperCase()} file.` });
      return;
    }
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setUploadError({
        fieldId: field.id,
        text: `${file.name} is ${formatSize(file.size)}. The limit is ${MAX_UPLOAD_MB} MB — compress it and try again.`,
      });
      return;
    }
    setUploading({ fieldId: field.id, name: file.name, size: file.size });
    setTransfer({ phase: "uploading", percent: 0 });
    try {
      const prepared = await createWorkFileUploadAction({ registrationId, fieldId: field.id, extension: ext });
      if (prepared.error || !prepared.path || !prepared.token) {
        setUploadError({ fieldId: field.id, text: prepared.error ?? "Could not start the upload." });
        return;
      }
      const uploadPath = prepared.path;
      const uploadToken = prepared.token;
      const { error } = await withFileUploadProgress(setTransfer, () =>
        workStorage()
          .storage.from("work-submissions")
          .uploadToSignedUrl(uploadPath, uploadToken, file, { contentType: file.type || undefined }),
      );
      if (error) {
        setUploadError({ fieldId: field.id, text: `${file.name} was not uploaded. ${error.message}` });
        return;
      }
      setFiles((prev) => ({ ...prev, [field.id]: { path: uploadPath, name: file.name, size: file.size } }));
    } catch (err) {
      setUploadError({
        fieldId: field.id,
        text: `${file.name} was not uploaded. ${err instanceof Error ? err.message : "Try again."}`,
      });
    } finally {
      setUploading(null);
      setTransfer(null);
    }
  }

  async function save(submit: boolean) {
    setMessage(null);
    setProblems([]);
    if (submit) {
      const local = validateForSubmit(config, answers, files);
      if (local.length > 0) {
        setProblems(local);
        return;
      }
    }
    setSaving(submit ? "submit" : "draft");
    let percent = 12;
    setTransfer({ phase: "saving", percent });
    const pulse = window.setInterval(() => {
      percent = Math.min(90, percent + Math.max(2, Math.round((90 - percent) * 0.2)));
      setTransfer({ phase: "saving", percent });
    }, 200);
    let res: Awaited<ReturnType<typeof saveSubmissionAction>>;
    try {
      res = await saveSubmissionAction({ registrationId, answers, files, submit });
    } finally {
      window.clearInterval(pulse);
      setSaving(null);
      setTransfer(null);
    }
    if (res.error) {
      setProblems(res.problems ?? []);
      setMessage({ tone: "error", text: res.error });
      return;
    }
    const received = Object.values(files)
      .map((file) => file.name)
      .filter((name) => name.length > 0);
    setMessage({
      tone: "ok",
      text: submit
        ? `Submission confirmed. Entry ${registrationNumber} · ${formatPakistan(new Date().toISOString())} PKT.${
            received.length > 0 ? ` Files received: ${received.join(", ")}.` : ""
          } You can still update it until it's scored.`
        : "Draft saved.",
    });
    router.refresh();
  }

  if (locked && initial) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-emerald-300 bg-surface px-4 py-3 dark:border-emerald-800">
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">{submissionStatusLabels.scored}</p>
          <p className="mt-1 text-2xl font-black text-foreground">
            {initial.totalScore} <span className="text-base font-semibold text-muted">/ {initial.maxScore}</span>
          </p>
          {initial.feedback && <p className="mt-2 text-sm whitespace-pre-line text-foreground">{initial.feedback}</p>}
        </div>
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          {config.rubric.map((group, gi) => (
            <div key={gi}>
              {group.title && <p className="bg-surface-muted px-3 py-1.5 text-xs font-semibold text-muted">{group.title}</p>}
              {group.criteria.map((c) => (
                <div key={c.key} className="flex justify-between border-t border-border px-3 py-1.5 text-sm">
                  <span className="text-foreground">{c.label}</span>
                  <span className="font-semibold text-foreground">
                    {initial.scores[c.key] ?? "—"} / {c.max}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const visible = config.fields.filter((f) => isFieldVisible(f, answers));

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      {status ? (
        <p
          className={`border-b border-border px-4 py-2 text-xs font-medium ${
            status === "submitted"
              ? "bg-sky-50 text-sky-800 dark:bg-sky-500/10 dark:text-sky-300"
              : "bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300"
          }`}
        >
          {submissionStatusLabels[status]}
          {initial?.submittedAt ? ` · ${formatPakistan(initial.submittedAt)} PKT` : ""}
        </p>
      ) : null}
      {status === "submitted" && Object.keys(files).length > 0 ? (
        <p className="border-b border-border px-4 py-2 text-xs text-muted">
          Files received: {Object.values(files).map((file) => file.name).join(", ")}
        </p>
      ) : null}

      <div className="grid gap-x-4 gap-y-3 p-4 sm:grid-cols-2">
        {visible.map((field) => {
          const value = answers[field.id] ?? "";
          const required = "required" in field && field.required;
          const help = "help" in field && field.help ? <p className="mt-1 text-[11px] leading-4 text-muted">{field.help}</p> : null;
          const wide = field.kind === "textarea" || field.kind === "file" || field.kind === "declaration" || field.kind === "url";

          switch (field.kind) {
            case "text":
              return (
                <label key={field.id} className="block">
                  <FieldLabel required={required}>{field.label}</FieldLabel>
                  <input value={value} onChange={(e) => set(field.id, e.target.value)} className={control} />
                  {help}
                </label>
              );
            case "url":
              return (
                <label key={field.id} className="block sm:col-span-2">
                  <FieldLabel required={required}>{field.label}</FieldLabel>
                  <input type="url" value={value} onChange={(e) => set(field.id, e.target.value)} placeholder="https://" className={control} />
                  {help}
                </label>
              );
            case "select":
              return (
                <div key={field.id} className="block">
                  <FieldLabel required={required}>{field.label}</FieldLabel>
                  <SelectField
                    name={field.id}
                    label={field.label}
                    required={required}
                    placeholder="Choose…"
                    className="mt-1"
                    value={value}
                    onValueChange={(next) => set(field.id, next)}
                    options={field.options.map((option) => ({ value: option, label: option }))}
                  />
                  {help}
                </div>
              );
            case "textarea": {
              const n = wordCount(value);
              const out = field.words && value && (n < field.words[0] || n > field.words[1]);
              return (
                <label key={field.id} className="block sm:col-span-2">
                  <FieldLabel required={required}>{field.label}</FieldLabel>
                  <textarea
                    value={value}
                    onChange={(e) => set(field.id, e.target.value)}
                    rows={field.words && field.words[1] > 150 ? 5 : 3}
                    className={area}
                  />
                  <div className="mt-1 flex justify-between gap-3">
                    {help ?? <span />}
                    {field.words ? (
                      <span className={`shrink-0 text-[11px] ${out ? "text-amber-600 dark:text-amber-400" : "text-muted"}`}>
                        {n} words{field.words[1] > 0 ? ` · ${field.words[0]}–${field.words[1]}` : ""}
                      </span>
                    ) : null}
                  </div>
                </label>
              );
            }
            case "file": {
              const current = files[field.id];
              const pending = uploading?.fieldId === field.id ? uploading : null;
              const shown = current ?? pending;
              return (
                <div key={field.id} className={wide ? "sm:col-span-2" : ""}>
                  <FieldLabel required={required}>{field.label}</FieldLabel>
                  {help}
                  <div className="mt-1 flex h-[38px] items-center gap-2 rounded-md border border-dashed border-border bg-background px-2">
                    {shown ? (
                      <>
                        <span className="min-w-0 truncate text-sm text-foreground">{shown.name}</span>
                        <span className="shrink-0 text-[11px] text-muted">{formatSize(shown.size)}</span>
                        {current ? (
                          <button
                            type="button"
                            onClick={() => setFiles((prev) => Object.fromEntries(Object.entries(prev).filter(([k]) => k !== field.id)))}
                            className="ml-auto shrink-0 cursor-pointer text-[11px] font-semibold text-red-600 hover:underline dark:text-red-400"
                          >
                            Remove
                          </button>
                        ) : null}
                      </>
                    ) : (
                      <>
                        <label className="inline-flex h-6 cursor-pointer items-center rounded-md bg-accent-soft px-2 text-xs font-semibold text-accent-strong hover:opacity-90">
                          Choose file
                          <input
                            type="file"
                            accept={field.accept}
                            disabled={uploading !== null}
                            className="sr-only"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              e.target.value = "";
                              if (f) void upload(field, f);
                            }}
                          />
                        </label>
                        <span className="truncate text-[11px] text-muted">
                          {field.extensions.join(", ").toUpperCase()} · up to {MAX_UPLOAD_MB} MB
                        </span>
                      </>
                    )}
                  </div>
                  {transfer && pending ? <div className="mt-2"><UploadProgress phase={transfer.phase} percent={transfer.percent} /></div> : null}
                  {uploadError?.fieldId === field.id ? (
                    <p className="mt-1 text-[11px] leading-4 text-red-600 dark:text-red-400">{uploadError.text}</p>
                  ) : null}
                </div>
              );
            }
            case "declaration":
              return (
                <label key={field.id} className="flex items-start gap-2 rounded-md border border-border bg-background px-2 py-2.5 text-xs leading-5 text-foreground sm:col-span-2">
                  <input type="checkbox" checked={value === "yes"} onChange={(e) => set(field.id, e.target.checked ? "yes" : "")} className="mt-0.5" />
                  {field.label}
                </label>
              );
          }
        })}
      </div>

      {problems.length > 0 ? (
        <div className="border-t border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
          <p className="font-semibold">Before you can submit:</p>
          <ul className="mt-1 list-disc pl-5 text-xs">
            {problems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {message ? (
        <p
          className={`border-t border-border px-4 py-2 text-sm ${
            message.tone === "ok" ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
          }`}
        >
          {message.text}
        </p>
      ) : null}

      {transfer && saving ? (
        <div className="border-t border-border px-4 py-3">
          <UploadProgress phase={transfer.phase} percent={transfer.percent} />
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 border-t border-border px-4 py-3">
        <button
          type="button"
          onClick={() => save(false)}
          disabled={saving !== null || uploading !== null}
          className="form-action rounded-full border border-border px-4 text-sm font-semibold text-foreground hover:border-accent disabled:opacity-50"
        >
          {saving === "draft" ? "Saving…" : "Save draft"}
        </button>
        <button
          type="button"
          onClick={() => save(true)}
          disabled={saving !== null || uploading !== null}
          className="form-action rounded-full bg-accent px-4 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-50"
        >
          {saving === "submit" ? "Submitting…" : status === "submitted" ? "Update submission" : "Submit entry"}
        </button>
      </div>
    </div>
  );
}
