const COLORS = ["#f0c14a", "#f59e0b", "#fb7185", "#f472b6", "#c084fc", "#a78bfa", "#38bdf8", "#2dd4bf", "#34d399", "#4ade80", "#fb923c", "#facc15", "#f43f5e", "#eab308"];

function mix(seed: number) {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

const random = mix(20260930);

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(random() * items.length)];
}

const FLAKES = Array.from({ length: 46 }, (_, index) => ({
  left: `${4 + random() * 92}%`,
  delay: `-${(random() * 12).toFixed(2)}s`,
  duration: `${(8 + random() * 6).toFixed(2)}s`,
  spin: `${(1.8 + random() * 2.8).toFixed(2)}s`,
  color: pick(COLORS),
  w: 6 + Math.round(random() * 8),
  h: 8 + Math.round(random() * 10),
  key: `flake-${index}`,
}));

const DOTS = Array.from({ length: 16 }, (_, index) => ({
  left: `${6 + random() * 88}%`,
  delay: `-${(random() * 12).toFixed(2)}s`,
  duration: `${(9 + random() * 5).toFixed(2)}s`,
  color: pick(COLORS),
  size: 7 + Math.round(random() * 6),
  key: `dot-${index}`,
}));

const RIBBONS = Array.from({ length: 14 }, (_, index) => ({
  left: `${3 + random() * 92}%`,
  delay: `-${(random() * 14).toFixed(2)}s`,
  duration: `${(11 + random() * 5).toFixed(2)}s`,
  spin: `${(5 + random() * 3).toFixed(2)}s`,
  color: pick(["#e8a317", "#f59e0b", "#fbbf24", "#d97706", "#eab308"]),
  flip: random() > 0.5,
  key: `ribbon-${index}`,
}));

function Ribbon({ color }: { color: string }) {
  return (
    <svg width="22" height="72" viewBox="0 0 22 72" fill="none" aria-hidden="true">
      <path
        d="M11 2C19 10 3 18 11 26C19 34 3 42 11 50C18 58 5 66 11 70"
        stroke={color}
        strokeWidth="3.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CheerConfetti() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {FLAKES.map((flake) => (
        <span
          key={flake.key}
          className="cheer-lane"
          style={{ left: flake.left, ["--cheer-duration" as string]: flake.duration, ["--cheer-delay" as string]: flake.delay }}
        >
          <span
            className="cheer-spin absolute top-0 block rounded-[1px]"
            style={{
              width: flake.w,
              height: flake.h,
              backgroundColor: flake.color,
              ["--cheer-spin" as string]: flake.spin,
            }}
          />
        </span>
      ))}
      {DOTS.map((dot) => (
        <span
          key={dot.key}
          className="cheer-lane"
          style={{ left: dot.left, ["--cheer-duration" as string]: dot.duration, ["--cheer-delay" as string]: dot.delay }}
        >
          <span className="absolute top-0 block rounded-full" style={{ width: dot.size, height: dot.size, backgroundColor: dot.color }} />
        </span>
      ))}
      {RIBBONS.map((ribbon) => (
        <span
          key={ribbon.key}
          className="cheer-lane"
          style={{ left: ribbon.left, ["--cheer-duration" as string]: ribbon.duration, ["--cheer-delay" as string]: ribbon.delay }}
        >
          <span
            className="cheer-spin absolute top-0 block"
            style={{ ["--cheer-spin" as string]: ribbon.spin, scale: ribbon.flip ? "-1 1" : undefined }}
          >
            <Ribbon color={ribbon.color} />
          </span>
        </span>
      ))}
    </div>
  );
}
