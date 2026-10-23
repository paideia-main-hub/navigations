import { createClient } from "@/data/supabase/server";
import { listCompetitionIndex } from "@/domain/competitions/service";
import { manualTypeLabels, type ManualType } from "@/domain/competitions/types";
import { pageMetadata } from "@/lib/seo";
import { ClosingCta } from "@/ui/components/marketing/ClosingCta";
import { ManualsLibrary } from "@/ui/components/marketing/ManualsLibrary";
import { PageBanner } from "@/ui/components/marketing/PageBanner";

export const metadata = pageMetadata({
  title: "Manuals & Guidelines",
  description: "Competition manuals, registration rules, and guiding principles for Future Ready League events.",
  path: "/manuals",
});

const DOC_STACK: { type: ManualType; short: string }[] = [
  { type: "registration_rules", short: "Who can enter" },
  { type: "guiding_principles", short: "How to compete fairly" },
  { type: "complete_manual", short: "Full brief & stages" },
  { type: "judging_rubric", short: "How marks are won" },
];

function ManualsDocStack() {
  /** Cascading “drop” — each sheet offset enough that corners and edges read clearly. */
  const sheets = [
    { left: "0%", top: "0%", rotate: "-8deg", z: 1 },
    { left: "10%", top: "14%", rotate: "-3deg", z: 2 },
    { left: "20%", top: "28%", rotate: "2deg", z: 3 },
    { left: "30%", top: "42%", rotate: "7deg", z: 4 },
  ] as const;

  return (
    <div
      className="relative h-[13.5rem] w-[15.5rem] sm:h-[14.5rem] sm:w-[17.5rem] lg:h-[15rem] lg:w-[18.5rem]"
      aria-hidden="true"
    >
      {DOC_STACK.map((doc, index) => {
        const sheet = sheets[index];
        return (
          <div
            key={doc.type}
            className="absolute w-[68%] rounded-xl border border-border bg-surface px-3.5 py-3 shadow-[0_18px_36px_-20px_rgba(0,0,0,0.65)] sm:rounded-2xl sm:px-4 sm:py-3.5"
            style={{
              left: sheet.left,
              top: sheet.top,
              transform: `rotate(${sheet.rotate})`,
              zIndex: sheet.z,
            }}
          >
            <span className="block h-1.5 w-8 rounded-full bg-accent" />
            <p className="font-heading mt-2.5 text-xs font-extrabold leading-snug text-foreground sm:text-sm">
              {manualTypeLabels[doc.type]}
            </p>
            <p className="mt-0.5 text-[0.7rem] leading-snug text-muted sm:text-xs">{doc.short}</p>
          </div>
        );
      })}
    </div>
  );
}

export default async function ManualsPage() {
  const supabase = await createClient();
  const competitions = await listCompetitionIndex(supabase);

  return (
    <div className="bg-background">
      <PageBanner
        eyebrow="Manuals & Rulebook"
        title="Manuals & Guidelines"
        subtitle="The season’s official documents in one place — eligibility rules, guiding principles, complete manuals and judging rubrics. Open any competition below to download what is published on its Manual tab."
        className="-mt-24 pt-24 pb-20 sm:-mt-28 sm:pt-28 sm:pb-24 lg:pt-28 lg:pb-28"
        showNet
        netLattice="angular"
        curvedBottom
        aside={<ManualsDocStack />}
      />

      <section className="px-6 py-16 sm:py-20 lg:py-24" aria-labelledby="manuals-library-heading">
        <div className="mx-auto max-w-7xl">
          <h2 id="manuals-library-heading" className="sr-only">
            Competition manuals library
          </h2>
          <ManualsLibrary competitions={competitions} />
        </div>
      </section>

      <ClosingCta secondaryHref="/competitions" secondaryLabel="Browse competitions" />
    </div>
  );
}
