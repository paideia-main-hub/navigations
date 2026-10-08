"use client";

import { useActionState } from "react";
import { signUpStudent, type ActionState } from "@/domain/auth/actions";
import { FormField } from "@/ui/components/FormField";
import { RequiredMark } from "@/ui/components/RequiredMark";
import { SelectField } from "@/ui/components/SelectField";
import { StepForm } from "@/ui/components/StepForm";

const initialState: ActionState = { error: null };
const phonePattern = "^[+]?[0-9\\s()\\-]{7,20}$";
const today = new Date().toISOString().slice(0, 10);

export function StudentRegisterForm({ hideIntro = false }: { hideIntro?: boolean } = {}) {
  const [state, formAction, pending] = useActionState(signUpStudent, initialState);

  return (
    <div>
      {!hideIntro ? (
        <>
          <h2 className="text-2xl font-bold text-foreground">Student Registration</h2>
          <p className="mt-1 text-sm text-muted">
            Create your account, then select a competition from the directory to register.
          </p>
        </>
      ) : null}

      <StepForm
        action={formAction}
        pending={pending}
        error={state.error}
        submitLabel="Create student account"
        pendingLabel="Creating account…"
        steps={[
          {
            title: "Account",
            description: "Your login for the student dashboard.",
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
            title: "About you",
            description: "Your League ID is created from this profile.",
            content: (
              <>
                <FormField label="Date of birth" name="date_of_birth" type="date" required max={today} />
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Gender
                    <RequiredMark />
                  </label>
                  <SelectField
                    name="gender"
                    label="Gender"
                    required
                    placeholder="Select gender"
                    className="mt-1"
                    options={[
                      { value: "female", label: "Female" },
                      { value: "male", label: "Male" },
                      { value: "other", label: "Other" },
                      { value: "prefer_not_to_say", label: "Prefer not to say" },
                    ]}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Profile photo
                    <RequiredMark />
                  </label>
                  <input
                    type="file"
                    name="photo"
                    accept="image/jpeg,image/png,image/webp"
                    required
                    className="mt-1 block w-full text-sm text-foreground file:mr-3 file:rounded-full file:border-0 file:bg-accent-soft file:px-4 file:py-2 file:text-sm file:font-semibold file:text-accent-strong hover:file:bg-accent-soft/80"
                  />
                  <p className="mt-1 text-xs text-muted">
                    Used on your certificate and, if you&apos;re a winner, on the public results page — JPEG, PNG or
                    WebP.
                  </p>
                </div>
              </>
            ),
          },
          {
            title: "School",
            description: "Your grade decides which category you compete in.",
            content: (
              <>
                <FormField label="School name" name="school_name" required minLength={2} />
                <FormField label="Grade / class" name="grade" required minLength={1} />
              </>
            ),
          },
          {
            title: "Parent / Guardian",
            description: "Who the League contacts about your participation.",
            content: (
              <>
                <FormField label="Parent / Guardian name" name="guardian_name" required minLength={2} autoComplete="name" />
                <FormField label="Relationship" name="guardian_relationship" required minLength={2} />
                <FormField
                  label="Parent / Guardian email"
                  name="guardian_email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                />
                <FormField
                  label="Parent / Guardian mobile"
                  name="guardian_mobile"
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
            title: "Consent",
            description: "One last step before your account is created.",
            content: (
              <label className="flex items-start gap-2 text-sm text-muted">
                <input type="checkbox" required className="mt-0.5" />
                <span>
                  I accept the competition rules and the site&apos;s privacy and data-consent terms.
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
