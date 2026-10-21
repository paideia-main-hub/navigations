import localFont from "next/font/local";

/**
 * Self-hosted fonts — Hostinger builds cannot reliably fetch Google Fonts.
 *
 * `adjustFontFallback` + matched metric overrides keep fallback glyphs close
 * to the real face so `font-display: swap` does not spike CLS.
 * Geist from `geist/font/*` ships without that; we load the same files here.
 */

export const geistSans = localFont({
  src: "../node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
  adjustFontFallback: "Arial",
  fallback: ["system-ui", "Segoe UI", "Arial", "sans-serif"],
});

export const geistMono = localFont({
  src: "../node_modules/geist/dist/fonts/geist-mono/GeistMono-Variable.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
  adjustFontFallback: "Arial",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
});

export const plusJakarta = localFont({
  src: [
    { path: "./fonts/plus-jakarta-sans-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/plus-jakarta-sans-latin-700-normal.woff2", weight: "700", style: "normal" },
    { path: "./fonts/plus-jakarta-sans-latin-800-normal.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-plus-jakarta",
  display: "swap",
  // localFont only accepts false | "Arial" | "Times New Roman" (not boolean true).
  adjustFontFallback: "Arial",
  fallback: ["system-ui", "Segoe UI", "Arial", "sans-serif"],
});

export const unbounded = localFont({
  src: [
    { path: "./fonts/unbounded-latin-700-normal.woff2", weight: "700", style: "normal" },
    { path: "./fonts/unbounded-latin-800-normal.woff2", weight: "800", style: "normal" },
  ],
  display: "swap",
  adjustFontFallback: "Arial",
});

/** Square / tech numerals for Important Dates (and similar display digits). */
export const orbitron = localFont({
  src: [
    { path: "./fonts/orbitron-latin-700-normal.woff2", weight: "700", style: "normal" },
    { path: "./fonts/orbitron-latin-800-normal.woff2", weight: "800", style: "normal" },
  ],
  display: "swap",
  adjustFontFallback: "Arial",
});

/** Quantico only ships 700 for bold; map 800 to the same file for extrabold usage. */
export const quantico = localFont({
  src: [
    { path: "./fonts/quantico-latin-700-normal.woff2", weight: "700", style: "normal" },
    { path: "./fonts/quantico-latin-700-normal.woff2", weight: "800", style: "normal" },
  ],
  display: "swap",
  adjustFontFallback: "Arial",
});

export const sourceSerif = localFont({
  src: [
    { path: "./fonts/source-serif-4-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/source-serif-4-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
  adjustFontFallback: "Times New Roman",
});
