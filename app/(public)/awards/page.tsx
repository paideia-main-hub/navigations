import Link from "next/link";
import { createClient } from "@/data/supabase/server";
import { listSubmittableCategories } from "@/domain/awards/service";
import { layerLabels, type AwardLayer } from "@/domain/awards/types";
import { AWARD_DETAILS } from "@/ui/components/awards/awardDetails";
import { AwardLayerIcon } from "@/ui/components/awards/awardIcons";
import { AwardExpandGrid } from "@/ui/components/awards/AwardExpandGrid";
import { OpenNominationCard } from "@/ui/components/awards/OpenNominationCard";
import { PageBanner } from "@/ui/components/marketing/PageBanner";
import { BandDivider } from "@/ui/components/marketing/BandDivider";

export const metadata = { title: "Awards | Future Competence Series" };

const LAYER_ORDER: AwardLayer[] = ["competition_distinction", "school_award", "spotlight", "teacher_parent", "sports", "principal"];

const LAYER_INTRO: Record<AwardLayer, string> = {
  competition_distinction: "Awarded automatically from each competition's own results — nobody submits anything for these.",
  school_award: "Computed from League-wide participation and results, or (Collaboration & Integrity) scored directly by the organizer. Schools never nominate themselves.",
  spotlight: "School-nominated or fully independent — you don't have to win a League competition to submit.",
  teacher_parent: "Nomination-based acknowledgements with no competitive scoring. Every complete, valid school nomination receives the award.",
  sports: "School-nominated, evidence-based recognition of sustained achievement over the last two years.",
  principal: "Up to 50 principals recognised for enabling participation and supporting League coordination.",
};

/** Each layer section sits on its own tint, seamed to the one before it —
 * same "shaped seam" technique as the About page, cycling through a
 * different BandDivider shape each time so six sections in a row don't
 * repeat the same edge. */
const LAYER_BAND: Record<AwardLayer, { bg: string; seamShape: "wave" | "curve" | "arc" | "tilt" | "blob" | "dune"; seamFrom: string }> = {
  competition_distinction: { bg: "bg-background", seamShape: "wave", seamFrom: "text-background" },
  school_award: { bg: "bg-surface-warm", seamShape: "arc", seamFrom: "text-background" },
  spotlight: { bg: "bg-surface-alt", seamShape: "dune", seamFrom: "text-surface-warm" },
  teacher_parent: { bg: "bg-background", seamShape: "tilt", seamFrom: "text-surface-alt" },
  sports: { bg: "bg-surface-warm", seamShape: "curve", seamFrom: "text-background" },
  principal: { bg: "bg-surface-alt", seamShape: "blob", seamFrom: "text-surface-warm" },
};

export default async function AwardsLandingPage() {
  const supabase = await createClient();
  // Submittable, not just "open" — competition distinctions and school
  // awards are computed, never nominated, so they'd be misleading here even
  // when their category row happens to carry status "open".
  const openNow = await listSubmittableCategories(supabase);
  const openSlugs = new Set(openNow.map((c) => c.slug));

  return (
    <div className="bg-background">
      <PageBanner
        eyebrow="Awards and Recognition"
        title="Future Ready League Awards"
        subtitle="Future Ready League celebrates achievement, meaningful ideas, positive influence and the people who make participation possible. Five recognition layers honor competition performers, schools, individual contributors, supportive adults and student athletes."
      />

      {/* Stat strip + primary actions, directly under the banner. */}
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid grid-cols-3 gap-4 rounded-2xl border border-border bg-surface p-6 text-center sm:p-8">
          {[
            { value: LAYER_ORDER.length, label: "Recognition layers" },
            { value: AWARD_DETAILS.length, label: "Awards on the platform" },
            { value: openNow.length, label: "Open for nomination now" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-extrabold text-foreground sm:text-4xl">{s.value}</p>
              <p className="mt-1 text-xs font-medium text-muted sm:text-sm">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/competitions" className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:border-accent">
            Explore Competitions
          </Link>
          <Link href="/awards/results" className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:border-accent">
            View Award Criteria &amp; Results
          </Link>
        </div>
        <p className="mt-3 text-sm text-muted">
          This page explains every award on the platform. To submit or track a nomination, log in and go to{" "}
          <span className="font-semibold text-foreground">My Nominations</span> in your dashboard.
        </p>
      </div>

      {LAYER_ORDER.map((layer) => {
        const awards = AWARD_DETAILS.filter((a) => a.layer === layer);
        const band = LAYER_BAND[layer];
        return (
          // id lets the home page's "Ways to Participate" cards deep-link
          // straight to the layer they describe.
          <div key={layer} id={layer} className={`relative scroll-mt-24 overflow-hidden ${band.bg}`}>
            <BandDivider shape={band.seamShape} side="top" color={band.seamFrom} />
            <div className="relative mx-auto max-w-5xl px-6 pt-20 pb-16 sm:pt-24 lg:pt-28">
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent-strong">
                  <AwardLayerIcon layer={layer} className="h-6 w-6" />
                </span>
                <div>
                  <h2 className="text-xl font-bold text-foreground sm:text-2xl">{layerLabels[layer]}</h2>
                  <p className="mt-1.5 max-w-2xl text-sm text-muted">{LAYER_INTRO[layer]}</p>
                </div>
              </div>

              <div className="mt-8">
                <AwardExpandGrid awards={awards} openSlugs={openSlugs} />
              </div>
            </div>
          </div>
        );
      })}

      {/* Open for nominations now — closing band, dark like the site's other
          bottom CTAs, so the page ends on the same note as every other one. */}
      <div className="relative overflow-hidden bg-brand-deep px-6 pt-24 pb-20 sm:pt-28">
        <BandDivider shape="curve" side="top" color="text-surface-alt" />
        <div className="relative mx-auto max-w-6xl">
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
    </div>
  );
}
