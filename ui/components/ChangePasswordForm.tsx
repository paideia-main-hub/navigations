"use client";

import { useActionState } from "react";
import { updatePassword, type ActionState } from "@/domain/auth/actions";
import { FormField } from "@/ui/components/FormField";

const initialState: ActionState = { error: null };

export function ChangePasswordForm({ submitLabel = "Update password" }: { submitLabel?: string }) {
  const [state, formAction, pending] = useActionState(updatePassword, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <FormField label="New password" name="password" type="password" required />
      <FormField label="Confirm new password" name="confirm_password" type="password" required />
      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
