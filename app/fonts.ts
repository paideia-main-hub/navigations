import localFont from "next/font/local";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

/** Self-hosted — Hostinger builds cannot reliably fetch Google Fonts. */
export const geistSans = GeistSans;
export const geistMono = GeistMono;

export const plusJakarta = localFont({
  src: [
    { path: "./fonts/plus-jakarta-sans-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/plus-jakarta-sans-latin-700-normal.woff2", weight: "700", style: "normal" },
    { path: "./fonts/plus-jakarta-sans-latin-800-normal.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-plus-jakarta",
  display: "swap",
  adjustFontFallback: true,
  fallback: ["system-ui", "Segoe UI", "Arial", "sans-serif"],
});

export const unbounded = localFont({
  src: [
    { path: "./fonts/unbounded-latin-700-normal.woff2", weight: "700", style: "normal" },
    { path: "./fonts/unbounded-latin-800-normal.woff2", weight: "800", style: "normal" },
  ],
  display: "swap",
});

/** Square / tech numerals for Important Dates (and similar display digits). */
export const orbitron = localFont({
  src: [
    { path: "./fonts/orbitron-latin-700-normal.woff2", weight: "700", style: "normal" },
    { path: "./fonts/orbitron-latin-800-normal.woff2", weight: "800", style: "normal" },
  ],
  display: "swap",
});

/** Quantico only ships 700 for bold; map 800 to the same file for extrabold usage. */
export const quantico = localFont({
  src: [
    { path: "./fonts/quantico-latin-700-normal.woff2", weight: "700", style: "normal" },
    { path: "./fonts/quantico-latin-700-normal.woff2", weight: "800", style: "normal" },
  ],
  display: "swap",
});

export const sourceSerif = localFont({
  src: [
    { path: "./fonts/source-serif-4-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/source-serif-4-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
});
