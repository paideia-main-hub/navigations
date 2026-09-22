"use client";

import { useActionState } from "react";
import { signUpStudent, type ActionState } from "@/domain/auth/actions";
import { FormField } from "@/ui/components/FormField";

const initialState: ActionState = { error: null };

export default function StudentRegisterPage() {
  const [state, formAction, pending] = useActionState(signUpStudent, initialState);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Student Registration</h1>
      <p className="mt-1 text-sm text-muted">
        Create your account, then select a competition from the directory to register.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <p className="text-xs font-semibold tracking-wide text-muted uppercase">Account</p>
        <FormField label="Full name" name="full_name" required />
        <FormField label="Email" name="email" type="email" required />
        <FormField label="Password" name="password" type="password" required />

        <p className="pt-2 text-xs font-semibold tracking-wide text-muted uppercase">Student identity</p>
        <FormField label="Date of birth" name="date_of_birth" type="date" />
        <FormField label="Gender" name="gender" />
        <div>
          <label className="text-sm font-medium text-foreground">Profile photo</label>
          <input
            type="file"
            name="photo"
            accept="image/*"
            className="mt-1 block w-full text-sm text-foreground file:mr-3 file:rounded-full file:border-0 file:bg-accent-soft file:px-4 file:py-2 file:text-sm file:font-semibold file:text-accent-strong hover:file:bg-accent-soft/80"
          />
          <p className="mt-1 text-xs text-muted">
            Used on your certificate and, if you&apos;re a winner, on the public results page — one upload now saves
            you from being asked for it again later.
          </p>
        </div>

        <p className="pt-2 text-xs font-semibold tracking-wide text-muted uppercase">Academic</p>
        <FormField label="School name" name="school_name" />
        <FormField label="Grade / class" name="grade" />

        <p className="pt-2 text-xs font-semibold tracking-wide text-muted uppercase">Parent / Guardian</p>
        <FormField label="Guardian name" name="guardian_name" />
        <FormField label="Relationship" name="guardian_relationship" />
        <FormField label="Guardian email" name="guardian_email" type="email" />
        <FormField label="Guardian mobile" name="guardian_mobile" type="tel" />

        <p className="pt-2 text-xs font-semibold tracking-wide text-muted uppercase">Consent</p>
        <label className="flex items-start gap-2 text-sm text-muted">
          <input type="checkbox" required className="mt-0.5" />
          I accept the competition rules and the site&apos;s privacy and data-consent terms.
        </label>

        {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Creating account…" : "Create student account"}
        </button>
      </form>
    </div>
  );
}
