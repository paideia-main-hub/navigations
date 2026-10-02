import type { ReactNode } from "react";
import { WaveCurvedBottom } from "@/ui/components/marketing/WaveCurvedBottom";

export function PageBanner({
  eyebrow,
  title,
  subtitle,
  watermark,
  children,
  className = "",
  showNet = false,
  /** Awards page only — tilted lattice; other pages keep axis-aligned. */
  netLattice = "ortho",
  curvedBottom = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** Optional dim background mark (e.g. awards “05 layers”). */
  watermark?: ReactNode;
  /** Extra content under the subtitle (CTAs, notes). */
  children?: ReactNode;
  className?: string;
  /** Same dotted grid used on Ways to Participate / Important Dates. */
  showNet?: boolean;
  netLattice?: "ortho" | "angular";
  /** Wave cut into the next band, with a light shadow on the curve only. */
  curvedBottom?: boolean;
}) {
  return (
    <div
      className={`relative bg-brand-deep px-6 ${
        curvedBottom ? "overflow-x-hidden overflow-y-visible" : "overflow-hidden"
      } ${className || (curvedBottom ? "pt-14 pb-24 sm:pb-28 lg:pb-32" : "py-14")}`.trim()}
    >
      {showNet ? (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.1),transparent_70%)]" />
          <svg className="absolute inset-0 h-full w-full">
            <defs>
              <pattern
                id="page-banner-net"
                width="45"
                height="45"
                patternUnits="userSpaceOnUse"
                patternTransform={netLattice === "angular" ? "rotate(32)" : undefined}
              >
                <line
                  x1="0"
                  y1="0.8"
                  x2="45"
                  y2="0.8"
                  stroke="#2c2f4c"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeDasharray="4 5"
                />
                <line
                  x1="0.8"
                  y1="0"
                  x2="0.8"
                  y2="45"
                  stroke="#2c2f4c"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeDasharray="4 5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#page-banner-net)" />
          </svg>
        </div>
      ) : null}
      {/* Above the net (z-0), below hero copy (z-10). */}
      {watermark ? <div className="pointer-events-none absolute inset-0 z-[8]">{watermark}</div> : null}
      <div className="relative z-10 mx-auto max-w-7xl">
        {eyebrow ? (
          <p className="text-xs font-semibold tracking-wider text-accent uppercase">{eyebrow}</p>
        ) : null}
        <h1 className="mt-1 text-3xl font-extrabold text-white sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-3 max-w-2xl text-brand-deep-muted">{subtitle}</p>}
        {children}
      </div>
      {curvedBottom ? (
        <WaveCurvedBottom id="awards-hero" nextColor="text-background" fill="#1f2041" showShadow />
      ) : null}
    </div>
  );
}
