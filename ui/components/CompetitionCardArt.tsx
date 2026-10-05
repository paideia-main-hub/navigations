"use client";

import { useState } from "react";
import { resolveCompetitionCardImage } from "@/domain/competitions/cardImage";

/** Card hero: 16:9 plus 10px of height, image fills the frame with a slight
 * zoom on hover. A neutral placeholder with the title stands in when there's
 * no image. */
export function CompetitionCardArt({ imageUrl, title }: { imageUrl: string | null; title: string }) {
  const src = resolveCompetitionCardImage(imageUrl);
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative flex w-full items-center justify-center overflow-hidden bg-brand-deep pt-[calc(56.25%+10px)]">
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element -- public Supabase Storage URL
        <img
          src={src}
          alt=""
          aria-hidden="true"
          loading="lazy"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-300 ease-out group-hover:scale-[1.04]"
        />
      ) : (
        <span className="absolute inset-0 grid place-items-center px-6 text-center text-sm font-semibold text-brand-deep-foreground/70">
          {title}
        </span>
      )}
    </div>
  );
}
