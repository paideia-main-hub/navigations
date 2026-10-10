import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { getCoordinatorSchool } from "@/domain/schools/service";
import { listSchoolRegistrations, listMyRegistrations, isRegistrationConcluded } from "@/domain/registrations/service";
import { listCompetitions } from "@/domain/competitions/service";
import { getPublishedResultsFor } from "@/domain/results/service";
import type { Registration } from "@/domain/registrations/types";
import type { ResultInfo } from "@/domain/results/types";
import type { AwardType } from "@/domain/competitions/types";
import { awardLabels } from "@/domain/competitions/types";
import { HistoryTable } from "@/ui/components/dashboard/HistoryTable";
import { Badge } from "@/ui/components/Badge";
import { DashboardHero } from "@/ui/components/dashboard/DashboardHero";
import { DashboardPage } from "@/ui/components/dashboard/DashboardShell";

export default async function HistoryPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.role !== "student" && user.role !== "school_coordinator") redirect("/dashboard");

  const supabase = await createClient();

  if (user.role === "school_coordinator") {
    const school = await getCoordinatorSchool(supabase, user.id);
    if (!school) {
      return (
        <DashboardPage>
          <p className="text-muted">No school found for this coordinator account.</p>
        </DashboardPage>
      );
    }

    const [allRegistrations, allCompetitions] = await Promise.all([
      listSchoolRegistrations(supabase, school.id),
      listCompetitions(supabase),
    ]);
    const competitionsBySlug = new Map(allCompetitions.map((c) => [c.slug, c]));
    const allResults = await getPublishedResultsFor(supabase, allRegistrations.map((r) => r.id));
    const registrations = allRegistrations.filter((r) =>
      isRegistrationConcluded(r, competitionsBySlug.get(r.competitionSlug), allResults.has(r.id)),
    );
    const winners = registrations
      .map((r) => ({ registration: r, result: allResults.get(r.id) }))
      .filter((w): w is { registration: Registration; result: ResultInfo } => Boolean(w.result?.award));

    return (
      <>
        <DashboardHero
          eyebrow="Results"
          title="History & Results"
          subtitle={
            <>
              Concluded competitions for {school.officialName}. Active entries stay on{" "}
              <Link href="/dashboard/registrations" prefetch>Registrations</Link>.
            </>
          }
        />
        <DashboardPage>
          {winners.length > 0 && (
            <section className="mt-6">
              <h2 className="mb-3 text-lg font-semibold text-foreground">Winners</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {winners.map(({ registration: r, result }) => (
                  <div key={r.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4">
                    {result.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- admin-controlled Supabase Storage / profile photo URL
                      <img src={result.photoUrl} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
                    ) : (
                      <div className="h-12 w-12 shrink-0 rounded-full bg-surface-muted" />
                    )}
                    <div>
                      <Badge tone="success">{result.customAwardLabel ?? (result.award ? awardLabels[result.award as AwardType] : "Released")}</Badge>
                      <p className="mt-1 font-semibold text-foreground">{r.entrantName}</p>
                      <p className="text-xs text-muted">{r.competitionTitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="mt-6">
            <HistoryTable registrations={registrations} results={allResults} exportFilename={`${school.officialName}-history.csv`} />
          </div>
        </DashboardPage>
      </>
    );
  }

  const [allRegistrations, allCompetitions] = await Promise.all([listMyRegistrations(supabase, user.id), listCompetitions(supabase)]);
  const competitionsBySlug = new Map(allCompetitions.map((c) => [c.slug, c]));
  const allResults = await getPublishedResultsFor(supabase, allRegistrations.map((r) => r.id));
  const registrations = allRegistrations.filter((r) =>
    isRegistrationConcluded(r, competitionsBySlug.get(r.competitionSlug), allResults.has(r.id)),
  );

  return (
    <>
      <DashboardHero
        eyebrow="Results"
        title="History & Results"
        subtitle={
          <>
            Concluded competitions and published results. Active entries stay on{" "}
            <Link href="/dashboard/competitions" prefetch>My Competitions</Link>.
          </>
        }
      />
      <DashboardPage>
        <div>
          <HistoryTable registrations={registrations} results={allResults} exportFilename={`${user.fullName}-history.csv`} />
        </div>
      </DashboardPage>
    </>
  );
}
