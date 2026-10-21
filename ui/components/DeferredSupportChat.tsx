"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const SupportChatFloat = dynamic(
  () =>
    import("@/ui/components/SupportChatFloat").then((m) => ({
      default: m.SupportChatFloat,
    })),
  { ssr: false },
);

/**
 * Mounts the support chat after the browser is idle so it does not compete
 * with homepage LCP images / first paint. Behaviour is unchanged once loaded.
 */
export function DeferredSupportChat() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const enable = () => {
      if (!cancelled) setReady(true);
    };

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(enable, { timeout: 4000 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback?.(id);
      };
    }

    const timer = window.setTimeout(enable, 2500);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  if (!ready) return null;
  return <SupportChatFloat />;
}
