import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { listMyRegistrations, deriveDisplayStatus, isRegistrationConcluded } from "@/domain/registrations/service";
import { getPublishedResultsFor } from "@/domain/results/service";
import { listCompetitions } from "@/domain/competitions/service";
import { RegistrationCard } from "@/ui/components/dashboard/RegistrationCard";
import { DashboardHero, dashboardHeroCtaClass } from "@/ui/components/dashboard/DashboardHero";
import { DashboardPage } from "@/ui/components/dashboard/DashboardShell";

export default async function MyCompetitionsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.role !== "student") redirect("/dashboard");

  const supabase = await createClient();
  const [allRegistrations, allCompetitions] = await Promise.all([
    listMyRegistrations(supabase, user.id),
    listCompetitions(supabase),
  ]);
  const competitionsBySlug = new Map(allCompetitions.map((c) => [c.slug, c]));
  const results = await getPublishedResultsFor(supabase, allRegistrations.map((r) => r.id));
  const registrations = allRegistrations.filter(
    (r) => !isRegistrationConcluded(r, competitionsBySlug.get(r.competitionSlug), results.has(r.id)),
  );
  const hasRegistration = allRegistrations.some((r) => r.status !== "rejected");

  return (
    <>
      <DashboardHero
        eyebrow="Competitions"
        title="My Competitions"
        subtitle={
          <>
            Everything you&apos;re actively registered for. Concluded events move to{" "}
            <Link href="/dashboard/history" prefetch>History &amp; Results</Link>.
          </>
        }
      />
      <DashboardPage>
      <div className="mt-6 flex justify-end">
        <Link href="/dashboard/register" prefetch className={dashboardHeroCtaClass}>
          {hasRegistration ? "Register for more competitions" : "Register for competitions"}
        </Link>
      </div>
      <div className="mt-4 space-y-4">
        {registrations.map((r) => (
          <RegistrationCard
            key={r.id}
            registration={r}
            competition={competitionsBySlug.get(r.competitionSlug)}
            result={results.get(r.id)}
            status={deriveDisplayStatus(r, competitionsBySlug.get(r.competitionSlug))}
          />
        ))}
        {registrations.length === 0 && (
          <div className="rounded-xl border border-border bg-surface p-8 text-center text-muted">
            {allRegistrations.length === 0
              ? "You haven't registered for any competitions yet."
              : "Nothing active right now — check History & Results for past competitions."}
          </div>
        )}
      </div>
      </DashboardPage>
    </>
  );
}
