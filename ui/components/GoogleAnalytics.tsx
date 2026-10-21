"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function injectGtag(measurementId: string) {
  if (typeof window === "undefined" || window.gtag) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", measurementId);

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);
}

/**
 * Loads GA after idle so it does not compete with first paint.
 * Still records the first page view once loaded, then SPA navigations.
 */
export function GoogleAnalytics() {
  const pathname = usePathname();
  const loaded = useRef(false);
  const skipNextSpaView = useRef(true);

  useEffect(() => {
    if (!MEASUREMENT_ID) return;

    let cancelled = false;
    const start = () => {
      if (cancelled || loaded.current) return;
      loaded.current = true;
      injectGtag(MEASUREMENT_ID);
    };

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(start, { timeout: 4000 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback?.(id);
      };
    }

    const timer = window.setTimeout(start, 2500);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!MEASUREMENT_ID || !window.gtag) return;
    if (skipNextSpaView.current) {
      // First config already sent in injectGtag.
      skipNextSpaView.current = false;
      return;
    }
    window.gtag("config", MEASUREMENT_ID, { page_path: pathname });
  }, [pathname]);

  return null;
}
