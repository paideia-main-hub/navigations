"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/data/supabase/client";
import { saveSubmissionAction } from "@/domain/submissions/actions";
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

const input =
  "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent disabled:opacity-70";

function formatSize(bytes: number): string {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** The student's entry form for one Independent Submission competition,
 * generated from domain/submissions/config.ts. Files go straight from the
 * browser into the private work-submissions bucket (under the student's own
 * folder), so large uploads never pass through the app server; the typed
 * answers and file references are then saved with saveSubmissionAction. */
export function SubmissionForm({
  registrationId,
  userId,
  config,
  initial,
}: {
  registrationId: string;
  userId: string;
  config: SubmissionCompetition;
  initial: WorkSubmission | null;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>(initial?.answers ?? {});
  const [files, setFiles] = useState<Record<string, SubmissionFile>>(initial?.files ?? {});
  const [uploading, setUploading] = useState<string | null>(null);
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
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!field.extensions.includes(ext)) {
      setMessage({ tone: "error", text: `${field.label}: please choose a ${field.extensions.join(", ").toUpperCase()} file.` });
      return;
    }
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setMessage({
        tone: "error",
        text: `${file.name} is ${formatSize(file.size)} — the upload limit is ${MAX_UPLOAD_MB} MB.${field.linkAlternative ? " Paste a share link instead." : " Please compress it and try again."}`,
      });
      return;
    }
    setUploading(field.id);
    const path = `${userId}/${registrationId}/${field.id}-${crypto.randomUUID()}.${ext}`;
    const { error } = await createClient().storage.from("work-submissions").upload(path, file, { contentType: file.type || undefined, upsert: false });
    setUploading(null);
    if (error) {
      setMessage({ tone: "error", text: `Upload failed: ${error.message}` });
      return;
    }
    setFiles((prev) => ({ ...prev, [field.id]: { path, name: file.name, size: file.size } }));
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
    const res = await saveSubmissionAction({ registrationId, answers, files, submit });
    setSaving(null);
    if (res.error) {
      setProblems(res.problems ?? []);
      setMessage({ tone: "error", text: res.error });
      return;
    }
    setMessage({
      tone: "ok",
      text: submit ? "Submission confirmed ✓ — it's now with the League team for review. You can still update it until it's scored." : "Draft saved.",
    });
    router.refresh();
  }

  if (locked && initial) {
    return (
      <div className="space-y-5">
        <div className="rounded-xl border border-emerald-300 bg-surface p-5 dark:border-emerald-800">
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">{submissionStatusLabels.scored}</p>
          <p className="mt-1 text-3xl font-black text-foreground">
            {initial.totalScore} <span className="text-lg font-semibold text-muted">/ {initial.maxScore}</span>
          </p>
          {initial.feedback && <p className="mt-3 text-sm whitespace-pre-line text-foreground">{initial.feedback}</p>}
        </div>
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          {config.rubric.map((group, gi) => (
            <div key={gi}>
              {group.title && <p className="bg-surface-muted px-4 py-2 text-xs font-semibold text-muted">{group.title}</p>}
              {group.criteria.map((c) => (
                <div key={c.key} className="flex justify-between border-t border-border px-4 py-2 text-sm">
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

  return (
    <div className="space-y-5">
      {status && (
        <p
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            status === "submitted" ? "bg-sky-50 text-sky-800 dark:bg-sky-500/10 dark:text-sky-300" : "bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300"
          }`}
        >
          {submissionStatusLabels[status]}
          {initial?.submittedAt ? ` · ${new Date(initial.submittedAt).toLocaleString("en-GB")}` : ""}
        </p>
      )}

      {config.fields
        .filter((f) => isFieldVisible(f, answers))
        .map((field) => {
          const value = answers[field.id] ?? "";
          const required = "required" in field && field.required;
          const label = (
            <span className="text-sm font-medium text-foreground">
              {field.label}
              {required && <span className="text-red-600"> *</span>}
            </span>
          );
          const help = "help" in field && field.help ? <p className="mt-1 text-xs text-muted">{field.help}</p> : null;

          switch (field.kind) {
            case "text":
              return (
                <label key={field.id} className="block">
                  {label}
                  <input value={value} onChange={(e) => set(field.id, e.target.value)} className={input} />
                  {help}
                </label>
              );
            case "url":
              return (
                <label key={field.id} className="block">
                  {label}
                  <input type="url" value={value} onChange={(e) => set(field.id, e.target.value)} placeholder="https://" className={input} />
                  {help}
                </label>
              );
            case "select":
              return (
                <label key={field.id} className="block">
                  {label}
                  <select value={value} onChange={(e) => set(field.id, e.target.value)} className={input}>
                    <option value="">Choose…</option>
                    {field.options.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                  {help}
                </label>
              );
            case "textarea": {
              const n = wordCount(value);
              const out = field.words && value && (n < field.words[0] || n > field.words[1]);
              return (
                <label key={field.id} className="block">
                  {label}
                  <textarea value={value} onChange={(e) => set(field.id, e.target.value)} rows={field.words && field.words[1] > 150 ? 6 : 4} className={input} />
                  <div className="mt-1 flex justify-between gap-3">
                    {help ?? <span />}
                    {field.words && (
                      <span className={`shrink-0 text-xs ${out ? "text-amber-600 dark:text-amber-400" : "text-muted"}`}>
                        {n} words{field.words[1] > 0 ? ` · ${field.words[0]}–${field.words[1]}` : ""}
                      </span>
                    )}
                  </div>
                </label>
              );
            }
            case "file": {
              const current = files[field.id];
              return (
                <div key={field.id}>
                  {label}
                  {help}
                  <div className="mt-2 flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-border bg-background p-3">
                    {current ? (
                      <>
                        <span className="text-sm text-foreground">📎 {current.name}</span>
                        <span className="text-xs text-muted">{formatSize(current.size)}</span>
                        <button
                          type="button"
                          onClick={() => setFiles((prev) => Object.fromEntries(Object.entries(prev).filter(([k]) => k !== field.id)))}
                          className="text-xs font-semibold text-red-600 hover:underline dark:text-red-400"
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <label className="cursor-pointer rounded-full bg-accent-soft px-4 py-2 text-sm font-semibold text-accent-strong hover:opacity-90">
                        {uploading === field.id ? "Uploading…" : "Choose file"}
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
                    )}
                    <span className="text-xs text-muted">
                      {field.extensions.join(", ").toUpperCase()} · up to {MAX_UPLOAD_MB} MB
                    </span>
                  </div>
                </div>
              );
            }
            case "declaration":
              return (
                <label key={field.id} className="flex items-start gap-2 rounded-lg border border-border bg-surface p-3 text-sm text-foreground">
                  <input type="checkbox" checked={value === "yes"} onChange={(e) => set(field.id, e.target.checked ? "yes" : "")} className="mt-0.5" />
                  {field.label}
                </label>
              );
          }
        })}

      {problems.length > 0 && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
          <p className="font-semibold">Before you can submit:</p>
          <ul className="mt-1 list-disc pl-5">
            {problems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      )}
      {message && (
        <p className={`text-sm ${message.tone === "ok" ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>{message.text}</p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => save(false)}
          disabled={saving !== null || uploading !== null}
          className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:border-accent disabled:opacity-50"
        >
          {saving === "draft" ? "Saving…" : "Save draft"}
        </button>
        <button
          type="button"
          onClick={() => save(true)}
          disabled={saving !== null || uploading !== null}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-50"
        >
          {saving === "submit" ? "Submitting…" : status === "submitted" ? "Update submission" : "Submit entry"}
        </button>
      </div>
    </div>
  );
}
