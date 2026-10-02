"use client";

import { useMemo } from "react";
import type { AwardDetail } from "@/ui/components/awards/awardDetails";
import { AwardLayerIcon } from "@/ui/components/awards/awardIcons";
import { AwardExpandGrid, useAwardsExpand } from "@/ui/components/awards/AwardExpandGrid";
import { layerLabels, type AwardLayer } from "@/domain/awards/types";
import { BandDivider } from "@/ui/components/marketing/BandDivider";
import { WaveCurvedBottom } from "@/ui/components/marketing/WaveCurvedBottom";
import { SectionNet } from "@/ui/components/marketing/SectionNet";

/** One awards band. When a card is open it lifts above neighbouring sections
 * and is allowed to paint outside this band (no overflow clip). */
export function AwardsLayerBand({
  layer,
  intro,
  bg,
  nextColor,
  showNet,
  topSeamFrom,
  skipBottomWave,
  spillWarmNet,
  isFirst,
  awards,
  openSlugs,
}: {
  layer: AwardLayer;
  intro: string;
  bg: string;
  nextColor: string;
  showNet?: boolean;
  topSeamFrom?: string;
  skipBottomWave?: boolean;
  spillWarmNet?: boolean;
  isFirst: boolean;
  awards: AwardDetail[];
  openSlugs: string[];
}) {
  const expand = useAwardsExpand();
  const slugSet = useMemo(() => new Set(openSlugs), [openSlugs]);
  const cardOpen = Boolean(expand?.openSlug && awards.some((a) => a.slug === expand.openSlug));

  return (
    <div
      id={layer}
      className={`relative scroll-mt-24 overflow-visible ${bg} ${cardOpen ? "z-40" : "z-0"}`}
    >
      {showNet ? <SectionNet id={`awards-net-${layer}`} lattice="angular" /> : null}
      {topSeamFrom ? (
        <BandDivider shape="wave" side="top" color={topSeamFrom} className="h-10 sm:h-14 lg:h-20" />
      ) : null}
      {/* z-20: above BandDivider / wave spill (z-10 / z-[11]) so open cards aren’t sliced by the seam. */}
      <div
        className={`relative z-20 mx-auto max-w-5xl px-6 ${
          isFirst
            ? "pt-10 pb-32 sm:pt-12 sm:pb-36 lg:pt-14 lg:pb-40"
            : topSeamFrom
              ? "pt-24 pb-28 sm:pt-28 sm:pb-32 lg:pt-32 lg:pb-36"
              : "pt-20 pb-28 sm:pt-24 sm:pb-32 lg:pt-28 lg:pb-36"
        }`}
      >
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent text-accent-foreground shadow-[0_10px_22px_-12px_rgba(255,105,31,0.65)] ring-1 ring-accent/30">
            <AwardLayerIcon layer={layer} className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">{layerLabels[layer]}</h2>
            <p className="mt-1.5 max-w-2xl text-sm text-muted">{intro}</p>
          </div>
        </div>

        <div className="mt-8">
          <AwardExpandGrid awards={awards} openSlugs={slugSet} />
        </div>
      </div>
      {!skipBottomWave ? (
        <WaveCurvedBottom
          id={`awards-layer-${layer}`}
          nextColor={nextColor}
          spillWarmNet={spillWarmNet}
          spillLattice="angular"
        />
      ) : null}
    </div>
  );
}
