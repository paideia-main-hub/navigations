import Script from "next/script";
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

export function ThemeInitScript() {
  // The no-before-interactive-script-outside-document lint rule predates App
  // Router support for this strategy — Next.js's own docs (script.md) say a
  // beforeInteractive Script belongs in the root layout, which is exactly
  // where this is rendered (see app/layout.tsx).
  return (
    // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document
    <Script id="theme-init" strategy="beforeInteractive">
      {THEME_INIT}
    </Script>
  );
}
