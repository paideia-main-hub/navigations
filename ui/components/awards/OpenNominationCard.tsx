"use client";

import Link from "next/link";
import { useState } from "react";
import { layerLabels } from "@/domain/awards/types";
import type { AwardCategory } from "@/domain/awards/types";
import { resolveAwardCardImage } from "@/domain/awards/cardImage";

/** Extracted from the (server) awards page because an <img onError> handler
 * needs a Client Component boundary — not every open category has real
 * artwork yet, so this falls back to a plain tinted panel instead of a
 * broken-image icon. */
export function OpenNominationCard({ category }: { category: AwardCategory }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <Link
      href={`/awards/${category.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-brand-deep transition-colors hover:border-accent/60"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-black/20">
        {!imageFailed && (
          // eslint-disable-next-line @next/next/no-img-element -- static asset or Supabase public URL
          <img
            src={resolveAwardCardImage(category.imageUrl, category.slug)}
            alt=""
            aria-hidden="true"
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <span className="text-xs font-semibold tracking-wide text-accent uppercase">{layerLabels[category.layer]}</span>
        <span className="font-bold text-white">{category.title}</span>
        {category.description && <span className="line-clamp-2 text-sm text-brand-deep-muted">{category.description}</span>}
        <span className="mt-auto pt-2 text-sm font-semibold text-accent group-hover:underline">Submit a nomination →</span>
      </div>
    </Link>
  );
}
