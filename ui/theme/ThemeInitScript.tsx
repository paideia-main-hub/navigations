"use client";

import { useSyncExternalStore } from "react";
import { THEME_TOGGLE_ENABLED } from "./config";

// Runs before hydration so the correct theme class is present on <html>
// before first paint — otherwise the page would flash the wrong theme.
// While the theme toggle is disabled (ui/theme/config.ts), it always applies
// the light theme; the visitor's saved choice is left in storage untouched,
// so it takes effect again once the toggle is re-enabled.
const THEME_INIT = THEME_TOGGLE_ENABLED
  ? `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var theme = stored || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.classList.toggle("dark", theme === "dark");
  } catch (e) {}
})();
`
  : `document.documentElement.classList.remove("dark");`;

const emptySubscribe = () => () => {};

/** Inline theme boot script. Emitted only during SSR/hydration — React 19
 * warns if a <script> is created again on later client renders, and those
 * re-created tags would never execute anyway. */
export function ThemeInitScript() {
  const renderScript = useSyncExternalStore(emptySubscribe, () => false, () => true);
  if (!renderScript) return null;

  return (
    <script
      id="theme-init"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: THEME_INIT }}
    />
  );
}
