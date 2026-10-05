import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { listMyRegistrations, deriveDisplayStatus, isRegistrationConcluded } from "@/domain/registrations/service";
import { getPublishedResultsFor } from "@/domain/results/service";
import { listCompetitions, listOpenAndUpcoming } from "@/domain/competitions/service";
import { getOwnStudentProfile } from "@/domain/students/service";
import { RegistrationCard } from "@/ui/components/dashboard/RegistrationCard";
import { CompetitionBasket } from "@/ui/components/dashboard/CompetitionBasket";
import { DashboardHero, dashboardHeroCtaClass } from "@/ui/components/dashboard/DashboardHero";
import { DashboardPage } from "@/ui/components/dashboard/DashboardShell";

export default async function MyCompetitionsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.role !== "student") redirect("/dashboard");

  const supabase = await createClient();
  const [allRegistrations, allCompetitions, openCompetitions, student] = await Promise.all([
    listMyRegistrations(supabase, user.id),
    listCompetitions(supabase),
    listOpenAndUpcoming(supabase),
    getOwnStudentProfile(supabase, user.id),
  ]);
  const competitionsBySlug = new Map(allCompetitions.map((c) => [c.slug, c]));
  const results = await getPublishedResultsFor(supabase, allRegistrations.map((r) => r.id));
  const registrations = allRegistrations.filter(
    (r) => !isRegistrationConcluded(r, competitionsBySlug.get(r.competitionSlug), results.has(r.id)),
  );
  // A rejected registration doesn't block registering for that competition again.
  const registeredSlugs = allRegistrations.filter((r) => r.status !== "rejected").map((r) => r.competitionSlug);

  return (
    <>
      <DashboardHero
        eyebrow="Competitions"
        title="My Competitions"
        subtitle={
          <>
            Everything you&apos;re actively registered for. Concluded events move to{" "}
            <Link href="/dashboard/history">History &amp; Results</Link>.
          </>
        }
      >
        <a href="#register" className={dashboardHeroCtaClass}>
          Register for competitions
        </a>
      </DashboardHero>
      <DashboardPage>
      {student?.frlId && (
        <div className="mt-4 inline-flex flex-wrap items-center gap-3 rounded-xl border border-accent/40 bg-accent-soft px-4 py-3">
          <Link href="/dashboard/account" title="Profile photo — view or change" className="shrink-0">
            {student.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- public Supabase Storage URL
              <img src={student.photoUrl} alt="Your profile photo" className="h-10 w-10 rounded-full object-cover ring-2 ring-surface" />
            ) : (
              <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-deep text-sm font-bold text-brand-deep-foreground ring-2 ring-surface">
                {student.fullName
                  .split(/\s+/)
                  .filter(Boolean)
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </span>
            )}
          </Link>
          <span className="text-xs font-semibold tracking-[0.14em] text-accent-strong uppercase">Your League ID</span>
          <span className="font-mono text-lg font-bold text-foreground">{student.frlId}</span>
          <span className="text-xs text-muted">Used for every competition you enter.</span>
        </div>
      )}

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
              ? "You haven't registered for any competitions yet — pick some below."
              : "Nothing active right now — check History & Results for past competitions."}
          </div>
        )}
      </div>

      <section id="register" className="mt-12 scroll-mt-24">
        <h2 className="text-xl font-bold text-foreground">Register for competitions</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Add as many competitions as you like, then check out once: confirm your details, give consent, and pay one total with a
          single receipt.
        </p>
        <div className="mt-5">
          {student ? (
            <CompetitionBasket
              competitions={openCompetitions}
              registeredSlugs={registeredSlugs}
              student={{
                fullName: student.fullName,
                frlId: student.frlId,
                grade: student.grade,
                schoolName: student.schoolName ?? null,
              }}
            />
          ) : (
            <p className="rounded-xl border border-border bg-surface p-6 text-sm text-muted">
              No student profile is linked to this account yet, so registration isn&apos;t available.
            </p>
          )}
        </div>
      </section>
      </DashboardPage>
    </>
  );
}
