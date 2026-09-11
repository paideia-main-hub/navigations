"use client";

import { useActionState } from "react";
import { signUpSchool, type ActionState } from "@/domain/auth/actions";
import { FormField } from "@/ui/components/FormField";

const initialState: ActionState = { error: null };

export default function SchoolRegisterPage() {
  const [state, formAction, pending] = useActionState(signUpSchool, initialState);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">School Registration</h1>
      <p className="mt-1 text-sm text-muted">
        Register your school, then add students and teams from your school dashboard.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <p className="text-xs font-semibold tracking-wide text-muted uppercase">School identity</p>
        <FormField label="Official school name" name="school_name" required />
        <FormField label="School type" name="school_type" />
        <FormField label="City" name="city" />
        <FormField label="Country" name="country" />

        <p className="pt-2 text-xs font-semibold tracking-wide text-muted uppercase">School profile</p>
        <FormField label="Principal / head name" name="principal_name" />
        <FormField label="School phone" name="school_phone" type="tel" />
        <FormField label="Website" name="website" type="url" />

        <p className="pt-2 text-xs font-semibold tracking-wide text-muted uppercase">Coordinator account</p>
        <FormField label="Coordinator name" name="coordinator_name" required />
        <FormField label="Designation" name="designation" />
        <FormField label="Mobile / WhatsApp" name="mobile" type="tel" />
        <FormField label="Login email" name="email" type="email" required />
        <FormField label="Password" name="password" type="password" required />

        <label className="flex items-start gap-2 text-sm text-muted">
          <input type="checkbox" required className="mt-0.5" />
          I confirm this information is accurate and accept the competition rules and
          result/media publication consent terms on behalf of the school.
        </label>

        {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Creating school account…" : "Register school"}
        </button>
      </form>
    </div>
  );
}
