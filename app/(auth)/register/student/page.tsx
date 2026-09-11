"use client";

import { useActionState } from "react";
import { signUpStudent, type ActionState } from "@/lib/actions/auth";

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

export default function StudentRegisterPage() {
  const [state, formAction, pending] = useActionState(signUpStudent, initialState);

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Student Registration</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Create your account, then select a competition from the directory to register.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <p className="text-xs font-semibold tracking-wide text-zinc-400 uppercase">Account</p>
        <Field label="Full name" name="full_name" required />
        <Field label="Email" name="email" type="email" required />
        <Field label="Password" name="password" type="password" required />

        <p className="pt-2 text-xs font-semibold tracking-wide text-zinc-400 uppercase">Student identity</p>
        <Field label="Date of birth" name="date_of_birth" type="date" />
        <Field label="Gender" name="gender" />

        <p className="pt-2 text-xs font-semibold tracking-wide text-zinc-400 uppercase">Academic</p>
        <Field label="School name" name="school_name" />
        <Field label="Grade / class" name="grade" />

        <p className="pt-2 text-xs font-semibold tracking-wide text-zinc-400 uppercase">Parent / Guardian</p>
        <Field label="Guardian name" name="guardian_name" />
        <Field label="Relationship" name="guardian_relationship" />
        <Field label="Guardian email" name="guardian_email" type="email" />
        <Field label="Guardian mobile" name="guardian_mobile" type="tel" />

        <p className="pt-2 text-xs font-semibold tracking-wide text-zinc-400 uppercase">Consent</p>
        <label className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <input type="checkbox" required className="mt-0.5" />
          I accept the competition rules and the site&apos;s privacy and data-consent terms.
        </label>

        {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {pending ? "Creating account…" : "Create student account"}
        </button>
      </form>
    </div>
  );
}
