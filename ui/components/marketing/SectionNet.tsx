/** Dashed lattice used on Announcements / Important Dates / awards bands. */
export function SectionNet({
  id,
  /** `warm` = peach bands; `cool` = platinum / background bands. */
  variant = "warm",
  /** `ortho` = axis-aligned; `angular` = rotated diamond lattice (awards only). */
  lattice = "ortho",
}: {
  /** Unique SVG pattern id — required when more than one net is on the page. */
  id: string;
  variant?: "warm" | "cool";
  lattice?: "ortho" | "angular";
}) {
  const lightId = `${id}-light`;
  const darkId = `${id}-dark`;
  const patternTransform = lattice === "angular" ? "rotate(32)" : undefined;

  // Warm: Announcements family, stepped down. Cool: soft indigo on Platinum.
  const lightStroke = variant === "cool" ? "#cfd5e4" : "#e8d5c4";
  const darkStroke = variant === "cool" ? "#2c2f4c" : "#2c2640";
  const lightOpacity = variant === "cool" ? "opacity-45" : "opacity-55";
  const darkOpacity = variant === "cool" ? "opacity-35" : "opacity-40";

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <svg className={`absolute inset-0 h-full w-full dark:hidden ${lightOpacity}`}>
        <defs>
          <pattern
            id={lightId}
            width="45"
            height="45"
            patternUnits="userSpaceOnUse"
            patternTransform={patternTransform}
          >
            <line
              x1="0"
              y1="0.8"
              x2="45"
              y2="0.8"
              stroke={lightStroke}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="4 5"
            />
            <line
              x1="0.8"
              y1="0"
              x2="0.8"
              y2="45"
              stroke={lightStroke}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="4 5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${lightId})`} />
      </svg>
      <svg className={`absolute inset-0 hidden h-full w-full dark:block ${darkOpacity}`}>
        <defs>
          <pattern
            id={darkId}
            width="45"
            height="45"
            patternUnits="userSpaceOnUse"
            patternTransform={patternTransform}
          >
            <line
              x1="0"
              y1="0.8"
              x2="45"
              y2="0.8"
              stroke={darkStroke}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="4 5"
            />
            <line
              x1="0.8"
              y1="0"
              x2="0.8"
              y2="45"
              stroke={darkStroke}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="4 5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${darkId})`} />
      </svg>
    </div>
  );
}
