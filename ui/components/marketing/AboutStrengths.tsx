"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** "What students can explore" — the six strengths, as cards.
 *
 * The reference packs all six into one row, which leaves each one a sliver.
 * Three across over two rows gives every card a photograph you can actually
 * read and room for a line saying what the strength means in practice.
 *
 * Photos live in public/about. The scenes stay as they were; the people are Pakistani. */

const icons: Record<string, ReactNode> = {
  brush: <path d="M15.5 2.5a2.1 2.1 0 0 1 3 3L9 15l-4 1 1-4 9.5-9.5ZM5 16c-1.5 1.5-1 4-3 5 2.5.6 5.5 0 6-3" />,
  speech: <path d="M8 13.5H5.5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2V7m-5 13.5H18.5a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-9a2 2 0 0 0-2 2v10l3-2Z" />,
  gear: <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm8.4-2.1a7 7 0 0 0 0-2.8l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2.4-1.4L15.3 3H8.7l-.4 2.3A7 7 0 0 0 5.9 6.7l-2.3-1-2 3.4 2 1.5a7 7 0 0 0 0 2.8l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2.4 1.4l.4 2.3h6.6l.4-2.3a7 7 0 0 0 2.4-1.4l2.3 1 2-3.4-2-1.5Z" />,
  laptop: <path d="M4 5.5h16v10H4zM2 19h20M9.5 19l.5-3.5h4l.5 3.5" />,
  bulb: <path d="M9 18h6m-5 3h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2Z" />,
  people: (
    <path d="M17 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9.5 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm12.5 10v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
  ),
};

const STRENGTHS = [
  {
    icon: "brush",
    label: "Creativity",
    note: "Design, make and perform — work that starts from a blank page.",
    src: "/about/strength-creativity.jpg",
    alt: "A student painting",
  },
  {
    icon: "speech",
    label: "Communication",
    note: "Speak, write and present ideas so other people can act on them.",
    src: "/about/strength-communication.jpg",
    alt: "A student speaking into a microphone",
  },
  {
    icon: "gear",
    label: "Problem-solving",
    note: "Take an unfamiliar problem apart and build a way through it.",
    src: "/about/strength-problem.jpg",
    alt: "Students building a model together",
  },
  {
    icon: "laptop",
    label: "Technology",
    note: "Code, model and build with the tools the work actually uses.",
    src: "/about/strength-technology.jpg",
    alt: "A student working at a laptop in a classroom",
  },
  {
    icon: "bulb",
    label: "Innovation",
    note: "Spot what could work better, then prototype it and try it out.",
    src: "/about/strength-innovation.jpg",
    alt: "A student holding a drone they have built",
  },
  {
    icon: "people",
    label: "Leadership",
    note: "Organise a team, carry a plan and take responsibility for it.",
    src: "/about/strength-leadership.jpg",
    alt: "Students working together in a lecture hall",
  },
] as const;

/** The four arcs, parked in the top-left and drifted by the page scroll. */
function StrengthLines() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    const section = node?.parentElement;
    if (!node || !section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let queued = false;
    const apply = () => {
      queued = false;
      const rect = section.getBoundingClientRect();
      const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      const travel = (progress - 0.5) * 360;
      node.style.translate = `${travel * -0.4}px ${travel}px`;
    };
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute top-0 left-0 h-[48%] w-[62%] text-accent/25">
      <svg
        viewBox="0 0 800 800"
        fill="none"
        stroke="currentColor"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full origin-center -scale-y-100"
      >
        <g strokeWidth="1.4">
          <path d="M-120 700C60 470 300 330 620 300" />
          <path d="M-120 800C80 540 350 390 700 358" />
          <path d="M-40 860C140 620 400 470 760 430" />
          <path d="M40 920C220 700 480 550 820 510" />
        </g>
      </svg>
    </div>
  );
}

export function AboutStrengths() {
  return (
    <section className="relative overflow-hidden bg-background px-6 py-24">
      <StrengthLines />
      <div className="relative mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-xs font-bold tracking-[0.22em] text-accent-strong uppercase">
            What students can explore
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-balance text-foreground sm:text-4xl">
            Opportunities for different strengths.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            No two students arrive good at the same things. Every competition in the League leans on one of these, so
            there is somewhere worth starting whatever a student is already strong at.
          </p>
        </div>

        <ul className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          {STRENGTHS.map((strength) => (
            <li key={strength.label}>
              <article className="group h-full overflow-hidden rounded-3xl border border-border bg-surface transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1.5 hover:border-accent/40 hover:shadow-[0_28px_60px_-36px_rgba(31,32,65,0.65)]">
                <div className="aspect-[4/3] overflow-hidden bg-surface-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element -- remote placeholder host, not in next.config's image remotePatterns */}
                  <img
                    src={strength.src}
                    alt={strength.alt}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="p-7">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-strong transition-colors duration-300 group-hover:bg-accent group-hover:text-accent-foreground">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        className="h-5 w-5"
                      >
                        {icons[strength.icon]}
                      </svg>
                    </span>
                    <h3 className="text-lg font-bold text-foreground">{strength.label}</h3>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-muted">{strength.note}</p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
