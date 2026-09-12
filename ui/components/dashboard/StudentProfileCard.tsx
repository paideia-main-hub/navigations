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

export function StudentProfileCard({ fullName, profile }: { fullName: string; profile: StudentProfile }) {
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
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{fullName}</h2>
            <p className="text-sm text-muted">Grade {profile.grade ?? "—"}</p>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="rounded-full border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:border-accent"
          >
            Edit profile
          </button>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>Profile completion</span>
            <span>{completion}%</span>
          </div>
          <div className="mt-1 h-1.5 w-full rounded-full bg-surface-muted">
            <div className="h-1.5 rounded-full bg-accent" style={{ width: `${completion}%` }} />
          </div>
        </div>

        <dl className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-muted">Date of birth</dt>
            <dd className="text-foreground">{profile.dateOfBirth ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted">Guardian</dt>
            <dd className="text-foreground">{profile.guardianName ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted">Guardian contact</dt>
            <dd className="text-foreground">{profile.guardianMobile ?? profile.guardianEmail ?? "—"}</dd>
          </div>
        </dl>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3 rounded-xl border border-border bg-surface p-4">
      <h2 className="text-lg font-semibold text-foreground">Edit profile</h2>
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
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
