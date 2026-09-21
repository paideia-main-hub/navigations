import type { ReactNode } from "react";

/** "What students can explore" — the six strengths, as cards.
 *
 * The reference packs all six into one row, which leaves each one a sliver.
 * Three across over two rows gives every card a photograph you can actually
 * read and room for a line saying what the strength means in practice.
 *
 * Photos are Unsplash placeholders; swap the `src` values for real ones. */

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

const IMG = "?auto=format&fit=crop&w=760&h=570&q=72";

const STRENGTHS = [
  {
    icon: "brush",
    label: "Creativity",
    note: "Design, make and perform — work that starts from a blank page.",
    src: `https://images.unsplash.com/photo-1551401107-5d806c2909a6${IMG}`,
    alt: "A student painting",
  },
  {
    icon: "speech",
    label: "Communication",
    note: "Speak, write and present ideas so other people can act on them.",
    src: `https://images.unsplash.com/photo-1693058483162-2e14e647fed7${IMG}`,
    alt: "A student speaking into a microphone",
  },
  {
    icon: "gear",
    label: "Problem-solving",
    note: "Take an unfamiliar problem apart and build a way through it.",
    src: `https://images.unsplash.com/photo-1573841154761-93a73710b126${IMG}`,
    alt: "Students building a model together",
  },
  {
    icon: "laptop",
    label: "Technology",
    note: "Code, model and build with the tools the work actually uses.",
    src: `https://images.unsplash.com/photo-1758685733633-a12889098460${IMG}`,
    alt: "A student working at a laptop in a classroom",
  },
  {
    icon: "bulb",
    label: "Innovation",
    note: "Spot what could work better, then prototype it and try it out.",
    src: `https://images.unsplash.com/photo-1583790716180-52195f248836${IMG}`,
    alt: "A student holding a drone they have built",
  },
  {
    icon: "people",
    label: "Leadership",
    note: "Organise a team, carry a plan and take responsibility for it.",
    src: `https://images.unsplash.com/photo-1758270704787-615782711641${IMG}`,
    alt: "Students working together in a lecture hall",
  },
] as const;

export function AboutStrengths() {
  return (
    <section className="bg-background px-6 py-24">
      <div className="mx-auto max-w-7xl">
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
