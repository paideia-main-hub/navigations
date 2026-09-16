"use client";

import { useActionState } from "react";
import { createAdminAction, type ActionState } from "@/domain/admins/actions";
import { FormField } from "@/ui/components/FormField";

const initialState: ActionState = { error: null };

export function CreateAdminForm() {
  const [state, formAction, pending] = useActionState(createAdminAction, initialState);

  return (
    <form action={formAction} className="max-w-md space-y-4 rounded-xl border border-border bg-surface p-4">
      <h2 className="font-semibold text-foreground">Add an admin</h2>
      <FormField label="Full name" name="full_name" required />
      <FormField label="Email" name="email" type="email" required />
      <FormField label="Temporary password" name="password" type="password" required />
      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      {state.success && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          Admin created. Share the password with them directly — they can change it from Account once signed in.
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Creating…" : "Create admin"}
      </button>
    </form>
  );
}
