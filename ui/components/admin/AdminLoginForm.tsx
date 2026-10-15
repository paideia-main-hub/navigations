"use client";

import { useActionState } from "react";
import Link from "next/link";
import { adminLogin, type ActionState } from "@/domain/admin-auth/actions";
import { FormField } from "@/ui/components/FormField";

const initialState: ActionState = { error: null };

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(adminLogin, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <FormField label="Email" name="email" type="email" required />
      <FormField label="Password" name="password" type="password" required autoComplete="current-password" />
      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-colors duration-300 hover:bg-accent-strong hover:text-white disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-center text-sm text-muted">
        <Link href="/forgot-password" className="font-semibold text-accent">
          Forgot password?
        </Link>
      </p>
    </form>
  );
}
