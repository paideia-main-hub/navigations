"use client";

import { useEffect, useRef } from "react";

/**
 * The `autoPlay` attribute alone doesn't reliably self-trigger here: this
 * video sits inside an async Server Component, so Next.js streams it in and
 * swaps it into the DOM on the client rather than the browser's HTML parser
 * placing it up front — and some browsers only auto-start a parser-inserted
 * autoplay video. Calling play() explicitly once it's mounted covers that
 * gap; it's a harmless no-op if the attribute already got it going.
 */
export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, []);

  return (
    <video
      ref={videoRef}
      className="absolute inset-0 h-full w-full object-cover"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
    >
      <source src="/hero-animation.mp4" type="video/mp4" />
    </video>
  );
}
