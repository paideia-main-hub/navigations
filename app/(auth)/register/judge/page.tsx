"use client";

import { useActionState } from "react";
import { signUpJudge, type ActionState } from "@/domain/auth/actions";
import { FormField } from "@/ui/components/FormField";
import { StepForm } from "@/ui/components/StepForm";

const initialState: ActionState = { error: null };

export default function JudgeRegisterPage() {
  const [state, formAction, pending] = useActionState(signUpJudge, initialState);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Judge Registration</h1>
      <p className="mt-1 text-sm text-muted">
        Create your account, then apply to judge specific competitions from your dashboard. Each application is reviewed
        by an administrator, who will schedule a short interview before granting access.
      </p>

      <StepForm
        action={formAction}
        pending={pending}
        error={state.error}
        submitLabel="Create judge account"
        pendingLabel="Creating account…"
        steps={[
          {
            title: "Account",
            description: "Your login for the judge dashboard.",
            content: (
              <>
                <FormField label="Full name" name="full_name" required />
                <FormField label="Email" name="email" type="email" required />
                <FormField label="Password" name="password" type="password" required />
              </>
            ),
          },
          {
            title: "Experience",
            description: "Helps the admin team match you to competitions.",
            content: (
              <div>
                <label className="text-sm font-medium text-foreground">Bio / relevant experience</label>
                <textarea
                  name="bio"
                  rows={5}
                  placeholder="Subject expertise, prior judging experience, professional background…"
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                />
              </div>
            ),
          },
          {
            title: "Consent",
            description: "One last step before your account is created.",
            content: (
              <label className="flex items-start gap-2 text-sm text-muted">
                <input type="checkbox" required className="mt-0.5" />
                I accept the judging code of conduct and the site&apos;s privacy and data-consent terms.
              </label>
            ),
          },
        ]}
      />
    </div>
  );
}
