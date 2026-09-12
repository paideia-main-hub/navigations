"use client";

import { useActionState } from "react";
import { adminLogin, type ActionState } from "@/domain/admin-auth/actions";
import { FormField } from "@/ui/components/FormField";

const initialState: ActionState = { error: null };

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(adminLogin, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <FormField label="Username" name="username" required />
      <FormField label="Password" name="password" type="password" required />
      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
