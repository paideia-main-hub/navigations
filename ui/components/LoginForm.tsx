"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { login, type ActionState } from "@/domain/auth/actions";

const initialState: ActionState = { error: null };

export function LoginForm() {
  const searchParams = useSearchParams();
  const linkError = searchParams.get("error");
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Log in</h1>
      <p className="mt-1 text-sm text-muted">Students, school coordinators and judges sign in here.</p>

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground">Email</label>
          <input
            type="email"
            name="email"
            required
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Password</label>
          <input
            type="password"
            name="password"
            required
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
          />
        </div>

        {(state.error || linkError) && (
          <p className="text-sm text-red-600 dark:text-red-400">{state.error ?? linkError}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="mt-3 text-center text-sm">
        <Link href="/forgot-password" className="font-semibold text-accent">
          Forgot password?
        </Link>
      </p>

      <p className="mt-3 text-center text-sm text-muted">
        New here? <Link href="/register" className="font-semibold text-accent">Register</Link>
      </p>
    </div>
  );
}
