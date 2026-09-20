import Link from "next/link";
import type { ReactNode } from "react";

const icons: Record<string, ReactNode> = {
  certificate: (
    <path d="M6 2h9l5 5v9a2 2 0 0 1-2 2h-1M15 2v5h5M8 12h6M8 16h4M9 20.5 7 22v-6.5m-4 0V22l2-1.5M6 9.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z" />
  ),
  badge: <path d="M12 3.5 14 7l4 .6-2.9 2.8.7 4-3.8-2-3.8 2 .7-4L6 7.6 10 7l2-3.5Zm-4 12L6.5 22 12 19l5.5 3L16 15.5" />,
  chart: <path d="M4 20V10m6 10V4m6 16v-7m6 7V8M2 20h20" />,
  star: <path d="m12 2.6 2.9 5.9 6.5.9-4.7 4.6 1.1 6.4-5.8-3-5.8 3 1.1-6.4L2.6 9.4l6.5-.9L12 2.6Z" />,
};

const RECOGNITION = [
  {
    label: "Digital Certificate",
    note: "Issued to every participant who completes their competition.",
    icon: "certificate",
  },
  {
    label: "Digital Badge",
    note: "A shareable mark of the competency the competition evidenced.",
    icon: "badge",
  },
  {
    label: "Competition Distinctions",
    note: "Outstanding Performer, Distinguished Finalist and Emerging Talent.",
    icon: "chart",
  },
  {
    label: "Special Recognition Opportunities",
    note: "Spotlight, school, sports and teacher awards across five layers.",
    icon: "star",
  },
] as const;

export function RecognitionStrip() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <h2 className="flex items-center gap-3 text-sm font-bold tracking-wider text-foreground uppercase">
          <span aria-hidden="true" className="h-0.5 w-8 bg-accent" />
          Recognition for Every Participant
        </h2>

        <div className="mt-8 overflow-hidden rounded-3xl border border-border bg-surface">
          <div className="grid lg:grid-cols-[1fr_auto_18rem]">
            <ul className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
              {RECOGNITION.map((r) => (
                <li
                  key={r.label}
                  className="group flex flex-col items-center gap-3 bg-surface px-5 py-9 text-center transition-colors hover:bg-surface-muted"
                >
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-accent-soft text-accent-strong transition-colors duration-200 group-hover:bg-accent group-hover:text-accent-foreground">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className="h-7 w-7"
                    >
                      {icons[r.icon]}
                    </svg>
                  </span>
                  <span className="text-sm leading-snug font-bold text-balance text-foreground">{r.label}</span>
                  <span className="text-xs leading-relaxed text-balance text-muted">{r.note}</span>
                </li>
              ))}
            </ul>

            <div aria-hidden="true" className="hidden w-px bg-border lg:block" />

            {/* Closing panel — the trophy in the reference, carrying the link
                through to the full framework. */}
            <Link
              href="/awards"
              className="group relative flex flex-col items-center justify-center gap-3 overflow-hidden bg-brand-deep px-6 py-9 text-center transition-colors hover:bg-brand-deep/95"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-10 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-accent/20 blur-3xl"
              />
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="relative h-12 w-12 text-accent transition-transform duration-300 group-hover:-translate-y-0.5"
              >
                <path d="M8 21h8m-4-4v4m-6-17h12v5a6 6 0 0 1-12 0V4Zm0 2H4a2 2 0 0 0 0 4h2m12-4h2a2 2 0 0 1 0 4h-2" />
              </svg>
              <span className="relative text-sm font-bold text-brand-deep-foreground">
                Five layers of awards, from competition distinctions to school and sports recognition.
              </span>
              <span className="relative inline-flex items-center gap-1.5 text-sm font-bold text-accent">
                View Awards Framework
                <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5">
                  →
                </span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
