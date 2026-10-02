import { BandDivider, WAVE_PATH } from "@/ui/components/marketing/BandDivider";

const DIVIDER_H = "h-10 sm:h-14 lg:h-20";

/** Wave cut into the next band; optional light shadow / spill net on the curve. */
export function WaveCurvedBottom({
  id,
  /** Text utility for the next band’s fill, e.g. `text-background` / `text-surface-warm`. */
  nextColor,
  /** This section’s fill — used so the shadow silhouette matches the band. */
  fill = "#1f2041",
  showShadow = false,
  /** When the next band has a warm net, continue that lattice through this wave. */
  spillWarmNet = false,
  /** Match SectionNet lattice when spilling (awards uses angular). */
  spillLattice = "ortho",
}: {
  id: string;
  nextColor: string;
  fill?: string;
  showShadow?: boolean;
  spillWarmNet?: boolean;
  spillLattice?: "ortho" | "angular";
}) {
  const maskId = `${id}-wave-above`;
  const filterId = `${id}-wave-shadow`;
  const clipId = `${id}-wave-below`;
  const spillMaskId = `${id}-spill-wave`;
  const spillPatternId = `${id}-spill-net`;

  return (
    <>
      <BandDivider shape="wave" side="bottom" color={nextColor} className={DIVIDER_H} />
      {spillWarmNet ? (
        <svg
          aria-hidden="true"
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          className={`pointer-events-none absolute inset-x-0 bottom-0 z-[11] w-full overflow-visible opacity-55 ${DIVIDER_H}`}
        >
          <defs>
            <pattern
              id={spillPatternId}
              width="45"
              height="45"
              patternUnits="userSpaceOnUse"
              patternTransform={spillLattice === "angular" ? "rotate(32)" : undefined}
            >
              <line
                x1="0"
                y1="0.8"
                x2="45"
                y2="0.8"
                stroke="#e8d5c4"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray="4 5"
              />
              <line
                x1="0.8"
                y1="0"
                x2="0.8"
                y2="45"
                stroke="#e8d5c4"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray="4 5"
              />
            </pattern>
            <mask id={spillMaskId} maskUnits="userSpaceOnUse">
              <path d={WAVE_PATH} transform="translate(0 100) scale(1 -1)" fill="white" />
            </mask>
          </defs>
          <rect width="1440" height="100" fill={`url(#${spillPatternId})`} mask={`url(#${spillMaskId})`} />
        </svg>
      ) : null}
      {showShadow ? (
        <svg
          aria-hidden="true"
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          className={`pointer-events-none absolute inset-x-0 bottom-0 z-20 w-full overflow-visible ${DIVIDER_H}`}
        >
          <defs>
            <mask id={maskId} maskUnits="userSpaceOnUse">
              <rect width="1440" height="100" fill="white" />
              <path d={WAVE_PATH} transform="translate(0 100) scale(1 -1)" fill="black" />
            </mask>
            <filter id={filterId} x="-6%" y="-40%" width="112%" height="220%" colorInterpolationFilters="sRGB">
              <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#1f2041" floodOpacity="0.1" />
            </filter>
            <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
              <rect x="0" y="0" width="1440" height="180" />
            </clipPath>
          </defs>
          <g clipPath={`url(#${clipId})`}>
            <g filter={`url(#${filterId})`}>
              <rect width="1440" height="100" fill={fill} mask={`url(#${maskId})`} />
            </g>
          </g>
        </svg>
      ) : null}
    </>
  );
}
