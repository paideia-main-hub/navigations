"use client";

import { useActionState, useEffect, useState } from "react";
import type { StudentProfile } from "@/domain/students/types";
import { updateStudentProfileAction, type ActionState } from "@/domain/students/actions";
import { FormField } from "@/ui/components/FormField";

const initialState: ActionState = { error: null };

const PROFILE_FIELDS: (keyof StudentProfile)[] = [
  "grade",
  "dateOfBirth",
  "gender",
  "guardianName",
  "guardianRelationship",
  "guardianEmail",
  "guardianMobile",
];

/** Display DOB as day-month-year (DD-MM-YYYY). Stored values are typically YYYY-MM-DD. */
function formatDateOfBirth(value: string | null | undefined): string {
  if (!value) return "—";
  const iso = value.slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (match) {
    const [, year, month, day] = match;
    return `${day}-${month}-${year}`;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const year = String(parsed.getFullYear());
  return `${day}-${month}-${year}`;
}

export function StudentProfileCard({
  fullName,
  email = null,
  profile,
}: {
  fullName: string;
  email?: string | null;
  profile: StudentProfile;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(updateStudentProfileAction, initialState);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing local "is the form open" UI state to the server action's result, not derivable from props/state alone
    if (state.success) setEditing(false);
  }, [state.success]);

  const filledCount = PROFILE_FIELDS.filter((f) => Boolean(profile[f])).length;
  const completion = Math.round((filledCount / PROFILE_FIELDS.length) * 100);

  if (!editing) {
    return (
      <div className="overflow-hidden rounded-2xl border border-accent/30 bg-surface shadow-[0_14px_36px_-28px_rgba(31,32,65,0.5)]">
        <div className="flex flex-col gap-4 border-b border-accent/15 bg-accent-soft/60 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
          <div className="min-w-0">
            <p className="text-[11px] font-bold tracking-[0.16em] text-accent-strong uppercase">Your profile</p>
            <h2 className="mt-1 text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">{fullName}</h2>
            <p className="mt-1 text-sm font-medium text-muted">
              Grade <span className="text-foreground">{profile.grade ?? "—"}</span>
              {email ? (
                <>
                  {" · "}
                  <span className="break-all text-foreground">{email}</span>
                </>
              ) : null}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent-strong"
          >
            Edit profile
          </button>
        </div>

        <div className="space-y-5 px-5 py-5 sm:px-6">
          <div>
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="font-semibold tracking-wide text-muted uppercase">Profile completion</span>
              <span className="font-bold text-accent-strong">{completion}%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-muted">
              <div
                className="h-2 rounded-full bg-accent transition-[width] duration-500 ease-out"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>

          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-accent/20 bg-background px-4 py-3">
              <dt className="text-[11px] font-bold tracking-[0.12em] text-muted uppercase">Email</dt>
              <dd className="mt-1.5 text-sm font-semibold break-all text-foreground">{email ?? "—"}</dd>
            </div>
            <div className="rounded-xl border border-accent/20 bg-background px-4 py-3">
              <dt className="text-[11px] font-bold tracking-[0.12em] text-muted uppercase">Date of birth</dt>
              <dd className="mt-1.5 text-sm font-semibold text-foreground">
                {formatDateOfBirth(profile.dateOfBirth)}
              </dd>
            </div>
            <div className="rounded-xl border border-accent/20 bg-background px-4 py-3">
              <dt className="text-[11px] font-bold tracking-[0.12em] text-muted uppercase">Guardian</dt>
              <dd className="mt-1.5 text-sm font-semibold text-foreground">{profile.guardianName ?? "—"}</dd>
            </div>
            <div className="rounded-xl border border-accent/20 bg-background px-4 py-3">
              <dt className="text-[11px] font-bold tracking-[0.12em] text-muted uppercase">Guardian contact</dt>
              <dd className="mt-1.5 text-sm font-semibold break-all text-foreground">
                {profile.guardianMobile ?? profile.guardianEmail ?? "—"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-accent/30 bg-surface p-5 shadow-[0_14px_36px_-28px_rgba(31,32,65,0.5)] sm:p-6"
    >
      <div>
        <p className="text-[11px] font-bold tracking-[0.16em] text-accent-strong uppercase">Your profile</p>
        <h2 className="mt-1 text-xl font-extrabold tracking-tight text-foreground">Edit profile</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Grade / class" name="grade" defaultValue={profile.grade ?? ""} />
        <FormField label="Date of birth" name="date_of_birth" type="date" defaultValue={profile.dateOfBirth ?? ""} />
        <FormField label="Gender" name="gender" defaultValue={profile.gender ?? ""} />
        <FormField label="Guardian name" name="guardian_name" defaultValue={profile.guardianName ?? ""} />
        <FormField
          label="Guardian relationship"
          name="guardian_relationship"
          defaultValue={profile.guardianRelationship ?? ""}
        />
        <FormField label="Guardian email" name="guardian_email" type="email" defaultValue={profile.guardianEmail ?? ""} />
        <FormField label="Guardian mobile" name="guardian_mobile" type="tel" defaultValue={profile.guardianMobile ?? ""} />
      </div>
      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      <div className="flex flex-wrap gap-3 pt-1">
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="cursor-pointer rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent-strong"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className="cursor-pointer rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors duration-300 hover:bg-accent-strong hover:text-white disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
