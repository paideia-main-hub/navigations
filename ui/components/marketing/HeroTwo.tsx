"use client";

import { useEffect, useState } from "react";

/**
 * Hero option 2 — three image layers:
 * 1) ceremony photo (split L/R, full height)
 * 2) B&W circular collage from Hero One
 * 3) brand brush script on top (after blue + centre wash overlays)
 */

const BG_SRC = "/hero-two-bg.jpg";
const COLLAGE_SRC = "/hero-collage.png?v=3";
const SCRIPT_SRC = "/hero-script.png?v=4";
const COLLAGE_W = 1024;
const COLLAGE_H = 768;
const SCRIPT_W = 1600;
const SCRIPT_H = 1169;
const IMG_W = 1600;
const IMG_H = 629;
const IMG_ASPECT = IMG_W / IMG_H;
const HALF_ASPECT = IMG_W / 2 / IMG_H;

export function HeroTwo() {
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    const script = new Image();
    script.src = SCRIPT_SRC;
    if (script.complete && script.naturalWidth > 0) setScriptReady(true);
    else {
      script.onload = () => setScriptReady(true);
      script.onerror = () => setScriptReady(true);
    }
  }, []);

  const fullWidth = `calc(100dvh * ${IMG_ASPECT})`;
  const halfWidth = `calc(100dvh * ${HALF_ASPECT})`;

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#f7f4ee]">
      {/* Layer 1 — ceremony photo halves */}
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
          fetchPriority="high"
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
          fetchPriority="high"
          decoding="async"
          className="absolute right-0 h-full max-w-none"
          style={{ width: fullWidth }}
        />
      </div>

      {/* Layer 2 — B&W circular collage from the old hero */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[1] flex items-center justify-center px-4 pt-28 pb-6 sm:px-10 sm:pt-32 sm:pb-10"
      >
        <img
          src={COLLAGE_SRC}
          alt=""
          width={COLLAGE_W}
          height={COLLAGE_H}
          fetchPriority="high"
          decoding="async"
          className="h-full max-h-full w-full object-contain"
        />
      </div>

      {/* Overlay — blue wash over both photo layers; under the script */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[2]"
        style={{ backgroundColor: "rgba(31, 32, 65, 0.45)" }}
      />

      {/* Soft centre wash for script readability */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[3] bg-[radial-gradient(ellipse_at_center,rgba(247,244,238,0.88)_0%,rgba(247,244,238,0.4)_28%,transparent_52%)]"
      />

      {/* Layer 3 — brush script */}
      <div className="absolute inset-0 z-10 flex items-center justify-center px-6">
        <img
          src={SCRIPT_SRC}
          alt="Where opportunities lead."
          width={SCRIPT_W}
          height={SCRIPT_H}
          fetchPriority="high"
          decoding="async"
          className="relative h-auto w-[min(88vw,36rem)] object-contain sm:w-[min(70vw,42rem)]"
          style={
            scriptReady
              ? {
                  animation: "hero-script-in 1.05s cubic-bezier(0.22, 1, 0.36, 1) both",
                }
              : { opacity: 0 }
          }
          onLoad={() => setScriptReady(true)}
        />
      </div>
    </div>
  );
}
