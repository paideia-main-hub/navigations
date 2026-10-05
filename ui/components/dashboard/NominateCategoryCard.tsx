"use client";

import Link from "next/link";
import { useState } from "react";
import { layerLabels, type AwardCategory } from "@/domain/awards/types";
import { resolveAwardCardImage } from "@/domain/awards/cardImage";

export function NominateCategoryCard({ category }: { category: AwardCategory }) {
  const [imageFailed, setImageFailed] = useState(false);
  const schoolOnly = !category.allowsIndependent;

  return (
    <Link
      href={`/dashboard/nominate/${category.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_18px_40px_-36px_rgba(31,32,65,0.55)] transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_28px_50px_-34px_rgba(31,32,65,0.55)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-brand-deep">
        {!imageFailed ? (
          // eslint-disable-next-line @next/next/no-img-element -- static asset or Supabase public URL
          <img
            src={resolveAwardCardImage(category.imageUrl, category.slug)}
            alt=""
            aria-hidden="true"
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,105,31,0.35),transparent_55%),linear-gradient(135deg,#1f2041_0%,#2a2c54_100%)]"
          />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-brand-deep/85 via-brand-deep/20 to-transparent"
        />
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center gap-2 p-4">
          <span className="rounded-full bg-white/12 px-2.5 py-1 text-[10px] font-bold tracking-[0.14em] text-accent uppercase backdrop-blur-sm">
            {layerLabels[category.layer]}
          </span>
          {schoolOnly ? (
            <span className="rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold tracking-wide text-accent-foreground uppercase">
              School account required
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h2 className="font-heading text-lg font-extrabold tracking-tight text-foreground">
          {category.title}
        </h2>
        {category.description ? (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{category.description}</p>
        ) : null}
        <span className="mt-auto pt-5 inline-flex items-center gap-1.5 text-sm font-bold text-accent-strong transition-colors group-hover:text-accent">
          Start nomination
          <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
