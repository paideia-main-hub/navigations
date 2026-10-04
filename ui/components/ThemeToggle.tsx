"use client";

import { THEME_TOGGLE_ENABLED } from "@/ui/theme/config";

function toggle() {
  const next = !document.documentElement.classList.contains("dark");
  document.documentElement.classList.toggle("dark", next);
  try {
    localStorage.setItem("theme", next ? "dark" : "light");
  } catch {
    // localStorage can throw in private/locked-down browsers — theme just won't persist.
  }
}

// Both icons are always in the DOM; which one is visible is driven purely by
// the `dark` class on <html> via Tailwind's dark: variant (see globals.css).
// That avoids tracking "is dark mode on" in React state, which would only
// know the real answer after mount and cause a hydration mismatch.
export function ThemeToggle() {
  // Hidden everywhere (header, dashboard and admin sidebars) while the dark
  // theme is being fixed — see ui/theme/config.ts.
  if (!THEME_TOGGLE_ENABLED) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-surface-muted"
    >
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor" className="hidden h-4.5 w-4.5 dark:block">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3v1.5M12 19.5V21M4.93 4.93l1.06 1.06M17.99 17.99l1.06 1.06M3 12h1.5M19.5 12H21M4.93 19.07l1.06-1.06M17.99 6.01l1.06-1.06M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z"
        />
      </svg>
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor" className="h-4.5 w-4.5 dark:hidden">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 12.79A9 9 0 1 1 11.21 3 7.5 7.5 0 0 0 21 12.79Z"
        />
      </svg>
    </button>
  );
}
