"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** Sends a page view when the visitor moves to another page without a full reload. */
export function GoogleAnalytics() {
  const pathname = usePathname();
  const skipFirstView = useRef(true);

  useEffect(() => {
    if (!MEASUREMENT_ID || !window.gtag) return;
    if (skipFirstView.current) {
      skipFirstView.current = false;
      return;
    }
    window.gtag("config", MEASUREMENT_ID, { page_path: pathname });
  }, [pathname]);

  return null;
}
