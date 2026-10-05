"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Homepage hero option 1 (current / preserved).
 * The five photographs stay in front of a dim chart reel.
 * The brush line "Where opportunities lead." sits in the open centre.
 *
 * Collage + script are preloaded/prioritized and revealed together so the
 * script never pops in after the photos.
 *
 * Exported as HeroOne for side-by-side comparison with HeroTwo.
 */

const COLLAGE_W = 1024;
const COLLAGE_H = 768;
const SCRIPT_W = 1600;
const SCRIPT_H = 1169;

const COLLAGE_SRC = "/hero-collage.png?v=3";
const SCRIPT_SRC = "/hero-script.png?v=4";

type Frame = { left: number; top: number; width: number; height: number };

function computeFrame(img: HTMLImageElement, wrap: HTMLElement): Frame | null {
  const ir = img.getBoundingClientRect();
  const wr = wrap.getBoundingClientRect();
  if (ir.width < 2 || ir.height < 2) return null;
  const scale = Math.min(ir.width / COLLAGE_W, ir.height / COLLAGE_H);
  const width = COLLAGE_W * scale;
  const height = COLLAGE_H * scale;
  return {
    left: ir.left - wr.left + (ir.width - width) / 2,
    top: ir.top - wr.top + (ir.height - height) / 2,
    width,
    height,
  };
}

export function HeroCollage() {
  return <HeroOne />;
}

export function HeroOne() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLImageElement>(null);
  const [frame, setFrame] = useState<Frame | null>(null);
  const [collageReady, setCollageReady] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const measure = () => {
      const img = photoRef.current;
      const wrap = wrapRef.current;
      if (!img || !wrap) return;
      const next = computeFrame(img, wrap);
      if (next) setFrame(next);
    };

    measure();
    const observer = new ResizeObserver(measure);
    if (wrapRef.current) observer.observe(wrapRef.current);
    if (photoRef.current) observer.observe(photoRef.current);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Warm both LCP images immediately at equal high priority.
  useEffect(() => {
    const collage = new Image();
    const script = new Image();
    collage.setAttribute("fetchpriority", "high");
    script.setAttribute("fetchpriority", "high");
    collage.src = COLLAGE_SRC;
    script.src = SCRIPT_SRC;
    if (collage.complete) setCollageReady(true);
    else collage.onload = () => setCollageReady(true);
    if (script.complete) setScriptReady(true);
    else script.onload = () => setScriptReady(true);
  }, []);

  // Let the charts video start after the LCP images have claimed bandwidth.
  useEffect(() => {
    if (!collageReady || !scriptReady) return;
    const id = window.setTimeout(() => setVideoReady(true), 120);
    return () => window.clearTimeout(id);
  }, [collageReady, scriptReady]);

  const scriptStyle = frame
    ? {
        left: frame.left + frame.width * 0.24,
        top: frame.top + frame.height * 0.229,
        width: frame.width * 0.52,
        height: frame.width * 0.52 * (SCRIPT_H / SCRIPT_W),
      }
    : undefined;

  const foregroundReady = collageReady && scriptReady && Boolean(frame);

  return (
    <div className="absolute inset-0 bg-[#fefffa]">
      {videoReady ? (
        <>
          <video
            className="hero-graph-video pointer-events-none absolute inset-0 h-full w-full origin-center scale-110 object-cover opacity-40"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            src="/hero-graphs.mp4?v=2"
            poster="/hero-graphs-still.jpg?v=2"
          />
          {/* Shown only under prefers-reduced-motion (see globals.css). */}
          <img
            src="/hero-graphs-still.jpg?v=2"
            alt=""
            className="hero-graph-still pointer-events-none absolute inset-0 h-full w-full origin-center scale-110 object-cover opacity-40"
          />
        </>
      ) : (
        <img
          src="/hero-graphs-still.jpg?v=2"
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full origin-center scale-110 object-cover opacity-40"
        />
      )}

      <div
        ref={wrapRef}
        className="absolute inset-0 flex items-center justify-center px-4 pt-28 pb-6 sm:px-10 sm:pt-32 sm:pb-10"
      >
        <img
          ref={photoRef}
          src={COLLAGE_SRC}
          alt="Five students — building, painting, presenting, and playing — joined by dotted lines, with the centre left open."
          width={COLLAGE_W}
          height={COLLAGE_H}
          fetchPriority="high"
          decoding="async"
          className="h-full max-h-full w-full object-contain transition-opacity duration-300 ease-out"
          style={{ opacity: foregroundReady ? 1 : 0 }}
          onLoad={() => setCollageReady(true)}
        />
        <img
          src={SCRIPT_SRC}
          alt="Where opportunities lead."
          width={SCRIPT_W}
          height={SCRIPT_H}
          fetchPriority="high"
          decoding="async"
          className="pointer-events-none absolute z-10 object-contain transition-opacity duration-300 ease-out"
          style={{
            ...(scriptStyle ?? { left: 0, top: 0, width: 0, height: 0 }),
            opacity: foregroundReady ? 1 : 0,
            visibility: scriptStyle ? "visible" : "hidden",
          }}
          onLoad={() => setScriptReady(true)}
        />
      </div>
    </div>
  );
}
