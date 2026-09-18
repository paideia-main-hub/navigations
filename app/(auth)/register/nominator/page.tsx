"use client";

import { useActionState } from "react";
import { signUpNominator, type ActionState } from "@/domain/auth/actions";
import { FormField } from "@/ui/components/FormField";

const initialState: ActionState = { error: null };

export default function NominatorRegisterPage() {
  const [state, formAction, pending] = useActionState(signUpNominator, initialState);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Independent Nominator Registration</h1>
      <p className="mt-1 text-sm text-muted">
        For Idea of the Year, Story of the Year and Young Changemaker submissions with no school involved.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <FormField label="Full name" name="full_name" required />
        <FormField label="Email" name="email" type="email" required />
        <FormField label="Password" name="password" type="password" required />

        <label className="flex items-start gap-2 text-sm text-muted">
          <input type="checkbox" required className="mt-0.5" />
          I accept the award category rules and the site&apos;s privacy and data-consent terms.
        </label>

        {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Creating account…" : "Create nominator account"}
        </button>
      </form>
    </div>
  );
}
