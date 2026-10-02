"use client";

import { useActionState } from "react";
import { updatePassword, type ActionState } from "@/domain/auth/actions";
import { adminUpdatePassword } from "@/domain/admin-auth/actions";
import { FormField } from "@/ui/components/FormField";

const initialState: ActionState & { success?: boolean } = { error: null };

/** `scope="admin"` changes the admin panel account's password (its own
 * session — see domain/admin-auth); the default changes the dashboard
 * account's password. */
export function ChangePasswordForm({ submitLabel = "Update password", scope = "dashboard" }: { submitLabel?: string; scope?: "dashboard" | "admin" }) {
  const [state, formAction, pending] = useActionState(scope === "admin" ? adminUpdatePassword : updatePassword, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <FormField label="New password" name="password" type="password" required />
      <FormField label="Confirm new password" name="confirm_password" type="password" required />
      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      {(state as { success?: boolean }).success ? <p className="text-sm text-emerald-600 dark:text-emerald-400">Password updated.</p> : null}
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
