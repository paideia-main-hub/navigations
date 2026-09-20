/** Opening section of the About page: a copy column beside a photo mosaic.
 *
 * The mosaic is a 12x12 grid that tiles completely — five panels, no holes —
 * where every panel carries one large corner radius and one small one, and no
 * two large radii fall on the same corner. A circular portrait sits over the
 * junction where three panels meet, ringed in the band colour so it reads as
 * punched out of the mosaic rather than dropped on top.
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
    src: "https://images.unsplash.com/photo-1758270705518-b61b40527e76?auto=format&fit=crop&w=400&q=70",
    alt: "A group of students collaborating",
  },
} as const;

const WORDS = ["Explore", "Learn", "Create", "Grow"];
const OUTCOMES = ["Curiosity", "Skills", "Opportunities", "Brighter tomorrows"];

function Tile({ photo, className }: { photo: { src: string; alt: string }; className: string }) {
  return (
    <div className={`group relative overflow-hidden bg-surface-muted ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- remote placeholder host, not in next.config's image remotePatterns */}
      <img
        src={photo.src}
        alt={photo.alt}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    </div>
  );
}

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

        {/* Mosaic */}
        <div className="relative">
          {/* Two rings centred on the portrait below. They sit behind the
              mosaic, so they are visible only in the seams between panels and
              where they run past the outer edge — the panels themselves stay
              uncluttered. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            {/* Waypoints sit at 45 degrees on the ring: on a circle inscribed
                in a square that is (50 +- 35.36)% of the square's own box, so
                they stay on the line whatever the mosaic's aspect ratio. */}
            <div className="absolute top-[41.6%] left-[58.3%] aspect-square w-[112%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent/40">
              <span className="absolute top-[14.64%] left-[85.36%] h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent" />
              <span className="absolute top-[85.36%] left-[14.64%] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/60" />
            </div>
            <div className="absolute top-[41.6%] left-[58.3%] aspect-square w-[74%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-foreground/15" />
          </div>

          <div className="relative grid aspect-[5/6] grid-cols-12 grid-rows-12 gap-2 sm:aspect-[6/5] sm:gap-3">
            <Tile
              photo={PHOTOS.study}
              className="col-span-7 row-span-7 rounded-tl-[2.5rem] rounded-br-[1.25rem] sm:rounded-tl-[4.5rem] sm:rounded-br-[2rem]"
            />
            <Tile
              photo={PHOTOS.robot}
              className="col-span-5 col-start-8 row-span-5 rounded-tr-[2.5rem] rounded-bl-[1.25rem] sm:rounded-tr-[4.5rem] sm:rounded-bl-[2rem]"
            />
            <Tile
              photo={PHOTOS.project}
              className="col-span-5 col-start-8 row-span-7 row-start-6 rounded-tl-[1.25rem] rounded-br-[2.5rem] sm:rounded-tl-[2rem] sm:rounded-br-[4.5rem]"
            />
            <Tile
              photo={PHOTOS.tablet}
              className="col-span-3 row-span-5 row-start-8 rounded-tr-[1.25rem] rounded-bl-[2.5rem] sm:rounded-tr-[2rem] sm:rounded-bl-[4.5rem]"
            />

            {/* The one panel that is type rather than photograph, so the
                mosaic carries the promise as well as the pictures. */}
            <div className="col-span-4 col-start-4 row-span-5 row-start-8 flex flex-col justify-center gap-1.5 rounded-tl-[1.25rem] rounded-br-[1.25rem] bg-brand-deep px-2.5 py-4 sm:rounded-tl-[2rem] sm:rounded-br-[2rem] sm:px-5">
              <span aria-hidden="true" className="mb-1 h-0.5 w-6 rounded-full bg-accent" />
              {OUTCOMES.map((outcome) => (
                <span
                  key={outcome}
                  className="text-[9px] leading-tight font-bold tracking-[0.06em] text-brand-deep-foreground uppercase sm:text-[10px] sm:tracking-[0.2em]"
                >
                  {outcome}
                </span>
              ))}
            </div>
          </div>

          {/* Punched out of the seam where three panels meet. */}
          <div className="pointer-events-none absolute top-[41.6%] left-[58.3%] -translate-x-1/2 -translate-y-1/2">
            {/* eslint-disable-next-line @next/next/no-img-element -- remote placeholder host, not in next.config's image remotePatterns */}
            <img
              src={PHOTOS.team.src}
              alt={PHOTOS.team.alt}
              loading="lazy"
              className="h-20 w-20 rounded-full border-[6px] border-background object-cover shadow-[0_18px_40px_-20px_rgba(31,32,65,0.55)] sm:h-28 sm:w-28 sm:border-8 lg:h-32 lg:w-32"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
