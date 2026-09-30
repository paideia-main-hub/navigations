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
 * Photos live in public/about. The scenes stay as they were; the people are Pakistani. */

import { BandDivider } from "./BandDivider";
import { BandTexture } from "./BandTexture";

const PHOTOS = {
  study: {
    src: "/about/hero-study.jpg?v=2",
    alt: "Four students working through a task together at a shared table",
  },
  robot: {
    src: "/about/hero-robot.jpg?v=2",
    alt: "Children gathered around a robot they have built",
  },
  project: {
    src: "/about/hero-project.jpg?v=2",
    alt: "Two students building a project together",
  },
  tablet: {
    src: "/about/hero-tablet.jpg?v=2",
    alt: "A young student working on a tablet",
  },
  team: {
    src: "/about/hero-team.jpg?v=2",
    alt: "A group of students collaborating",
  },
  solder: {
    src: "/about/hero-solder.jpg?v=2",
    alt: "A student soldering a circuit for a model",
  },
  classroom: {
    src: "/about/hero-classroom.jpg?v=2",
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
  // Negative margin cancels the layout top padding so this hero sits under the floating header.
  return (
    <section className="relative -mt-24 overflow-hidden bg-background px-6 pt-28 pb-24 sm:-mt-28 sm:pt-32 lg:pb-32">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <BandTexture pattern="contours" className="text-brand-deep/[0.06]" position="top-0 right-[-10%] h-full w-[70%]" />
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

      {/* The next band's colour rises into this hero, so the seam is not a white cap on that section. */}
      <BandDivider shape="blob" side="bottom" color="text-surface-alt" className="h-12 sm:h-16 lg:h-20" />
    </section>
  );
}
