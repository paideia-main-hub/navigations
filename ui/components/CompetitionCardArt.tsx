"use client";

import { useState } from "react";
import { resolveCompetitionCardImage } from "@/domain/competitions/cardImage";

/** Card hero: admin-uploaded Supabase WebP, or a neutral placeholder when empty. */
export function CompetitionCardArt({ imageUrl, title }: { imageUrl: string | null; title: string }) {
  const src = resolveCompetitionCardImage(imageUrl);
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative aspect-[16/9] overflow-hidden bg-surface-muted">
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
        <div className="flex h-full w-full items-center justify-center bg-brand-deep px-6">
          <span className="text-center text-sm font-semibold text-brand-deep-foreground/70">{title}</span>
        </div>
      )}
    </div>
  );
}
