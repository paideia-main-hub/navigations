import { unbounded as markNumeral } from "@/app/fonts";

/** Dim “05 layer recognition” background mark — same composition as the homepage strip. */
export function LayersRecognitionMark({
  align = "center",
  tone = "light",
  /** Homepage band: pin to the top edge and match the band height. Hero: vertically center. */
  variant = "hero",
}: {
  align?: "center" | "left" | "right";
  /** light = dark ink on light bands; dark = pale ink on brand-deep heroes. */
  tone?: "light" | "dark";
  variant?: "hero" | "band";
}) {
  const ink = tone === "dark" ? "text-white/[0.14]" : "text-foreground/[0.055]";
  const horizontal =
    align === "left"
      ? "left-6 sm:left-10 lg:left-[max(2.5rem,calc((100%-80rem)/2+1.5rem))]"
      : align === "right"
        ? "right-6 sm:right-10 lg:right-[max(2.5rem,calc((100%-80rem)/2+1.5rem))]"
        : "left-1/2 -translate-x-1/2";

  if (variant === "band") {
    return (
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute top-0 z-0 flex h-[clamp(3.5rem,16vw,20rem)] items-center justify-center gap-[0.04em] text-[length:clamp(3.5rem,16vw,20rem)] select-none max-sm:top-6 max-sm:translate-y-4 ${ink} ${horizontal}`}
      >
        <span className={`${markNumeral.className} block shrink-0 leading-none font-extrabold tabular-nums text-[1em]`}>
          05
        </span>
        <span className="leading-none font-black tracking-wide uppercase text-[0.5em]">
          <span className="block">layer</span>
          <span className="block">recognition</span>
        </span>
      </span>
    );
  }

  // Hero: “05” sits above “layer”; stack flush-right when docked right.
  const stackAlign =
    align === "right" ? "items-end text-right" : align === "left" ? "items-start text-left" : "items-center text-center";

  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute top-1/2 z-10 flex -translate-y-1/2 flex-col leading-none text-[length:clamp(3rem,12vw,9rem)] select-none ${stackAlign} ${ink} ${horizontal}`}
    >
      <span
        className={`${markNumeral.className} block font-extrabold tabular-nums tracking-tight text-[0.52em]`}
      >
        05
      </span>
      <span className="-mt-[0.02em] font-black tracking-wide uppercase text-[0.5em]">
        <span className="block">layer</span>
        <span className="block">recognition</span>
      </span>
    </span>
  );
}
