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

type Shape = "wave" | "curve" | "arc" | "tilt";

/** Each path is drawn on a 1440x100 box filling the TOP of it; a bottom
 * divider is the same path flipped vertically. preserveAspectRatio="none"
 * stretches them to whatever height the section asks for. */
const PATHS: Record<Shape, string> = {
  // Shallow S — the softest of the four.
  wave: "M0 0h1440v46c-206 40-379-16-585-4-206 12-412 66-618 44-79-8-158-24-237-44Z",
  // Single dome bulging down through the middle.
  curve: "M0 0h1440v30c-338 62-1102 62-1440 0Z",
  // Scoop — the neighbour sweeps down at both edges.
  arc: "M0 0h1440v92c-338-56-1102-56-1440 0Z",
  // Diagonal slant.
  tilt: "M0 0h1440v16L0 88Z",
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
      className={`pointer-events-none absolute inset-x-0 ${side === "top" ? "top-0" : "bottom-0"} ${className} ${color}`}
    >
      <svg
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        className={`h-full w-full ${transform}`}
        focusable="false"
      >
        <path d={PATHS[shape]} fill="currentColor" />
      </svg>
    </div>
  );
}
