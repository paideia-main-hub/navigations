import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { listMyRegistrations, deriveDisplayStatus, isRegistrationConcluded } from "@/domain/registrations/service";
import { getPublishedResultsFor } from "@/domain/results/service";
import { listCompetitions } from "@/domain/competitions/service";
import { RegistrationCard } from "@/ui/components/dashboard/RegistrationCard";

export default async function MyCompetitionsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.role !== "student") redirect("/dashboard");

  const supabase = await createClient();
  const [allRegistrations, allCompetitions] = await Promise.all([listMyRegistrations(supabase, user.id), listCompetitions(supabase)]);
  const competitionsBySlug = new Map(allCompetitions.map((c) => [c.slug, c]));
  const results = await getPublishedResultsFor(supabase, allRegistrations.map((r) => r.id));
  const registrations = allRegistrations.filter(
    (r) => !isRegistrationConcluded(r, competitionsBySlug.get(r.competitionSlug), results.has(r.id)),
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground">My Competitions</h1>
        <Link
          href="/dashboard/register"
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90"
        >
          Register for a competition
        </Link>
      </div>
      <p className="mt-2 max-w-2xl text-muted">
        Everything you&apos;re actively registered for. Once a competition wraps up, it moves to{" "}
        <Link href="/dashboard/history" className="font-semibold text-accent">
          History &amp; Results
        </Link>
        .
      </p>

      <div className="mt-6 space-y-4">
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
    </div>
  );
}
