"use client";

import { useActionState } from "react";
import { signUpSchool, type ActionState } from "@/domain/auth/actions";
import { SCHOOL_TYPES } from "@/domain/schools/types";
import { FormField } from "@/ui/components/FormField";
import { RequiredMark } from "@/ui/components/RequiredMark";
import { SelectField } from "@/ui/components/SelectField";
import { StepForm } from "@/ui/components/StepForm";

const initialState: ActionState = { error: null };
const phonePattern = "^[+]?[0-9\\s()\\-]{7,20}$";

export function SchoolRegisterForm({ hideIntro = false }: { hideIntro?: boolean } = {}) {
  const [state, formAction, pending] = useActionState(signUpSchool, initialState);

  return (
    <div>
      {!hideIntro ? (
        <>
          <h2 className="text-2xl font-bold text-foreground">School Registration</h2>
          <p className="mt-1 text-sm text-muted">
            Register your school, then add students and teams from your school dashboard.
          </p>
        </>
      ) : null}

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
                <FormField label="Official school name" name="school_name" required minLength={2} />
                <div>
                  <label className="text-sm font-medium text-foreground">
                    School type
                    <RequiredMark />
                  </label>
                  <SelectField
                    name="school_type"
                    label="School type"
                    required
                    placeholder="Select school type"
                    className="mt-1"
                    options={SCHOOL_TYPES.map((type) => ({ value: type, label: type }))}
                  />
                </div>
                <FormField label="City" name="city" required minLength={2} autoComplete="address-level2" />
                <FormField label="Country" name="country" required minLength={2} autoComplete="country-name" />
              </>
            ),
          },
          {
            title: "School profile",
            description: "Contact details for the school itself.",
            content: (
              <>
                <FormField label="Principal / head name" name="principal_name" required minLength={2} />
                <FormField
                  label="School phone"
                  name="school_phone"
                  type="tel"
                  required
                  inputMode="tel"
                  autoComplete="tel"
                  pattern={phonePattern}
                  placeholder="+92 21 1234567"
                />
                <FormField
                  label="Website"
                  name="website"
                  type="url"
                  inputMode="url"
                  autoComplete="url"
                  placeholder="https://example.edu"
                />
              </>
            ),
          },
          {
            title: "Coordinator",
            description: "The person who manages registrations for the school.",
            content: (
              <>
                <FormField
                  label="Coordinator name"
                  name="coordinator_name"
                  required
                  minLength={2}
                  autoComplete="name"
                />
                <FormField label="Designation" name="designation" required minLength={2} />
                <FormField
                  label="Mobile / WhatsApp"
                  name="mobile"
                  type="tel"
                  required
                  inputMode="tel"
                  autoComplete="tel"
                  pattern={phonePattern}
                  placeholder="+92 300 1234567"
                />
              </>
            ),
          },
          {
            title: "Login & consent",
            description: "The coordinator signs in with these details.",
            content: (
              <>
                <FormField
                  label="Login email"
                  name="email"
                  type="email"
                  required
                  inputMode="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                />
                <FormField label="Password" name="password" type="password" required minLength={8} />
                <label className="flex items-start gap-2 text-sm text-muted">
                  <input type="checkbox" required className="mt-0.5" />
                  <span>
                    I confirm this information is accurate and accept the competition rules and result/media publication
                    consent terms on behalf of the school.
                    <RequiredMark />
                  </span>
                </label>
              </>
            ),
          },
        ]}
      />
    </div>
  );
}
