import type { ReactNode } from "react";

const icons: Record<string, ReactNode> = {
  /** Stacked layers — competence frameworks / adaptive curriculum. */
  layers: (
    <>
      <path d="M12 2 2 7l10 5 10-5-10-5Z" />
      <path d="m2 12 10 5 10-5" />
      <path d="m2 17 10 5 10-5" />
    </>
  ),
  /** Globe — United Nations Sustainable Development Goals. */
  globe: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
    </>
  ),
  /** Certificate seal — ISO certified quality system. */
  seal: (
    <>
      <path d="M12 2.8 14.2 7l4.8.7-3.5 3.3.8 4.7-4.3-2.3-4.3 2.3.8-4.7L5 7.7 9.8 7 12 2.8Z" />
      <path d="M9 15.5v6l3-1.6 3 1.6v-6" />
    </>
  ),
};

/** Per-card "coordinated card + accent" treatment — same convention as
 * RouteCard/FlipStack/OrbitCardStack elsewhere on the page: a light pastel
 * card surface paired with a darker shade of the SAME hue for the icon, so
 * three equally-important reasons read as distinct but clearly related
 * rather than a wall of identical white tiles. */
const REASON_COLOR = {
  blue: {
    card: "bg-blue-50 dark:bg-blue-500/10",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 group-hover:bg-blue-600 group-hover:text-white",
    watermark:
      "text-blue-600/[0.07] dark:text-blue-400/[0.08] group-hover:text-blue-600/[0.14] dark:group-hover:text-blue-400/[0.16]",
    border: "hover:border-blue-400/60 dark:hover:border-blue-500/50",
    glow: "hover:shadow-[0_32px_60px_-28px_rgba(59,130,246,0.35)]",
  },
  violet: {
    card: "bg-violet-50 dark:bg-violet-500/10",
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300 group-hover:bg-violet-600 group-hover:text-white",
    watermark:
      "text-violet-600/[0.07] dark:text-violet-400/[0.08] group-hover:text-violet-600/[0.14] dark:group-hover:text-violet-400/[0.16]",
    border: "hover:border-violet-400/60 dark:hover:border-violet-500/50",
    glow: "hover:shadow-[0_32px_60px_-28px_rgba(139,92,246,0.35)]",
  },
  emerald: {
    card: "bg-emerald-50 dark:bg-emerald-500/10",
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 group-hover:bg-emerald-600 group-hover:text-white",
    watermark:
      "text-emerald-600/[0.07] dark:text-emerald-400/[0.08] group-hover:text-emerald-600/[0.14] dark:group-hover:text-emerald-400/[0.16]",
    border: "hover:border-emerald-400/60 dark:hover:border-emerald-500/50",
    glow: "hover:shadow-[0_32px_60px_-28px_rgba(16,185,129,0.35)]",
  },
} as const;

const REASONS = [
  {
    eyebrow: "Adaptive curriculum",
    line1: "Future Competence",
    line2: "Frameworks",
    detail: "Our opportunities develop future competencies that enable students to apply and demonstrate essential skills.",
    icon: "layers",
    color: "blue",
  },
  {
    eyebrow: "Character through global values",
    line1: "United Nations Sustainable",
    line2: "Development Goals",
    detail:
      "Activities connect students with the United Nations Sustainable Development Goals through relevance and purposeful challenges.",
    icon: "globe",
    color: "violet",
  },
  {
    eyebrow: "Commitment to quality",
    line1: "ISO Certified",
    line2: "Quality System",
    detail:
      "Structured processes, supported by an ISO certified management system, promote transparency, accountability and continuous improvement.",
    icon: "seal",
    color: "emerald",
  },
] as const;

export function WhyTheLeague({ className = "py-20 sm:py-24" }: { className?: string }) {
  return (
    <section className={`relative overflow-hidden bg-background px-6 ${className}`}>
      <div className="relative mx-auto max-w-7xl">
        <h2 className="flex items-center gap-3 text-sm font-bold tracking-wider text-foreground uppercase">
          <span aria-hidden="true" className="h-0.5 w-8 bg-accent" />
          What Guides Navigations
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          Our work is built on recognized frameworks, connected with global goals and guided by quality standards.
        </p>

        <ul className="mt-10 grid gap-6 sm:grid-cols-3">
          {REASONS.map((r, i) => {
            const colors = REASON_COLOR[r.color];
            return (
              <li
                key={r.line1}
                // A slight vertical stagger on the middle card, so three equally
                // important reasons read as a considered composition rather
                // than three boxes stamped out of the same die.
                className={i === 1 ? "sm:translate-y-6" : ""}
              >
                <div
                  className={`group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-border p-7 shadow-[0_20px_45px_-30px_rgba(31,32,65,0.4)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1.5 sm:p-8 ${colors.card} ${colors.border} ${colors.glow}`}
                >
                  {/* Giant watermark icon, same "shape behind the words" trick
                      used on the About page's audience cards, scaled up and
                      given the icon itself rather than a step number. */}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    aria-hidden="true"
                    className={`pointer-events-none absolute -right-6 -bottom-8 h-40 w-40 transition-colors duration-300 ${colors.watermark}`}
                  >
                    {icons[r.icon]}
                  </svg>

                  <span
                    className={`relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl shadow-[0_8px_20px_-8px_rgba(31,32,65,0.25)] transition-colors duration-300 ${colors.badge}`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className="h-7 w-7"
                    >
                      {icons[r.icon]}
                    </svg>
                  </span>

                  <p className="relative mt-6 text-[0.7rem] font-bold tracking-[0.18em] text-muted uppercase">{r.eyebrow}</p>
                  <p className="relative mt-2 text-xl leading-snug font-extrabold tracking-tight text-balance text-foreground">
                    {r.line1}
                    <br />
                    {r.line2}
                  </p>
                  <p className="relative mt-3 text-sm leading-relaxed text-balance text-muted">{r.detail}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
