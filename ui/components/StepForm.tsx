"use client";

import { startTransition, useRef, useState, type ReactNode } from "react";

export interface FormStep {
  title: string;
  /** one line under the step title */
  description?: string;
  content: ReactNode;
}

/** A sign-up form split into categories, one per screen, with Back/Next.
 *
 * Every step stays mounted inside one <form> (inactive steps are only
 * hidden), so whatever was typed or chosen — files included — is kept when
 * moving back and forth, and the whole form still submits to its server
 * action in one go. "Next" validates only the current step's fields using the
 * browser's own required/type checks; pressing Enter on any step but the last
 * advances rather than submitting early.
 *
 * Submission is dispatched by hand rather than through <form action>: React
 * resets a form after its action runs, which on a multi-step form would wipe
 * every step's answers when the server rejects the sign-up (e.g. an email
 * that's already registered). This way the answers stay, and the person can
 * go Back and correct just the field at fault. */
export function StepForm({
  action,
  steps,
  pending,
  error,
  submitLabel,
  pendingLabel,
}: {
  action: (formData: FormData) => void;
  steps: FormStep[];
  pending: boolean;
  error: string | null;
  submitLabel: string;
  pendingLabel: string;
}) {
  const [current, setCurrent] = useState(0);
  const stepRefs = useRef<(HTMLFieldSetElement | null)[]>([]);
  const last = current === steps.length - 1;

  /** Shows the browser's message on the first invalid field of this step. */
  function stepIsValid(index: number): boolean {
    const step = stepRefs.current[index];
    if (!step) return true;
    const fields = Array.from(step.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input, select, textarea"));
    for (const field of fields) {
      if (!field.checkValidity()) {
        field.reportValidity();
        return false;
      }
    }
    return true;
  }

  function goTo(index: number) {
    setCurrent(index);
    // Put focus on the first field of the step for keyboard users.
    requestAnimationFrame(() => {
      stepRefs.current[index]?.querySelector<HTMLElement>("input:not([type=hidden]), select, textarea")?.focus();
    });
  }

  function next() {
    if (stepIsValid(current)) goTo(Math.min(current + 1, steps.length - 1));
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!last) {
          next();
          return;
        }
        // Re-check every step, in case an earlier one was changed after Back.
        for (let i = 0; i < steps.length; i++) {
          if (!stepIsValid(i)) {
            goTo(i);
            requestAnimationFrame(() => stepIsValid(i));
            return;
          }
        }
        const formData = new FormData(e.currentTarget);
        startTransition(() => action(formData));
      }}
      noValidate
      className="mt-6"
    >
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-baseline justify-between gap-3 text-xs">
          <span className="font-semibold text-accent-strong">
            Step {current + 1} of {steps.length}
          </span>
          <span className="text-muted">{steps[current].title}</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-muted">
          <div className="h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${((current + 1) / steps.length) * 100}%` }} />
        </div>
        <ol className="mt-3 flex flex-wrap gap-1.5">
          {steps.map((s, i) => (
            <li key={s.title}>
              <button
                type="button"
                // Earlier steps can be revisited freely; later ones only via Next,
                // so each step is validated before it's left behind.
                onClick={() => i < current && goTo(i)}
                disabled={i > current}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  i === current
                    ? "bg-accent text-accent-foreground"
                    : i < current
                      ? "bg-accent-soft text-accent-strong hover:underline"
                      : "bg-surface-muted text-muted"
                }`}
              >
                {i < current ? "✓ " : `${i + 1}. `}
                {s.title}
              </button>
            </li>
          ))}
        </ol>
      </div>

      {steps.map((step, i) => (
        <fieldset
          key={step.title}
          ref={(el) => {
            stepRefs.current[i] = el;
          }}
          hidden={i !== current}
          className="space-y-4"
        >
          <legend className="mb-4">
            <span className="block text-lg font-bold text-foreground">{step.title}</span>
            {step.description && <span className="mt-0.5 block text-sm text-muted">{step.description}</span>}
          </legend>
          {step.content}
        </fieldset>
      ))}

      {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="mt-6 flex gap-3">
        {current > 0 && (
          <button
            type="button"
            onClick={() => goTo(current - 1)}
            disabled={pending}
            className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:border-accent disabled:opacity-60"
          >
            Back
          </button>
        )}
        {last ? (
          <button
            type="submit"
            disabled={pending}
            className="flex-1 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
          >
            {pending ? pendingLabel : submitLabel}
          </button>
        ) : (
          <button
            type="button"
            onClick={next}
            className="flex-1 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90"
          >
            Next
          </button>
        )}
      </div>
    </form>
  );
}
