"use client";

import { useActionState } from "react";
import { signUpNominator, type ActionState } from "@/domain/auth/actions";
import { FormField } from "@/ui/components/FormField";
import { StepForm } from "@/ui/components/StepForm";

const initialState: ActionState = { error: null };

export default function NominatorRegisterPage() {
  const [state, formAction, pending] = useActionState(signUpNominator, initialState);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Independent Nominator Registration</h1>
      <p className="mt-1 text-sm text-muted">
        For Idea of the Year, Story of the Year and Young Changemaker submissions with no school involved.
      </p>

      <StepForm
        action={formAction}
        pending={pending}
        error={state.error}
        submitLabel="Create nominator account"
        pendingLabel="Creating account…"
        steps={[
          {
            title: "Account",
            description: "Your login for submitting and tracking nominations.",
            content: (
              <>
                <FormField label="Full name" name="full_name" required />
                <FormField label="Email" name="email" type="email" required />
                <FormField label="Password" name="password" type="password" required />
              </>
            ),
          },
          {
            title: "Consent",
            description: "One last step before your account is created.",
            content: (
              <label className="flex items-start gap-2 text-sm text-muted">
                <input type="checkbox" required className="mt-0.5" />
                I accept the award category rules and the site&apos;s privacy and data-consent terms.
              </label>
            ),
          },
        ]}
      />
    </div>
  );
}
