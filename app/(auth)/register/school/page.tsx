"use client";

import { useActionState } from "react";
import { signUpSchool, type ActionState } from "@/domain/auth/actions";
import { FormField } from "@/ui/components/FormField";
import { StepForm } from "@/ui/components/StepForm";

const initialState: ActionState = { error: null };

export default function SchoolRegisterPage() {
  const [state, formAction, pending] = useActionState(signUpSchool, initialState);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">School Registration</h1>
      <p className="mt-1 text-sm text-muted">
        Register your school, then add students and teams from your school dashboard.
      </p>

      <StepForm
        action={formAction}
        pending={pending}
        error={state.error}
        submitLabel="Register school"
        pendingLabel="Creating school account…"
        steps={[
          {
            title: "School identity",
            description: "How your school appears across the League.",
            content: (
              <>
                <FormField label="Official school name" name="school_name" required />
                <FormField label="School type" name="school_type" />
                <FormField label="City" name="city" />
                <FormField label="Country" name="country" />
              </>
            ),
          },
          {
            title: "School profile",
            description: "Contact details for the school itself.",
            content: (
              <>
                <FormField label="Principal / head name" name="principal_name" />
                <FormField label="School phone" name="school_phone" type="tel" />
                <FormField label="Website" name="website" type="url" />
              </>
            ),
          },
          {
            title: "Coordinator",
            description: "The person who manages registrations for the school.",
            content: (
              <>
                <FormField label="Coordinator name" name="coordinator_name" required />
                <FormField label="Designation" name="designation" />
                <FormField label="Mobile / WhatsApp" name="mobile" type="tel" />
              </>
            ),
          },
          {
            title: "Login & consent",
            description: "The coordinator signs in with these details.",
            content: (
              <>
                <FormField label="Login email" name="email" type="email" required />
                <FormField label="Password" name="password" type="password" required />
                <label className="flex items-start gap-2 text-sm text-muted">
                  <input type="checkbox" required className="mt-0.5" />
                  I confirm this information is accurate and accept the competition rules and result/media publication
                  consent terms on behalf of the school.
                </label>
              </>
            ),
          },
        ]}
      />
    </div>
  );
}
