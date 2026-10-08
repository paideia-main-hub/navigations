"use client";

import { useActionState } from "react";
import { signUpNominator, type ActionState } from "@/domain/auth/actions";
import { FormField } from "@/ui/components/FormField";
import { RequiredMark } from "@/ui/components/RequiredMark";
import { StepForm } from "@/ui/components/StepForm";

const initialState: ActionState = { error: null };

export function NominatorRegisterForm({ hideIntro = false }: { hideIntro?: boolean } = {}) {
  const [state, formAction, pending] = useActionState(signUpNominator, initialState);

  return (
    <div>
      {!hideIntro ? (
        <>
          <h2 className="text-2xl font-bold text-foreground">Independent Nominator Registration</h2>
          <p className="mt-1 text-sm text-muted">
            For Idea of the Year, Story of the Year and Young Changemaker submissions with no school involved.
          </p>
        </>
      ) : null}

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
                <FormField label="Full name" name="full_name" required minLength={2} autoComplete="name" />
                <FormField
                  label="Email"
                  name="email"
                  type="email"
                  required
                  inputMode="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                />
                <FormField label="Password" name="password" type="password" required minLength={8} />
              </>
            ),
          },
          {
            title: "Consent",
            description: "One last step before your account is created.",
            content: (
              <label className="flex items-start gap-2 text-sm text-muted">
                <input type="checkbox" required className="mt-0.5" />
                <span>
                  I accept the award category rules and the site&apos;s privacy and data-consent terms.
                  <RequiredMark />
                </span>
              </label>
            ),
          },
        ]}
      />
    </div>
  );
}
