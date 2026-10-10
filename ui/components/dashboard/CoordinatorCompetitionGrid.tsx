"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/ui/components/Badge";

export type RegisterCompetitionCard = {
  slug: string;
  title: string;
  domain: string;
  statusLabel: string;
  open: boolean;
  categories: string[];
};

export function CoordinatorCompetitionGrid({ competitions }: { competitions: RegisterCompetitionCard[] }) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const shown = useMemo(
    () => (needle ? competitions.filter((competition) => competition.title.toLowerCase().includes(needle)) : competitions),
    [competitions, needle],
  );

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">Register</h2>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search competitions"
          aria-label="Search competitions"
          className="h-[38px] w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted focus:border-accent sm:w-64"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((competition) => (
          <div key={competition.slug} className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between gap-2">
              <Badge>{competition.domain}</Badge>
              <Badge tone={competition.open ? "success" : "warning"}>{competition.statusLabel}</Badge>
            </div>
            <p className="font-semibold text-foreground">{competition.title}</p>
            <div className="flex flex-wrap gap-1">
              {competition.categories.map((category) => (
                <span key={category} className="rounded-md bg-surface-muted px-2 py-0.5 text-xs text-muted">
                  {category}
                </span>
              ))}
            </div>
            <Link
              href={`/dashboard/register/${competition.slug}`}
              prefetch
              className="mt-auto inline-block cursor-pointer rounded-full bg-accent px-4 py-2 text-center text-sm font-semibold text-accent-foreground hover:opacity-90"
            >
              Start registration
            </Link>
          </div>
        ))}
      </div>
      {shown.length === 0 ? (
        <p className="mt-4 text-sm text-muted">
          {competitions.length === 0 ? "No competitions are open for registration right now." : `No competitions match “${query.trim()}”.`}
        </p>
      ) : null}
    </>
  );
}
