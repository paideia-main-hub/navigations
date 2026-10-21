"use client";

import dynamic from "next/dynamic";

/** Client-only wrapper — `ssr: false` is illegal in Server Components. */
const CheerConfetti = dynamic(
  () =>
    import("@/ui/components/marketing/CheerConfetti").then((m) => ({
      default: m.CheerConfetti,
    })),
  { ssr: false },
);

export function DeferredCheerConfetti() {
  return <CheerConfetti />;
}
