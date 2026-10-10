"use client";

import { useActionState, useEffect, useState } from "react";
import { isSchoolType, SCHOOL_TYPES, type School } from "@/domain/schools/types";
import { updateSchoolProfileAction, type ActionState } from "@/domain/schools/actions";
import { updateCoordinatorAvatarAction, removeCoordinatorAvatarAction } from "@/domain/profiles/actions";
import { ChangePasswordForm } from "@/ui/components/ChangePasswordForm";
import { FormField } from "@/ui/components/FormField";
import { RequiredMark } from "@/ui/components/RequiredMark";
import { SelectField } from "@/ui/components/SelectField";
import { ProfilePhotoCard } from "@/ui/components/dashboard/ProfilePhotoCard";

const initialState: ActionState = { error: null };

export function SchoolProfileCard({
  school,
  coordinatorName,
  avatarUrl,
  onEditingChange,
}: {
  school: School;
  coordinatorName: string;
  avatarUrl: string | null;
  onEditingChange?: (editing: boolean) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(updateSchoolProfileAction, initialState);

  function setOpen(next: boolean) {
    setEditing(next);
    onEditingChange?.(next);
  }

  useEffect(() => {
    if (!state.success) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing local "is the form open" UI state to the server action's result, not derivable from props/state alone
    setEditing(false);
    onEditingChange?.(false);
  }, [state.success, onEditingChange]);

  if (!editing) {
    return (
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{school.officialName}</h2>
            <p className="text-sm text-muted">
              {[school.schoolType, school.city, school.country].filter(Boolean).join(" · ") || "No profile details yet"}
            </p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="cursor-pointer rounded-full bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground hover:opacity-90"
          >
            Edit profile
          </button>
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-muted">Principal</dt>
            <dd className="text-foreground">{school.principalName ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted">Phone</dt>
            <dd className="text-foreground">{school.schoolPhone ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted">Website</dt>
            <dd className="text-foreground">{school.website ?? "—"}</dd>
          </div>
        </dl>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="mb-3 inline-flex cursor-pointer text-sm font-semibold text-accent hover:opacity-90"
      >
        ← Back to overview
      </button>
      <div className="mb-4 max-w-xl">
        <h2 className="mb-3 text-lg font-semibold text-foreground">Avatar</h2>
        <ProfilePhotoCard
          name={coordinatorName}
          photoUrl={avatarUrl}
          saveAction={updateCoordinatorAvatarAction}
          removeAction={removeCoordinatorAvatarAction}
          caption="Shown next to your name in the header and on the dashboard."
        />
      </div>
      <form action={formAction} className="space-y-3 rounded-xl border border-border bg-surface p-4">
        <h2 className="text-lg font-semibold text-foreground">Edit school profile</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="Official name" name="official_name" required defaultValue={school.officialName} />
          <div>
            <label className="text-sm font-medium text-foreground">
              School type
              <RequiredMark />
            </label>
            <SelectField
              name="school_type"
              label="School type"
              required
              placeholder="Select school type"
              className="mt-1"
              defaultValue={school.schoolType && isSchoolType(school.schoolType) ? school.schoolType : ""}
              options={SCHOOL_TYPES.map((type) => ({ value: type, label: type }))}
            />
          </div>
          <FormField label="City" name="city" defaultValue={school.city ?? ""} />
          <FormField label="Country" name="country" defaultValue={school.country ?? ""} />
          <FormField label="Principal / head name" name="principal_name" defaultValue={school.principalName ?? ""} />
          <FormField label="School phone" name="school_phone" type="tel" defaultValue={school.schoolPhone ?? ""} />
          <FormField label="Website" name="website" type="url" defaultValue={school.website ?? ""} />
        </div>
        {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setOpen(false)}
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
      <div className="mt-4 max-w-md rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-3 text-lg font-semibold text-foreground">Change password</h2>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
