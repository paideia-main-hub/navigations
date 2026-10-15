"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Registration, DisplayStatus } from "@/domain/registrations/types";
import type { CompetitionSummary } from "@/domain/competitions/types";
import type { ResultInfo } from "@/domain/results/types";
import type { PaymentStatus } from "@/domain/payments/types";
import { RegistrationCard, type CardEntrant } from "@/ui/components/dashboard/RegistrationCard";
import { dashboardHeroCtaClass } from "@/ui/components/dashboard/DashboardHero";

export type MyCompetitionItem = {
  key: string;
  registration: Registration;
  competition: CompetitionSummary | undefined;
  result: ResultInfo | undefined;
  status: DisplayStatus;
  entrants?: CardEntrant[];
  paymentStatus?: PaymentStatus | null;
  /** Extra text included in search (e.g. entrant names). */
  searchText?: string;
};

export function MyCompetitionsPanel({
  items,
  registerLabel,
  emptyMessage,
}: {
  items: MyCompetitionItem[];
  registerLabel: string;
  emptyMessage: string;
}) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!needle) return items;
    return items.filter((item) => {
      const haystack = [
        item.registration.competitionTitle,
        item.registration.competitionSlug,
        item.competition?.title,
        item.competition?.domain,
        item.searchText,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [items, needle]);

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/dashboard/register" prefetch className={`${dashboardHeroCtaClass} w-full sm:w-auto`}>
          {registerLabel}
        </Link>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search competitions"
          aria-label="Search competitions"
          className="h-[38px] w-full rounded-lg border border-accent/30 bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted focus:border-accent sm:max-w-xs sm:flex-1"
        />
      </div>

      <div className="mt-4 space-y-4">
        {filtered.map((item) => (
          <RegistrationCard
            key={item.key}
            registration={item.registration}
            competition={item.competition}
            result={item.result}
            status={item.status}
            entrants={item.entrants}
            paymentStatus={item.paymentStatus}
          />
        ))}
        {items.length === 0 ? (
          <div className="rounded-xl border border-accent/30 bg-surface p-8 text-center text-muted">{emptyMessage}</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-accent/30 bg-surface p-8 text-center text-muted">
            No competitions match “{query.trim()}”.
          </div>
        ) : null}
      </div>
    </>
  );
}
