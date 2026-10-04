"use client";

import { useId, useState } from "react";

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M17.9 17.9A10.6 10.6 0 0 1 12 20c-7 0-11-8-11-8a19 19 0 0 1 4.6-5.9m4.1-2A9.5 9.5 0 0 1 12 4c7 0 11 8 11 8a19 19 0 0 1-2.4 3.5M14.1 14.1a3 3 0 1 1-4.2-4.2" />
      <path d="M1 1l22 22" />
    </svg>
  );
}

/** A password field with a show/hide toggle, sharing the exact input
 * styling every plain text field in the app already uses (FormField.tsx
 * and LoginForm.tsx both render this in place of a raw
 * `<input type="password">`) — just with room on the right for the toggle
 * button. Reusable across login, registration and change-password forms
 * without each one reimplementing its own visibility state. */
export function PasswordInput({
  name,
  required = false,
  defaultValue,
  autoComplete = "current-password",
  minLength,
}: {
  name: string;
  required?: boolean;
  defaultValue?: string;
  /** "current-password" for a login form, "new-password" for
   * registration/change-password — lets the browser tell the two apart
   * instead of offering to autofill a saved password into a signup form. */
  autoComplete?: "current-password" | "new-password";
  minLength?: number;
}) {
  const [visible, setVisible] = useState(false);
  const id = useId();

  return (
    <div className="relative mt-1">
      <input
        id={id}
        type={visible ? "text" : "password"}
        name={name}
        required={required}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        minLength={minLength}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 pr-10 text-sm text-foreground outline-none focus:border-accent"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-controls={id}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 grid w-10 place-items-center text-muted transition-colors hover:text-foreground focus-visible:text-accent-strong focus-visible:outline-none"
      >
        {visible ? <EyeOffIcon className="size-4.5" /> : <EyeIcon className="size-4.5" />}
      </button>
    </div>
  );
}
