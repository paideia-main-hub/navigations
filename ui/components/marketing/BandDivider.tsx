/** A shaped edge between two full-width bands, so the boundary reads as a
 * curve or a slant rather than a ruled line.
 *
 * The shape is filled with the *neighbouring* band's colour and sits inside
 * this section, which makes the neighbour look like it spills across the
 * seam. Pass that colour as a text utility (`text-surface-warm`,
 * `text-brand-deep`, ...) — the path paints with currentColor.
 *
 * The host section needs `relative overflow-hidden`, and enough padding on
 * that side to keep content clear of the shape. */

type Shape = "wave" | "curve" | "arc" | "tilt" | "blob" | "dune";

/** Each path is drawn on a 1440x100 box filling the TOP of it; a bottom
 * divider is the same path flipped vertically. preserveAspectRatio="none"
 * stretches them to whatever height the section asks for. */
/** Shared with the Why-we-exist curve shadow so the shadow traces this edge. */
export const BLOB_PATH =
  "M0 0h1440v34c-96 34-183 18-268 2-118-22-214-34-320 12-88 38-166 64-262 52-84-10-140-46-222-52C289 40 214 66 137 74 89 79 44 72 0 56Z";

/** Shallow S — used on awards hero bottom + curve shadow. */
export const WAVE_PATH =
  "M0 0h1440v46c-206 40-379-16-585-4-206 12-412 66-618 44-79-8-158-24-237-44Z";

const PATHS: Record<Shape, string> = {
  // Shallow S — the softest of the four.
  wave: WAVE_PATH,
  // Single dome bulging down through the middle.
  curve: "M0 0h1440v30c-338 62-1102 62-1440 0Z",
  // Scoop — the neighbour sweeps down at both edges.
  arc: "M0 0h1440v92c-338-56-1102-56-1440 0Z",
  // Diagonal slant.
  tilt: "M0 0h1440v16L0 88Z",
  // Lumpy and asymmetric. Meant to be run tall — at 8rem or more it stops
  // reading as a trimmed edge and becomes a mass of the neighbouring colour
  // pushing down into this band.
  blob: BLOB_PATH,
  // One long swell that crests left of centre, for a slower, calmer break.
  dune: "M0 0h1440v22c-170 76-356 88-536 52C716 36 560 4 392 20 248 34 122 62 0 96Z",
};

export function BandDivider({
  shape = "wave",
  side = "top",
  color,
  flip = false,
  className = "h-10 sm:h-14 lg:h-20",
}: {
  shape?: Shape;
  side?: "top" | "bottom";
  /** Text-colour utility naming the adjacent band, e.g. "text-surface-warm". */
  color: string;
  /** Mirrors the shape horizontally, so a repeated shape does not read as a pattern. */
  flip?: boolean;
  /** Height utilities for the divider strip. */
  className?: string;
}) {
  const transform = [side === "bottom" ? "-scale-y-100" : "", flip ? "-scale-x-100" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      aria-hidden="true"
      // z-10: every section's own decorative glow blobs are also plain
      // `absolute` with no z-index, and several sit deliberately near a top
      // or bottom edge for "depth behind the cards" — without this, whichever
      // one comes later in that section's JSX paints over the divider and
      // tints its precisely-matched colour, showing as a thin off-colour
      // seam exactly where the two bands are supposed to meet cleanly.
      className={`pointer-events-none absolute inset-x-0 z-10 ${side === "top" ? "top-0" : "bottom-0"} ${className} ${color}`}
    >
      <svg
        viewBox={shape === "blob" ? "0 0 1440 108" : "0 0 1440 100"}
        preserveAspectRatio="none"
        className={`h-full w-full overflow-visible ${transform}`}
        focusable="false"
      >
        <path d={PATHS[shape]} fill="currentColor" />
      </svg>
    </div>
  );
}
