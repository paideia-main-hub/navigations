"use client";

import { useActionState } from "react";
import { signUpJudge, type ActionState } from "@/domain/auth/actions";
import { FormField } from "@/ui/components/FormField";

const initialState: ActionState = { error: null };

export default function JudgeRegisterPage() {
  const [state, formAction, pending] = useActionState(signUpJudge, initialState);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Judge Registration</h1>
      <p className="mt-1 text-sm text-muted">
        Create your account, then apply to judge specific competitions from your dashboard. Each
        application is reviewed by an administrator, who will schedule a short interview before
        granting access.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <p className="text-xs font-semibold tracking-wide text-muted uppercase">Account</p>
        <FormField label="Full name" name="full_name" required />
        <FormField label="Email" name="email" type="email" required />
        <FormField label="Password" name="password" type="password" required />

        <p className="pt-2 text-xs font-semibold tracking-wide text-muted uppercase">Experience</p>
        <div>
          <label className="text-sm font-medium text-foreground">Bio / relevant experience</label>
          <textarea
            name="bio"
            rows={4}
            placeholder="Subject expertise, prior judging experience, professional background…"
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
          />
        </div>

        <p className="pt-2 text-xs font-semibold tracking-wide text-muted uppercase">Consent</p>
        <label className="flex items-start gap-2 text-sm text-muted">
          <input type="checkbox" required className="mt-0.5" />
          I accept the judging code of conduct and the site&apos;s privacy and data-consent terms.
        </label>

        {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Creating account…" : "Create judge account"}
        </button>
      </form>
    </div>
  );
}
