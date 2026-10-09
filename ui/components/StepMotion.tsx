"use client";

import type { ReactNode } from "react";

/** Slides the new step in from the direction of travel. The key is on the
 * inner node so the animation restarts on every step change. */
export function StepMotion({
  step,
  direction,
  children,
}: {
  step: string | number;
  direction: "forward" | "back";
  children: ReactNode;
}) {
  return (
    <div key={`${step}:${direction}`} className={direction === "back" ? "step-motion step-enter-back" : "step-motion step-enter-forward"}>
      {children}
    </div>
  );
}
