"use client";

import { useActionState, useOptimistic, startTransition } from "react";
import { toggleHideDownloadManualsAction, type ToggleManualsState } from "@/domain/settings/actions";
import type { SiteSettings } from "@/domain/settings/types";

export function SiteSettingsPanel({ initialSettings }: { initialSettings: SiteSettings }) {
  const [state, formAction, pending] = useActionState(toggleHideDownloadManualsAction, {
    error: null,
    saved: false,
    hideDownloadManuals: initialSettings.hideDownloadManuals,
  });

  const [optimisticHide, setOptimisticHide] = useOptimistic(
    state.hideDownloadManuals,
    (_current, next: boolean) => next,
  );

  const handleToggle = (nextValue: boolean) => {
    startTransition(async () => {
      setOptimisticHide(nextValue);
      const fd = new FormData();
      fd.set("hide_download_manuals", nextValue ? "true" : "false");
      await formAction(fd);
    });
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-foreground">Site Feature Controls</h2>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                optimisticHide
                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                  : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
              }`}
            >
              {optimisticHide ? "Manuals Hidden" : "Manuals Visible"}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted">
            Global controls that change the behavior and availability of content on public-facing pages.
          </p>
        </div>
      </div>

      <div className="mt-6 border-t border-border/70 pt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border/80 bg-background/50 p-4 sm:p-5">
          <div className="space-y-1 pr-4">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-foreground">Hide Download Manuals</span>
            </div>
            <p className="text-xs leading-relaxed text-muted sm:text-sm">
              When toggled ON, the manual download buttons across{" "}
              <code className="rounded bg-surface-muted px-1.5 py-0.5 text-xs text-foreground">/manuals</code> and{" "}
              <code className="rounded bg-surface-muted px-1.5 py-0.5 text-xs text-foreground">/competitions/[slug]</code>{" "}
              are hidden, and a placeholder message informs visitors that downloadable content will be available soon.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              role="switch"
              aria-checked={optimisticHide}
              disabled={pending}
              onClick={() => handleToggle(!optimisticHide)}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                optimisticHide ? "bg-accent" : "bg-neutral-300 dark:bg-neutral-700"
              }`}
            >
              <span className="sr-only">Toggle Hide Download Manuals</span>
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  optimisticHide ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span className="text-xs font-medium text-foreground w-12">
              {pending ? "Saving…" : optimisticHide ? "ON" : "OFF"}
            </span>
          </div>
        </div>

        {state.error ? (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-600 dark:text-red-400 sm:text-sm">
            <p className="font-semibold">Unable to save setting:</p>
            <p className="mt-1">{state.error}</p>
          </div>
        ) : null}

        {state.saved && !state.error ? (
          <div className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400 sm:text-sm">
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              Settings updated. Changes are immediately reflected on public pages.
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
