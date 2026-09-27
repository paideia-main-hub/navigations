import type { ReactNode } from "react";

const icons: Record<string, ReactNode> = {
  chart: <path d="M4 20V10m6 10V4m6 16v-7m6 7V8M2 20h20" />,
  gear: (
    <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm8.4-2.1a7 7 0 0 0 0-2.8l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2.4-1.4L15.3 3H8.7l-.4 2.3A7 7 0 0 0 5.9 6.7l-2.3-1-2 3.4 2 1.5a7 7 0 0 0 0 2.8l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2.4 1.4l.4 2.3h6.6l.4-2.3a7 7 0 0 0 2.4-1.4l2.3 1 2-3.4-2-1.5Z" />
  ),
  people: (
    <path d="M17 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9.5 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm12.5 10v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
  ),
};

const REASONS = [
  {
    line1: "Demonstrate learning",
    line2: "beyond grades",
    detail: "A published portfolio of real work, not just a transcript line.",
    icon: "chart",
  },
  {
    line1: "Apply skills in",
    line2: "meaningful challenges",
    detail: "Every task maps to a competence a school report can't capture.",
    icon: "gear",
  },
  {
    line1: "Gain visible recognition",
    line2: "for competencies",
    detail: "Certificates, badges and rankings a college or employer can check.",
    icon: "people",
  },
] as const;

export function WhyTheLeague() {
  return (
    <section className="relative overflow-hidden bg-background px-6 py-20 sm:py-24">
      <div className="relative mx-auto max-w-7xl">
        <h2 className="flex items-center gap-3 text-sm font-bold tracking-wider text-foreground uppercase">
          <span aria-hidden="true" className="h-0.5 w-8 bg-accent" />
          Why Future Ready League?
        </h2>

        <ul className="mt-10 grid gap-6 sm:grid-cols-3">
          {REASONS.map((r, i) => (
            <li
              key={r.line1}
              // A slight vertical stagger on the middle card, so three equally
              // important reasons read as a considered composition rather
              // than three boxes stamped out of the same die.
              className={i === 1 ? "sm:translate-y-6" : ""}
            >
              <div className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-border bg-surface p-7 shadow-[0_20px_45px_-30px_rgba(31,32,65,0.4)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1.5 hover:border-accent/50 hover:shadow-[0_32px_60px_-28px_rgba(255,105,31,0.35)] sm:p-8">
                {/* Giant watermark icon, same "shape behind the words" trick
                    used on the About page's audience cards, scaled up and
                    given the icon itself rather than a step number. */}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-6 -bottom-8 h-40 w-40 text-foreground/[0.04] transition-colors duration-300 group-hover:text-accent/[0.08]"
                >
                  {icons[r.icon]}
                </svg>

                <span className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent-strong shadow-[0_8px_20px_-8px_rgba(255,105,31,0.35)] transition-colors duration-300 group-hover:bg-accent group-hover:text-accent-foreground">
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

                <p className="relative mt-6 text-xl leading-snug font-extrabold tracking-tight text-balance text-foreground">
                  {r.line1}
                  <br />
                  {r.line2}
                </p>
                <p className="relative mt-3 text-sm leading-relaxed text-balance text-muted">{r.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
