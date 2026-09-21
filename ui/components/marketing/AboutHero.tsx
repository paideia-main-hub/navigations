/** Opening section of the About page: a copy column beside an orbit.
 *
 * Six square photographs ride a ring around one circular photograph, a
 * revolution every two minutes. The ring rotates; each square runs the same
 * rotation in reverse so it stays upright rather than tumbling as it goes.
 * Hovering the collage pauses both together.
 *
 * Every measurement is a percentage of the square container, so the whole
 * thing scales with its box and needs no breakpoint of its own.
 *
 * Photos are Unsplash placeholders; swap the `src` values for real ones. */

import { BandTexture } from "./BandTexture";

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

/** Centre to satellite centre, and the side of a satellite — both percentages
 * of the box. 35 + 22/2 = 46 keeps every square inside the box, and the gap
 * between neighbours on the ring works out at 13 points, so they never touch. */
const ORBIT_RADIUS = 35;
const SATELLITE_SIZE = 22;

/** Six evenly spaced points on the circle, starting at twelve o'clock. */
const SATELLITES = [
  PHOTOS.tablet,
  PHOTOS.robot,
  PHOTOS.classroom,
  PHOTOS.project,
  PHOTOS.team,
  PHOTOS.solder,
].map((photo, i, all) => {
  const radians = ((-90 + (360 / all.length) * i) * Math.PI) / 180;
  return {
    photo,
    left: 50 + ORBIT_RADIUS * Math.cos(radians),
    top: 50 + ORBIT_RADIUS * Math.sin(radians),
  };
});

export function AboutHero() {
  return (
    <section className="relative overflow-hidden bg-background px-6 pt-16 pb-24 lg:pb-32">
      {/* Contours centred roughly where the orbit sits, so the rings read as
          terrain the collage is placed on rather than wallpaper. */}
      <BandTexture pattern="contours" className="text-brand-deep/[0.06]" position="top-0 right-[-10%] h-full w-[70%]" />
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

        {/* Orbit */}
        <div className="group relative mx-auto aspect-square w-full max-w-[36rem] lg:max-w-none">
          {/* The ring carries the squares; it has no size of its own. */}
          <div className="absolute inset-0 animate-orbit group-hover:[animation-play-state:paused]">
            {SATELLITES.map((satellite) => (
              <div
                key={satellite.photo.src}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${satellite.left}%`,
                  top: `${satellite.top}%`,
                  width: `${SATELLITE_SIZE}%`,
                }}
              >
                {/* Same duration, opposite direction: the square travels the
                    circle without turning with it. */}
                <div className="animate-orbit-reverse group-hover:[animation-play-state:paused]">
                  <div className="aspect-square overflow-hidden rounded-2xl border-[5px] border-background shadow-[0_18px_40px_-22px_rgba(31,32,65,0.65)]">
                    {/* eslint-disable-next-line @next/next/no-img-element -- remote placeholder host, not in next.config's image remotePatterns */}
                    <img
                      src={satellite.photo.src}
                      alt={satellite.photo.alt}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* The still centre. */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border-[7px] border-background shadow-[0_28px_60px_-28px_rgba(31,32,65,0.7)]"
            style={{ width: "40%", aspectRatio: "1 / 1" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- remote placeholder host, not in next.config's image remotePatterns */}
            <img
              src={PHOTOS.study.src}
              alt={PHOTOS.study.alt}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
