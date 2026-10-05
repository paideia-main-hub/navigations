import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { listOpenCategories } from "@/domain/awards/service";
import { NominateCategoryCard } from "@/ui/components/dashboard/NominateCategoryCard";
import { DashboardHero } from "@/ui/components/dashboard/DashboardHero";
import { DashboardPage } from "@/ui/components/dashboard/DashboardShell";

export default async function NominateCategoryPickerPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/nominate");
  if (user.role === "judge" || user.role === "admin") redirect("/dashboard");

  const supabase = await createClient();
  const allOpen = await listOpenCategories(supabase);
  // Competition Distinctions and School Awards are computed, never
  // submitted, by anyone — everything else is listed here regardless of
  // role, same as the Competitions directory lists every competition
  // regardless of a visitor's grade. Eligibility (school vs. independent)
  // is checked on the submission page itself, not by hiding the category.
  const nominatable = allOpen.filter(
    (c) => c.status === "open" && c.layer !== "competition_distinction" && c.layer !== "school_award",
  );

  return (
    <>
      <DashboardHero
        eyebrow="Awards & recognition"
        title="Start a Nomination"
        subtitle={
          <>
            Every award category currently open. Categories marked{" "}
            <span className="font-semibold text-accent">School account required</span> must be submitted by a
            school coordinator.
          </>
        }
      >
        {nominatable.length > 0 ? (
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-brand-deep-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
            {nominatable.length} open {nominatable.length === 1 ? "category" : "categories"}
          </p>
        ) : null}
      </DashboardHero>
      <DashboardPage>
      {nominatable.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {nominatable.map((category) => (
            <NominateCategoryCard key={category.id} category={category} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-14 text-center">
          <p className="font-heading text-lg font-bold text-foreground">No categories open right now</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Check back when award categories are opened for nominations, or review the full awards list
            meanwhile.
          </p>
          <Link
            href="/awards"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-foreground hover:opacity-90"
          >
            Browse awards
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      )}

      <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-surface-warm/60 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
        <p className="text-sm text-muted">
          Want the full criteria and eligibility details first?
        </p>
        <Link
          href="/awards"
          className="inline-flex items-center gap-2 text-sm font-bold text-accent-strong transition-colors hover:text-accent"
        >
          Read about every award
          <span aria-hidden="true">→</span>
        </Link>
      </div>
      </DashboardPage>
    </>
  );
}
