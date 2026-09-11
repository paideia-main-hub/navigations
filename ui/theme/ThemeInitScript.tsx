import Script from "next/script";

// Runs before hydration so the correct theme class is present on <html>
// before first paint — otherwise the page would flash the wrong theme.
const THEME_INIT = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var theme = stored || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.classList.toggle("dark", theme === "dark");
  } catch (e) {}
})();
`;

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
