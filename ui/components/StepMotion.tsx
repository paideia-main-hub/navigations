"use client";

import type { ReactNode } from "react";

/** Slides the new step in from the direction of travel. The key is on the
 * inner node so the animation restarts on every step change. */
export function StepMotion({
  step,
  direction,
  className = "",
  children,
}: {
  step: string | number;
  direction: "forward" | "back";
  className?: string;
  children: ReactNode;
}) {
  const motion = direction === "back" ? "step-motion step-enter-back" : "step-motion step-enter-forward";
  return (
    <div key={`${step}:${direction}`} className={`${motion} ${className}`.trim()}>
      {children}
    </div>
  );
}
