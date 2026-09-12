"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addStudentAction, type ActionState } from "@/domain/students/actions";
import { FormField } from "@/ui/components/FormField";

const initialState: ActionState = { error: null };

export function AddStudentForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(addStudentAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing local "is the form open" UI state to the server action's result, not derivable from props/state alone
      setOpen(false);
    }
  }, [state.success]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground hover:border-accent"
      >
        + Add student
      </button>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-3 rounded-xl border border-border bg-surface p-4">
      <h3 className="font-semibold text-foreground">Add student</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Full name" name="full_name" required />
        <FormField label="Grade / class" name="grade" />
        <FormField label="Date of birth" name="date_of_birth" type="date" />
        <FormField label="Gender" name="gender" />
        <FormField label="Guardian name" name="guardian_name" />
        <FormField label="Guardian relationship" name="guardian_relationship" />
        <FormField label="Guardian email" name="guardian_email" type="email" />
        <FormField label="Guardian mobile" name="guardian_mobile" type="tel" />
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
          {pending ? "Adding…" : "Add student"}
        </button>
      </div>
    </form>
  );
}
