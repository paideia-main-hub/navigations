"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Homepage hero. The five photographs stay in front of a dim chart reel.
 * The brush line "Where opportunities lead." sits in the open centre.
 */

const SCRIPT_W = 631;
const SCRIPT_H = 421;

type Frame = { left: number; top: number; width: number; height: number };

export function HeroCollage() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLImageElement>(null);
  const [frame, setFrame] = useState<Frame | null>(null);

  useEffect(() => {
    const measure = () => {
      const img = photoRef.current;
      const wrap = wrapRef.current;
      if (!img || !wrap || !img.naturalWidth) return;
      const ir = img.getBoundingClientRect();
      const wr = wrap.getBoundingClientRect();
      const scale = Math.min(ir.width / img.naturalWidth, ir.height / img.naturalHeight);
      const width = img.naturalWidth * scale;
      const height = img.naturalHeight * scale;
      setFrame({
        left: ir.left - wr.left + (ir.width - width) / 2,
        top: ir.top - wr.top + (ir.height - height) / 2,
        width,
        height,
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (wrapRef.current) observer.observe(wrapRef.current);
    photoRef.current?.addEventListener("load", measure);
    return () => observer.disconnect();
  }, []);

  const scriptStyle = frame
    ? {
        left: frame.left + frame.width * 0.24,
        top: frame.top + frame.height * 0.229,
        width: frame.width * 0.52,
        height: frame.width * 0.52 * (SCRIPT_H / SCRIPT_W),
      }
    : undefined;

  return (
    <div className="absolute inset-0 bg-[#fefffa]">
      <video
        className="hero-graph-video pointer-events-none absolute top-1/2 left-0 h-auto w-full -translate-y-1/2 opacity-40"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        src="/hero-graphs.mp4?v=2"
      />
      <img
        src="/hero-graphs-still.jpg?v=2"
        alt=""
        className="hero-graph-still pointer-events-none absolute top-1/2 left-0 h-auto w-full -translate-y-1/2 opacity-40"
      />
      <div
        ref={wrapRef}
        className="absolute inset-0 flex items-center justify-center px-4 pt-28 pb-6 sm:px-10 sm:pt-32 sm:pb-10"
      >
        <img
          ref={photoRef}
          src="/hero-collage.png?v=3"
          alt="Five students — building, painting, presenting, and playing — joined by dotted lines, with the centre left open."
          className="h-full max-h-full w-full object-contain"
        />
        <img
          src="/hero-script.png"
          alt="Where opportunities lead."
          className="pointer-events-none absolute z-10"
          style={scriptStyle ?? { visibility: "hidden" }}
        />
      </div>
    </div>
  );
}
