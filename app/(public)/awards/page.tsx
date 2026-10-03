import { PageBanner } from "@/ui/components/marketing/PageBanner";
import { LayersRecognitionMark } from "@/ui/components/marketing/LayersRecognitionMark";
import { AwardsLayerBand } from "@/ui/components/awards/AwardsLayerBand";
import { AwardsExpandProvider } from "@/ui/components/awards/AwardExpandGrid";
import { AwardsSectionJump } from "@/ui/components/awards/AwardsSectionJump";
import { OpenNominationCard } from "@/ui/components/awards/OpenNominationCard";
import { AWARD_DETAILS } from "@/ui/components/awards/awardDetails";
import type { AwardLayer } from "@/domain/awards/types";
import { layerLabels } from "@/domain/awards/types";
import { withAwardCardImages } from "@/domain/awards/cardImage";
import { listSubmittableCategories, listCategories } from "@/domain/awards/service";
import { createClient } from "@/data/supabase/server";
import Link from "next/link";

export const metadata = { title: "Awards | Navigations" };

const LAYER_ORDER: AwardLayer[] = ["competition_distinction", "school_award", "spotlight", "teacher_parent", "sports"];

const JUMP_SECTIONS = [
  ...LAYER_ORDER.map((layer) => ({ id: layer, label: layerLabels[layer] })),
  { id: "open-nominations", label: "Open for nominations" },
];

const LAYER_INTRO: Record<AwardLayer, string> = {
  competition_distinction: "Awarded automatically from each competition's own results — nobody submits anything for these.",
  school_award: "Computed from League-wide participation and results, or (Collaboration & Integrity) scored directly by the organizer. Schools never nominate themselves.",
  spotlight: "School-nominated or fully independent — you don't have to win a League competition to submit.",
  teacher_parent:
    "Nomination-based acknowledgements with no competitive scoring — teachers, parents, and principals. Every complete, valid school nomination receives the teacher and parent awards; principal recognition follows the criteria on that card.",
  sports: "School-nominated, evidence-based recognition of sustained achievement over the last two years.",
  principal: "Up to 50 principals recognised for enabling participation and supporting League coordination.",
};

/**
 * Every band uses the same bottom wave as the awards hero (WaveCurvedBottom).
 * Warm netted sections keep showNet; the previous band spills a viewport-locked
 * angular lattice through that curve so the seam stays continuous.
 */
const LAYER_BAND: Record<
  AwardLayer,
  {
    bg: string;
    nextColor: string;
    /** Content shell vertical padding — tuned per band. */
    pad: string;
    showNet?: boolean;
    /** Continue the warm net through this section’s bottom wave. */
    spillWarmNet?: boolean;
  }
> = {
  competition_distinction: {
    bg: "bg-background",
    nextColor: "text-surface-warm",
    spillWarmNet: true,
    pad: "pt-10 pb-[10.5rem] sm:pt-12 sm:pb-48 lg:pt-14 lg:pb-[13.5rem]",
  },
  school_award: {
    bg: "bg-surface-warm",
    nextColor: "text-surface-alt",
    showNet: true,
    pad: "pt-16 pb-44 sm:pt-20 sm:pb-48 lg:pt-24 lg:pb-52",
  },
  spotlight: {
    bg: "bg-surface-alt",
    nextColor: "text-surface-warm",
    spillWarmNet: true,
    pad: "pt-14 pb-40 sm:pt-16 sm:pb-44 lg:pt-20 lg:pb-48",
  },
  teacher_parent: {
    bg: "bg-surface-warm",
    nextColor: "text-background",
    showNet: true,
    pad: "pt-14 pb-40 sm:pt-16 sm:pb-44 lg:pt-20 lg:pb-48",
  },
  sports: {
    bg: "bg-background",
    nextColor: "text-[#2a2c54]",
    pad: "pt-16 pb-40 sm:pt-20 sm:pb-44 lg:pt-24 lg:pb-48",
  },
  principal: {
    bg: "bg-surface-alt",
    nextColor: "text-[#2a2c54]",
    pad: "pt-20 pb-28 sm:pt-24 sm:pb-32 lg:pt-28 lg:pb-36",
  },
};

function awardsForLayer(layer: AwardLayer, categories: { slug: string; imageUrl: string | null }[]) {
  const base =
    layer === "teacher_parent"
      ? [
          ...AWARD_DETAILS.filter((a) => a.layer === "teacher_parent"),
          ...AWARD_DETAILS.filter((a) => a.layer === "principal"),
        ]
      : AWARD_DETAILS.filter((a) => a.layer === layer);

  return withAwardCardImages(base, categories);
}

export default async function AwardsLandingPage() {
  const supabase = await createClient();
  // Submittable, not just "open" — competition distinctions and school
  // awards are computed, never nominated, so they'd be misleading here even
  // when their category row happens to carry status "open".
  const openNow = await listSubmittableCategories(supabase);
  const openSlugs = new Set(openNow.map((c) => c.slug));
  const allCategories = await listCategories(supabase);

  return (
    <div className="bg-background">
      <PageBanner
        eyebrow="Awards and Recognition"
        title="Future Ready League Awards"
        subtitle="Future Ready League celebrates achievement, meaningful ideas, positive influence and the people who make participation possible. Five recognition layers honor competition performers, schools, individual contributors, supportive adults and student athletes."
        watermark={<LayersRecognitionMark align="right" tone="dark" />}
        className="-mt-24 pt-28 pb-28 sm:-mt-28 sm:pt-32 sm:pb-32 lg:pt-36 lg:pb-36"
        showNet
        netLattice="angular"
        curvedBottom
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/competitions"
            className="rounded-full border border-white/25 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-accent hover:bg-accent hover:text-accent-foreground"
          >
            Explore Competitions
          </Link>
          <Link
            href="/awards/results"
            className="rounded-full border border-white/25 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-accent hover:bg-accent hover:text-accent-foreground"
          >
            View Award Criteria &amp; Results
          </Link>
        </div>
        <p className="mt-4 max-w-2xl text-sm text-brand-deep-muted">
          This page explains every award on the platform. To submit or track a nomination, log in and go to{" "}
          <span className="font-semibold text-white">My Nominations</span> in your dashboard.
        </p>
      </PageBanner>

      <AwardsExpandProvider>
        {LAYER_ORDER.map((layer) => {
          const awards = awardsForLayer(layer, allCategories);
          const band = LAYER_BAND[layer];
          return (
            <AwardsLayerBand
              key={layer}
              layer={layer}
              intro={LAYER_INTRO[layer]}
              bg={band.bg}
              nextColor={band.nextColor}
              pad={band.pad}
              showNet={band.showNet}
              spillWarmNet={band.spillWarmNet}
              awards={awards}
              openSlugs={[...openSlugs]}
            />
          );
        })}
      </AwardsExpandProvider>

      {/* Open for nominations now — closing band, dark like the site's other
          bottom CTAs, so the page ends on the same note as every other one.
          Top edge is cut by the sports section’s wave above. */}
      <div id="open-nominations" className="relative scroll-mt-24 overflow-hidden bg-[#2a2c54] pt-16 pb-20 sm:pt-20">
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="text-xs font-semibold tracking-wider text-accent uppercase">Right now</p>
            <h2 className="mt-1 text-2xl font-bold text-white sm:text-3xl">Open for nominations</h2>
          </div>

          {openNow.length > 0 ? (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {openNow.map((c) => (
                <OpenNominationCard key={c.slug} category={c} />
              ))}
            </div>
          ) : (
            <p className="mt-10 text-center text-sm text-brand-deep-muted">No award categories are open for submissions right now.</p>
          )}
        </div>
      </div>

      <AwardsSectionJump sections={JUMP_SECTIONS} />
    </div>
  );
}
