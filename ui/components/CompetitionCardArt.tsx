"use client";

import { useState } from "react";
import { resolveCompetitionCardImage } from "@/domain/competitions/cardImage";

/** Card hero, framed exactly like the award cards on /awards
 * (OpenNominationCard): a 16:9 frame the image fills, centred, with a slight
 * zoom on hover. The League artwork is 4:5 like the award artwork, so it
 * reads the same way. A neutral placeholder with the title stands in when
 * there's no image. */
export function CompetitionCardArt({ imageUrl, title }: { imageUrl: string | null; title: string }) {
  const src = resolveCompetitionCardImage(imageUrl);
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden bg-brand-deep">
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element -- public Supabase Storage URL
        <img
          src={src}
          alt=""
          aria-hidden="true"
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      ) : (
        <span className="px-6 text-center text-sm font-semibold text-brand-deep-foreground/70">{title}</span>
      )}
    </div>
  );
}
