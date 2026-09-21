/** Ambient pattern for the inside of a band, as opposed to BandDivider which
 * shapes the edge between two.
 *
 * All three draw in currentColor at low alpha, so a band sets the tone by
 * passing a text utility from the palette and nothing here hardcodes a
 * colour. They are decorative and inert: aria-hidden, no pointer events.
 *
 *   contours  concentric rings, like height lines on a map — the one that
 *             earns its place on a site called Navigations
 *   grid      fine dot lattice, for bands that want texture but no motif
 *   rings     a few wide arcs sweeping off one corner
 */

type Pattern = "contours" | "grid" | "rings";

/** Rings at increasing radius from one point. Uneven gaps, because evenly
 * spaced circles read as a target rather than terrain. */
function contourPaths(cx: number, cy: number) {
  return [40, 78, 104, 148, 176, 224, 268, 300, 352].map((r, i) => (
    <circle key={r} cx={cx} cy={cy} r={r} strokeWidth={i % 3 === 0 ? 1.6 : 1} />
  ));
}

export function BandTexture({
  pattern = "contours",
  className = "text-foreground/[0.07]",
  position = "",
}: {
  pattern?: Pattern;
  /** Sets the draw colour, e.g. "text-accent/20" or "text-brand-deep/10". */
  className?: string;
  /** Where the motif sits inside the band. */
  position?: string;
}) {
  if (pattern === "grid") {
    // A CSS gradient rather than an SVG <pattern>: a pattern needs an id to
    // reference, and a fixed id would collide the moment two bands both asked
    // for a grid. This still takes its colour from currentColor.
    return (
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 bg-[radial-gradient(currentColor_1.5px,transparent_1.5px)] bg-[length:26px_26px] ${className} ${position}`}
      />
    );
  }

  return (
    <div aria-hidden="true" className={`pointer-events-none absolute ${position || "inset-0"} ${className}`}>
      <svg
        viewBox="0 0 800 800"
        fill="none"
        stroke="currentColor"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
      >
        {pattern === "contours" ? (
          contourPaths(400, 400)
        ) : (
          <g strokeWidth="1.4">
            <path d="M-120 700C60 470 300 330 620 300" />
            <path d="M-120 800C80 540 350 390 700 358" />
            <path d="M-40 860C140 620 400 470 760 430" />
            <path d="M40 920C220 700 480 550 820 510" />
          </g>
        )}
      </svg>
    </div>
  );
}
