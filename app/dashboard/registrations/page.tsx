import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { getCoordinatorSchool } from "@/domain/schools/service";
import { listSchoolRegistrations, isRegistrationConcluded } from "@/domain/registrations/service";
import { registrationDeadlineOf, finalEventDateOf, listCompetitions } from "@/domain/competitions/service";
import { listAllAnnouncements } from "@/domain/announcements/service";
import type { Announcement } from "@/domain/announcements/types";
import { getPublishedResultsFor } from "@/domain/results/service";
import { HistoryTable } from "@/ui/components/dashboard/HistoryTable";

function groupAnnouncementsByCompetition(announcements: Announcement[]): Map<string, Announcement[]> {
  const map = new Map<string, Announcement[]>();
  for (const a of announcements) {
    if (!a.competitionSlug) continue;
    const list = map.get(a.competitionSlug) ?? [];
    list.push(a);
    map.set(a.competitionSlug, list);
  }
  return map;
}

export default async function RegistrationsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.role !== "school_coordinator") redirect("/dashboard");

  const supabase = await createClient();
  const school = await getCoordinatorSchool(supabase, user.id);
  if (!school) return <p className="text-muted">No school found for this coordinator account.</p>;

  const [allRegistrations, allCompetitions, allAnnouncements] = await Promise.all([
    listSchoolRegistrations(supabase, school.id),
    listCompetitions(supabase),
    listAllAnnouncements(supabase),
  ]);
  const competitionsBySlug = new Map(allCompetitions.map((c) => [c.slug, c]));
  const allResults = await getPublishedResultsFor(supabase, allRegistrations.map((r) => r.id));
  const registrations = allRegistrations.filter(
    (r) => !isRegistrationConcluded(r, competitionsBySlug.get(r.competitionSlug), allResults.has(r.id)),
  );

  const registeredSlugs = new Set(registrations.map((r) => r.competitionSlug));
  const registeredCompetitions = allCompetitions.filter((c) => registeredSlugs.has(c.slug));
  const announcementsByCompetition = groupAnnouncementsByCompetition(allAnnouncements);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground">Registrations</h1>
        <Link
          href="/dashboard/register"
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90"
        >
          Register a student or team
        </Link>
      </div>
      <p className="mt-2 max-w-2xl text-muted">
        Every student and team still active in a competition. Once a competition concludes, it moves to{" "}
        <Link href="/dashboard/history" className="font-semibold text-accent">
          History &amp; Results
        </Link>
        .
      </p>

      <div className="mt-6">
        <HistoryTable
          registrations={registrations}
          results={allResults}
          exportFilename={`${school.officialName}-registrations.csv`}
          exportLabel="Export registrations (CSV)"
          emptyMessage="Nothing active right now — check History & Results for past competitions."
        />
      </div>

      {registeredCompetitions.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Deadlines & Announcements</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {registeredCompetitions.map((c) => {
              const deadline = registrationDeadlineOf(c);
              const event = finalEventDateOf(c);
              return (
                <div key={c.slug} className="rounded-xl border border-border bg-surface p-4">
                  <Link href={`/competitions/${c.slug}`} className="font-semibold text-foreground hover:text-accent">
                    {c.title}
                  </Link>
                  <p className="mt-1 text-sm text-muted">
                    {deadline && `Registration closes ${new Date(deadline).toLocaleDateString()}`}
                    {deadline && event && " · "}
                    {event && `Event ${new Date(event).toLocaleDateString()}`}
                    {!deadline && !event && "Dates not yet scheduled"}
                  </p>
                  {(announcementsByCompetition.get(c.slug) ?? []).slice(0, 2).map((a) => (
                    <p key={a.id} className="mt-2 text-xs text-muted">
                      <span className="font-medium text-foreground">{a.title}:</span> {a.body}
                    </p>
                  ))}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
