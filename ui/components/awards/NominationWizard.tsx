"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import type { AwardCategory } from "@/domain/awards/types";
import { submitNominationAction, type ActionState } from "@/domain/award-nominations/actions";
import { CATEGORY_FIELDS } from "./categoryFields";

const initialState: ActionState = { error: null };

interface EventRow {
  sport: string;
  event: string;
  organizer: string;
  level: string;
  role: string;
  result: string;
  evidence_note: string;
}

const blankEventRow: EventRow = { sport: "", event: "", organizer: "", level: "", role: "", result: "", evidence_note: "" };

export function NominationWizard({
  category,
  schoolId,
  defaultNomineeName = "",
}: {
  category: AwardCategory;
  schoolId?: string | null;
  /** "Self" for an independent Spotlight nominator submitting about themselves. */
  defaultNomineeName?: string;
}) {
  const [state, formAction, pending] = useActionState(submitNominationAction, initialState);
  const fields = CATEGORY_FIELDS[category.slug] ?? [];
  const isSports = category.layer === "sports";
  const isIdeaOfTheYear = category.slug === "idea-of-the-year";
  const judged = category.rubricCriteria.length > 0;

  const [eventRows, setEventRows] = useState<EventRow[]>(isSports ? [{ ...blankEventRow }] : []);
  const requiredSports = category.slug === "blazer-athlete" ? 3 : 1;

  const [consent, setConsent] = useState({ terms: false, privacy: false, resultPublication: false, photoPublication: false });
  const consentComplete = consent.terms && consent.privacy;

  if (state.success) {
    return (
      <div className="max-w-xl space-y-4 text-center">
        <h2 className="text-xl font-bold text-foreground">Nomination submitted</h2>
        <p className="text-muted">
          Your nomination number is <span className="font-semibold text-foreground">{state.nominationNumber}</span>. Track
          its status from your dashboard.
        </p>
        <Link href="/dashboard" className="inline-block rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90">
          Go to dashboard
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <input type="hidden" name="category_id" value={category.id} />
      {schoolId && <input type="hidden" name="school_id" value={schoolId} />}

      <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
        <h2 className="font-semibold text-foreground">Nominee</h2>
        <div>
          <label className="text-sm font-medium text-foreground">Name</label>
          <input
            name="nominee_name"
            required
            defaultValue={defaultNomineeName}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Role / relationship (e.g. &ldquo;Grade 8 Math teacher&rdquo;, &ldquo;self&rdquo;)</label>
          <input name="nominee_relationship" className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" />
        </div>
        {isIdeaOfTheYear && (
          <div>
            <label className="text-sm font-medium text-foreground">Route</label>
            <select name="route" required defaultValue="implemented" className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
              <option value="implemented">Implemented idea — I can show implementation and results</option>
              <option value="future_proposal">Future proposal — planned for an upcoming edition or stated future year</option>
            </select>
          </div>
        )}
      </div>

      {fields.length > 0 && (
        <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
          <h2 className="font-semibold text-foreground">Your submission</h2>
          {fields.map((f) =>
            f.type === "textarea" ? (
              <div key={f.key}>
                <label className="text-sm font-medium text-foreground">{f.label}</label>
                <textarea name={`field_${f.key}`} rows={3} required className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" />
              </div>
            ) : (
              <div key={f.key}>
                <label className="text-sm font-medium text-foreground">{f.label}</label>
                <input name={`field_${f.key}`} required className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" />
              </div>
            ),
          )}
        </div>
      )}

      {isSports && (
        <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
          <h2 className="font-semibold text-foreground">
            Event record{requiredSports > 1 ? `s (${requiredSports} sports required)` : ""}
          </h2>
          {eventRows.map((row, i) => (
            <div key={i} className="grid grid-cols-2 gap-2 rounded-lg border border-border p-3">
              {(["sport", "event", "organizer", "level", "role", "result"] as const).map((field) => (
                <input
                  key={field}
                  name={`event[${i}][${field}]`}
                  placeholder={field[0].toUpperCase() + field.slice(1)}
                  value={row[field]}
                  onChange={(e) => setEventRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: e.target.value } : r)))}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              ))}
              <textarea
                name={`event[${i}][evidence_note]`}
                placeholder="Evidence note (certificate ref, organizer confirmation, etc.)"
                value={row.evidence_note}
                onChange={(e) => setEventRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, evidence_note: e.target.value } : r)))}
                className="col-span-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
              {eventRows.length > 1 && (
                <button type="button" onClick={() => setEventRows((prev) => prev.filter((_, idx) => idx !== i))} className="col-span-2 text-left text-xs text-red-600 dark:text-red-400">
                  Remove this event
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => setEventRows((prev) => [...prev, { ...blankEventRow }])} className="text-sm font-semibold text-accent">
            + Add event
          </button>
        </div>
      )}

      <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
        <h2 className="font-semibold text-foreground">Verification</h2>
        <p className="text-xs text-muted">Kept private — used only to confirm your claims, never published.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-foreground">Verifier name</label>
            <input name="verifier_name" className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Verifier contact</label>
            <input name="verifier_contact" className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" />
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
        <h2 className="font-semibold text-foreground">Evidence</h2>
        <p className="text-xs text-muted">One PDF (up to 10MB/10 pages), plus up to five JPG/PNG images (up to 5MB each).</p>
        <input type="file" name="evidence_files" multiple accept=".pdf,image/*,audio/*,video/*" className="text-sm text-muted" />
        <div>
          <label className="text-sm font-medium text-foreground">Or a private evidence link (audio/video hosted elsewhere)</label>
          <input name="evidence_link" type="url" placeholder="https://…" className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" />
        </div>
      </div>

      <div className="space-y-2 rounded-xl border border-border bg-surface p-4">
        <h2 className="font-semibold text-foreground">Consent</h2>
        <label className="flex items-start gap-2 text-sm text-foreground">
          <input type="checkbox" name="consent_terms" checked={consent.terms} onChange={(e) => setConsent((p) => ({ ...p, terms: e.target.checked }))} className="mt-0.5" />
          I accept the award category rules and code of conduct.
        </label>
        <label className="flex items-start gap-2 text-sm text-foreground">
          <input type="checkbox" name="consent_privacy" checked={consent.privacy} onChange={(e) => setConsent((p) => ({ ...p, privacy: e.target.checked }))} className="mt-0.5" />
          I consent to the site&apos;s data privacy policy.
        </label>
        <label className="flex items-start gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            name="consent_result_publication"
            checked={consent.resultPublication}
            onChange={(e) => setConsent((p) => ({ ...p, resultPublication: e.target.checked }))}
            className="mt-0.5"
          />
          I consent to publication of the result if this nomination is approved.
        </label>
        <label className="flex items-start gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            name="consent_photo_publication"
            checked={consent.photoPublication}
            onChange={(e) => setConsent((p) => ({ ...p, photoPublication: e.target.checked }))}
            className="mt-0.5"
          />
          I consent to photo publication, where applicable. Declining this does not reduce the nomination&apos;s score.
        </label>
      </div>

      {judged && (
        <p className="text-xs text-muted">
          Two judges assess this category independently against a {category.passThreshold}% pass threshold.
        </p>
      )}

      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      <button
        type="submit"
        disabled={pending || !consentComplete}
        className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Submitting…" : "Submit nomination"}
      </button>
    </form>
  );
}
