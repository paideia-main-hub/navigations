"use client";

import { useActionState } from "react";
import { requestPasswordReset, type ActionState } from "@/domain/auth/actions";
import { FormField } from "@/ui/components/FormField";

const initialState: ActionState = { error: null };

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    async (prevState: ActionState & { sent?: boolean }, formData: FormData) => {
      const result = await requestPasswordReset(prevState, formData);
      return { ...result, sent: !result.error };
    },
    { ...initialState, sent: false },
  );

  if (state.sent) {
    return (
      <p className="text-sm text-foreground">
        If an account exists for that email, we&apos;ve sent a link to reset your password. Check your inbox (and
        spam folder) — the link expires after a while, so use it soon.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <FormField label="Email" name="email" type="email" required />
      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
