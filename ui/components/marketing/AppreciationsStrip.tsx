import type { ReactNode } from "react";
import type { Appreciation } from "@/domain/appreciations/types";

const PAPER_IMAGE =
  "linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0) 22%, rgba(255,255,255,0) 78%, rgba(80,50,20,0.08)), url(/sticky-paper.jpg)";

const NOTE_SHADOW =
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.7),inset_0_-12px_16px_rgba(90,60,20,0.06),0_2px_3px_rgba(50,30,12,0.16),0_14px_18px_rgba(50,30,12,0.2)]";

const NOTES = [
  { color: "#f4ecd2", pin: "#c9843f", tilt: "sm:translate-y-2 sm:-rotate-1" },
  { color: "#f6c4d1", pin: "#e07a93", tilt: "sm:-translate-y-1 sm:rotate-1" },
  { color: "#f8e49a", pin: "#e0b03a", tilt: "sm:translate-y-3 sm:-rotate-[0.6deg]" },
  { color: "#d5f1e7", pin: "#6ec4ae", tilt: "sm:-translate-y-2 sm:rotate-[1.1deg]" },
];

function paperStyle(color: string) {
  return {
    backgroundColor: color,
    backgroundImage: PAPER_IMAGE,
    backgroundBlendMode: "soft-light, multiply" as const,
    backgroundSize: "cover",
  };
}

function Pin({ color }: { color: string }) {
  return (
    <span aria-hidden="true" className="absolute top-3 left-1/2 -translate-x-1/2">
      <span
        className="block h-4 w-4 rounded-full"
        style={{
          background: `radial-gradient(circle at 32% 28%, #fff 0 2px, ${color} 3px, #4a3024 78%, #2a1a14 100%)`,
          boxShadow: "inset 0 1px 1px rgba(255,255,255,0.8), 0 2px 3px rgba(40,24,12,0.45)",
        }}
      />
      <span className="mx-auto mt-px block h-1 w-2.5 rounded-full bg-black/25 blur-[0.5px]" />
    </span>
  );
}

export function AppreciationsStrip({ appreciations }: { appreciations: Appreciation[] }): ReactNode {
  const shown = appreciations.slice(0, 4);
  if (shown.length === 0) return null;

  return (
    <section className="bg-background px-3 py-14 sm:px-6 sm:py-16">
      <div
        className="p-4 shadow-[inset_2px_2px_0_rgba(255,255,255,0.85),inset_-3px_-4px_6px_rgba(120,100,80,0.28),0_16px_32px_rgba(40,24,8,0.22)] sm:p-6"
        style={{
          backgroundColor: "#efe6d6",
          backgroundImage: "url(/wood-grain.jpg)",
          backgroundSize: "560px",
          backgroundBlendMode: "multiply",
        }}
      >
        <div className="bg-[#c4a574] bg-[url('/jute-burlap.jpg')] bg-[length:560px] bg-repeat pt-20 pb-32 shadow-[inset_0_0_0_1px_rgba(90,70,50,0.18),inset_0_6px_14px_rgba(60,40,20,0.12)]">
          <div className="mx-auto max-w-7xl px-6">
        <div className="flex justify-center">
          <h2
            className={`relative inline-flex w-fit -rotate-1 items-center gap-3 px-8 pt-8 pb-4 text-2xl font-bold text-[#3a2a1c] sm:text-3xl ${NOTE_SHADOW}`}
            style={paperStyle("#f7e7a8")}
          >
            <Pin color="#e0b03a" />
            <span aria-hidden="true" className="h-0.5 w-8 bg-accent" />
            Appreciations
          </h2>
        </div>
        <ul className="mx-auto mt-12 grid max-w-sm items-start gap-x-4 gap-y-10 sm:max-w-none sm:grid-cols-2 xl:grid-cols-4">
          {shown.map((item, index) => {
            const note = NOTES[index % NOTES.length];
            return (
              <li
                key={item.id}
                className={`relative flex flex-col rounded-sm px-5 pt-9 pb-6 ${NOTE_SHADOW} ${note.tilt}`}
                style={paperStyle(note.color)}
              >
                <Pin color={note.pin} />
                <h3 className="text-xl leading-snug font-bold text-[#3a2a1c]">{item.heading}</h3>
                <p className="mt-3 text-sm leading-6 font-medium text-[#3a2a1c]">{item.description}</p>
                <p className="mt-4 text-sm font-bold text-[#3a2a1c]">{item.schoolNames}</p>
                <p className="mt-1 text-sm font-normal text-[#3a2a1c]">By: {item.byLine}</p>
              </li>
            );
          })}
        </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
