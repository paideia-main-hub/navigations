"use client";

/**
 * Hero option 2 — three image layers:
 * 1) ceremony photo (split L/R, full height)
 * 2) B&W circular collage from Hero One
 * 3) brand brush script on top
 */

const BG_SRC = "/hero-two-bg.webp?v=7";
const COLLAGE_SRC = "/hero-collage.webp?v=6";
const COLLAGE_MOBILE_SRC = "/hero-collage-mobile.webp?v=7";
const SCRIPT_SRC = "/hero-script.webp?v=8";
const COLLAGE_MOBILE_W = 640;
const COLLAGE_MOBILE_H = 1195;
const SCRIPT_W = 640;
const SCRIPT_H = 468;
const IMG_W = 1200;
const IMG_H = 472;
const IMG_ASPECT = IMG_W / IMG_H;
const HALF_ASPECT = IMG_W / 2 / IMG_H;

export function HeroTwo() {
  const fullWidth = `calc(100dvh * ${IMG_ASPECT})`;
  const halfWidth = `calc(100dvh * ${HALF_ASPECT})`;

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#fefffa]">
      {/* Layer 1 — ceremony photo halves (low priority: washed out, not LCP). */}
      <div
        aria-hidden="true"
        className="absolute left-0 top-0 z-0 h-full overflow-hidden"
        style={{
          width: halfWidth,
          WebkitMaskImage:
            "linear-gradient(to right, #000 0%, #000 58%, transparent 100%)",
          maskImage:
            "linear-gradient(to right, #000 0%, #000 58%, transparent 100%)",
        }}
      >
        <img
          src={BG_SRC}
          alt=""
          width={IMG_W}
          height={IMG_H}
          fetchPriority="low"
          decoding="async"
          className="h-full max-w-none"
          style={{ width: fullWidth }}
        />
      </div>

      <div
        aria-hidden="true"
        className="absolute right-0 top-0 z-0 h-full overflow-hidden"
        style={{
          width: halfWidth,
          WebkitMaskImage:
            "linear-gradient(to left, #000 0%, #000 58%, transparent 100%)",
          maskImage:
            "linear-gradient(to left, #000 0%, #000 58%, transparent 100%)",
        }}
      >
        <img
          src={BG_SRC}
          alt=""
          width={IMG_W}
          height={IMG_H}
          fetchPriority="low"
          decoding="async"
          className="absolute right-0 h-full max-w-none"
          style={{ width: fullWidth }}
        />
      </div>

      {/* Soft white wash — dims the ceremony bg (below collage) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[1]"
        style={{ backgroundColor: "rgba(255, 255, 255, 0.88)" }}
      />

      {/* Layer 2 — one collage file only (picture picks mobile vs desktop). */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[2] flex items-center justify-center px-4 pt-28 pb-6 sm:px-10 sm:pt-32 sm:pb-10"
      >
        <picture className="contents">
          <source media="(min-width: 640px)" srcSet={COLLAGE_SRC} type="image/webp" />
          <img
            src={COLLAGE_MOBILE_SRC}
            alt=""
            width={COLLAGE_MOBILE_W}
            height={COLLAGE_MOBILE_H}
            fetchPriority="high"
            decoding="async"
            className="h-full max-h-full w-full object-contain"
          />
        </picture>
      </div>

      {/* Layer 3 — brush script visible immediately (opacity stays 1 for LCP). */}
      <div className="absolute inset-0 z-10 flex items-center justify-center px-6">
        <img
          src={SCRIPT_SRC}
          alt="Where opportunities lead."
          width={SCRIPT_W}
          height={SCRIPT_H}
          fetchPriority="high"
          decoding="async"
          className="relative h-auto w-[min(58vw,20rem)] translate-y-3 object-contain sm:w-[min(56vw,32rem)] sm:translate-y-0"
          style={{
            animation: "hero-script-in 1.05s cubic-bezier(0.22, 1, 0.36, 1) both",
          }}
        />
      </div>
    </div>
  );
}
