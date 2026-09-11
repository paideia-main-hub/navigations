"use client";

import { useActionState } from "react";
import { signUpSchool, type ActionState } from "@/lib/actions/auth";

const initialState: ActionState = { error: null };

function Field({
  label,
  name,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</label>
      <input
        type={type}
        name={name}
        required={required}
        className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500 dark:border-white/15 dark:bg-zinc-950"
      />
    </div>
  );
}

export default function SchoolRegisterPage() {
  const [state, formAction, pending] = useActionState(signUpSchool, initialState);

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">School Registration</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Register your school, then add students and teams from your school dashboard.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <p className="text-xs font-semibold tracking-wide text-zinc-400 uppercase">School identity</p>
        <Field label="Official school name" name="school_name" required />
        <Field label="School type" name="school_type" />
        <Field label="City" name="city" />
        <Field label="Country" name="country" />

        <p className="pt-2 text-xs font-semibold tracking-wide text-zinc-400 uppercase">School profile</p>
        <Field label="Principal / head name" name="principal_name" />
        <Field label="School phone" name="school_phone" type="tel" />
        <Field label="Website" name="website" type="url" />

        <p className="pt-2 text-xs font-semibold tracking-wide text-zinc-400 uppercase">Coordinator account</p>
        <Field label="Coordinator name" name="coordinator_name" required />
        <Field label="Designation" name="designation" />
        <Field label="Mobile / WhatsApp" name="mobile" type="tel" />
        <Field label="Login email" name="email" type="email" required />
        <Field label="Password" name="password" type="password" required />

        <label className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <input type="checkbox" required className="mt-0.5" />
          I confirm this information is accurate and accept the competition rules and
          result/media publication consent terms on behalf of the school.
        </label>

        {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {pending ? "Creating school account…" : "Register school"}
        </button>
      </form>
    </div>
  );
}
