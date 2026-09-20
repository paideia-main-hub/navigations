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
  { line1: "Demonstrate learning", line2: "beyond grades", icon: "chart" },
  { line1: "Apply skills in", line2: "meaningful challenges", icon: "gear" },
  { line1: "Gain visible recognition", line2: "for competencies", icon: "people" },
] as const;

export function WhyTheLeague() {
  return (
    <section className="px-6 py-14">
      <div className="mx-auto max-w-7xl">
        <h2 className="flex items-center gap-3 text-sm font-bold tracking-wider text-foreground uppercase">
          <span aria-hidden="true" className="h-0.5 w-8 bg-accent" />
          Why Future Ready League?
        </h2>

        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {REASONS.map((r) => (
            <li
              key={r.line1}
              className="group flex items-center gap-4 rounded-2xl border border-border bg-surface-muted px-5 py-5 transition-colors hover:border-accent hover:bg-surface"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-strong transition-colors duration-200 group-hover:bg-accent group-hover:text-accent-foreground">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="h-6 w-6"
                >
                  {icons[r.icon]}
                </svg>
              </span>
              <span className="text-[15px] leading-snug font-semibold text-foreground">
                {r.line1}
                <br />
                {r.line2}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
