"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { login, type ActionState } from "@/domain/auth/actions";
import { PasswordInput } from "@/ui/components/PasswordInput";

const initialState: ActionState = { error: null };

export function LoginForm({
  hideIntro = false,
  onRegisterClick,
  onForgotPasswordClick,
}: {
  hideIntro?: boolean;
  /** Called before navigating to register (e.g. close a modal). */
  onRegisterClick?: () => void;
  /** When set, forgot-password stays in the current surface instead of navigating. */
  onForgotPasswordClick?: () => void;
} = {}) {
  const searchParams = useSearchParams();
  const linkError = searchParams.get("error");
  const next = searchParams.get("next");
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div>
      {!hideIntro ? (
        <>
          <h1 className="text-2xl font-bold text-foreground">Log in</h1>
          <p className="mt-1 text-sm text-muted">Students, school coordinators and judges sign in here.</p>
        </>
      ) : null}

      <form action={formAction} className={hideIntro ? "space-y-4" : "mt-6 space-y-4"}>
        {next ? <input type="hidden" name="next" value={next} /> : null}
        <div>
          <label className="text-sm font-medium text-foreground">Email</label>
          <input
            type="email"
            name="email"
            required
            inputMode="email"
            autoComplete="email"
            placeholder="name@example.com"
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Password</label>
          <PasswordInput name="password" required autoComplete="current-password" minLength={8} />
        </div>

        {(state.error || linkError) && (
          <p className="text-sm text-red-600 dark:text-red-400">{state.error ?? linkError}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full cursor-pointer rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="mt-3 text-center text-sm">
        {onForgotPasswordClick ? (
          <button
            type="button"
            onClick={onForgotPasswordClick}
            className="cursor-pointer font-semibold text-accent transition-colors hover:text-accent-strong"
          >
            Forgot password?
          </button>
        ) : (
          <Link href="/forgot-password" className="font-semibold text-accent hover:text-accent-strong">
            Forgot password?
          </Link>
        )}
      </p>

      <p className="mt-3 text-center text-sm text-muted">
        Doesn&apos;t have an account?{" "}
        <Link
          href="/register"
          onClick={onRegisterClick}
          className="font-semibold text-accent hover:text-accent-strong"
        >
          Register
        </Link>
      </p>
    </div>
  );
}
