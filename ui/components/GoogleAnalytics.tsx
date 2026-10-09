"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** Loads the GA4 tag and records a page view on each client-side navigation. */
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

  if (!MEASUREMENT_ID) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
