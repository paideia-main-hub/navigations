/** Opening section of the About page: a copy column beside a photo collage.
 *
 * The collage is scattered rather than gridded — every print is absolutely
 * placed, rotated and overlapping — but it is mirror-symmetric about the
 * vertical centre line: each outer print has a partner at the same distance
 * from centre carrying the opposite rotation. The irregularity is in the
 * sizes, the aspect ratios, the stacking order and small vertical offsets, so
 * the composition reads as balanced without reading as tidy.
 *
 * Positions are percentages of the container, so the whole thing scales with
 * its box and needs no breakpoint of its own.
 *
 * Photos are Unsplash placeholders; swap the `src` values for real ones. */

const PHOTOS = {
  study: {
    src: "https://images.unsplash.com/photo-1780742961135-7f6b965530fa?auto=format&fit=crop&w=900&q=70",
    alt: "Four students working through a task together at a shared table",
  },
  robot: {
    src: "https://images.unsplash.com/photo-1743677077216-00a458eff9e0?auto=format&fit=crop&w=800&q=70",
    alt: "Children gathered around a robot they have built",
  },
  project: {
    src: "https://images.unsplash.com/photo-1653566031536-4d1b6a9da15e?auto=format&fit=crop&w=800&q=70",
    alt: "Two students building a project together",
  },
  tablet: {
    src: "https://images.unsplash.com/photo-1568585262983-9b54814595a9?auto=format&fit=crop&w=600&q=70",
    alt: "A young student working on a tablet",
  },
  team: {
    src: "https://images.unsplash.com/photo-1758270705518-b61b40527e76?auto=format&fit=crop&w=600&q=70",
    alt: "A group of students collaborating",
  },
  solder: {
    src: "https://images.unsplash.com/photo-1537151242758-331155dcf21b?auto=format&fit=crop&w=600&q=70",
    alt: "A student soldering a circuit for a model",
  },
  classroom: {
    src: "https://images.unsplash.com/photo-1585980243496-fe29a36bd382?auto=format&fit=crop&w=600&q=70",
    alt: "Younger students working at a classroom table",
  },
} as const;

const WORDS = ["Explore", "Learn", "Create", "Grow"];

/** left/width and top are percentages of the collage box. A centre print plus
 * three mirrored pairs: partners sit the same distance from the middle and
 * take opposite rotations, so the scatter balances. Sizes, aspect ratios,
 * stacking order and the small vertical offsets between partners are what
 * keep it from looking arranged. */
const PRINTS = [
  { photo: PHOTOS.solder, left: 0, top: 32, width: 24, ratio: "1 / 1", rotate: 5, z: 10, round: "rounded-2xl" },
  { photo: PHOTOS.classroom, left: 76, top: 34, width: 24, ratio: "4 / 3", rotate: -5, z: 10, round: "rounded-2xl" },
  { photo: PHOTOS.tablet, left: 6, top: 3, width: 32, ratio: "4 / 3", rotate: -8, z: 20, round: "rounded-2xl" },
  { photo: PHOTOS.robot, left: 62, top: 0, width: 32, ratio: "1 / 1", rotate: 8, z: 20, round: "rounded-2xl" },
  { photo: PHOTOS.project, left: 9, top: 55, width: 30, ratio: "4 / 5", rotate: 7, z: 30, round: "rounded-2xl" },
  { photo: PHOTOS.team, left: 61, top: 58, width: 30, ratio: "1 / 1", rotate: -7, z: 30, round: "rounded-full" },
  { photo: PHOTOS.study, left: 27, top: 27, width: 46, ratio: "5 / 4", rotate: 2, z: 40, round: "rounded-3xl" },
] as const;

export function AboutHero() {
  return (
    <section className="relative overflow-hidden bg-background px-6 pt-16 pb-24 lg:pb-32">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-accent/[0.07] blur-[130px]" />
        <div className="absolute -right-20 bottom-0 h-[28rem] w-[28rem] rounded-full bg-brand-deep/[0.06] blur-[130px]" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        {/* Copy column */}
        <div>
          <p className="text-xs font-bold tracking-[0.25em] text-accent-strong uppercase">More than a classroom</p>

          <h1 className="mt-5 text-5xl leading-[0.95] font-black tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            About
            <br />
            Navigations
          </h1>

          <p className="mt-5 text-xl font-semibold text-foreground sm:text-2xl">Where opportunities lead.</p>

          <span aria-hidden="true" className="mt-7 block h-1 w-16 rounded-full bg-accent" />

          <ul className="mt-7 space-y-1.5">
            {WORDS.map((word) => (
              <li key={word} className="text-sm font-semibold tracking-[0.3em] text-muted uppercase">
                {word}
              </li>
            ))}
          </ul>
        </div>

        {/* Collage */}
        <div className="relative aspect-[7/6] w-full">
          {PRINTS.map((print) => (
            <div
              key={print.photo.src}
              className={`group absolute overflow-hidden border-[6px] border-background shadow-[0_22px_50px_-28px_rgba(31,32,65,0.65)] transition-transform duration-300 hover:z-50 hover:rotate-0 ${print.round}`}
              style={{
                left: `${print.left}%`,
                top: `${print.top}%`,
                width: `${print.width}%`,
                aspectRatio: print.ratio,
                rotate: `${print.rotate}deg`,
                zIndex: print.z,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- remote placeholder host, not in next.config's image remotePatterns */}
              <img
                src={print.photo.src}
                alt={print.photo.alt}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
