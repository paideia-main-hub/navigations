import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { getCoordinatorSchool } from "@/domain/schools/service";
import { listMyRegistrations, listSchoolRegistrations, deriveDisplayStatus, isRegistrationConcluded } from "@/domain/registrations/service";
import type { PaymentStatus } from "@/domain/payments/types";
import { registrationListStatus, type Registration } from "@/domain/registrations/types";
import { getPublishedResultsFor } from "@/domain/results/service";
import { listCompetitions } from "@/domain/competitions/service";
import type { CardEntrant } from "@/ui/components/dashboard/RegistrationCard";
import { MyCompetitionsPanel } from "@/ui/components/dashboard/MyCompetitionsPanel";
import { DashboardHero } from "@/ui/components/dashboard/DashboardHero";
import { DashboardPage } from "@/ui/components/dashboard/DashboardShell";

function paymentStatusFor(registrations: Registration[]): PaymentStatus | null {
  const statuses = registrations
    .map((registration) => registration.paymentStatus)
    .filter((status): status is PaymentStatus => status != null);
  if (statuses.length === 0) return null;
  if (statuses.includes("pending_review")) return "pending_review";
  if (statuses.includes("rejected")) return "rejected";
  return "approved";
}

function standingOf(registration: Registration): CardEntrant["standing"] {
  const standing = registrationListStatus(registration);
  return standing.key === "pending" || standing.key === "rejected" ? "applied" : "registered";
}

function entrantsFor(registrations: Registration[]): CardEntrant[] {
  const entrants: CardEntrant[] = [];
  for (const registration of registrations) {
    const standing = standingOf(registration);
    if (registration.entryType === "team" && registration.teamMembers && registration.teamMembers.length > 0) {
      for (const name of registration.teamMembers) {
        entrants.push({
          name,
          entryType: "team",
          registrationNumber: registration.registrationNumber,
          standing,
        });
      }
      continue;
    }
    entrants.push({
      name: registration.entrantName,
      entryType: registration.entryType,
      registrationNumber: registration.registrationNumber,
      standing,
    });
  }
  return entrants.sort((a, b) => a.name.localeCompare(b.name));
}

export default async function MyCompetitionsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.role === "school_coordinator") return <SchoolCompetitions userId={user.id} />;
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
        <MyCompetitionsPanel
          registerLabel={hasRegistration ? "Register for more competitions" : "Register for competitions"}
          emptyMessage={
            allRegistrations.length === 0
              ? "You haven't registered for any competitions yet."
              : "Nothing active right now — check History & Results for past competitions."
          }
          items={registrations.map((r) => ({
            key: r.id,
            registration: r,
            competition: competitionsBySlug.get(r.competitionSlug),
            result: results.get(r.id),
            status: deriveDisplayStatus(r, competitionsBySlug.get(r.competitionSlug)),
          }))}
        />
      </DashboardPage>
    </>
  );
}

/** Review pending or payment approved — exclude rejected entries from the list/search. */
function isOpenStanding(registration: Registration): boolean {
  const standing = registrationListStatus(registration);
  return standing.key === "pending" || standing.key === "registered";
}

async function SchoolCompetitions({ userId }: { userId: string }) {
  const supabase = await createClient();
  const school = await getCoordinatorSchool(supabase, userId);
  if (!school) {
    return (
      <DashboardPage title="My Competitions">
        <p className="text-muted">No school found for this coordinator account.</p>
      </DashboardPage>
    );
  }

  const [allRegistrations, allCompetitions] = await Promise.all([
    listSchoolRegistrations(supabase, school.id),
    listCompetitions(supabase),
  ]);
  const competitionsBySlug = new Map(allCompetitions.map((competition) => [competition.slug, competition]));
  const results = await getPublishedResultsFor(supabase, allRegistrations.map((registration) => registration.id));
  const active = allRegistrations.filter(
    (registration) =>
      isOpenStanding(registration) &&
      !isRegistrationConcluded(registration, competitionsBySlug.get(registration.competitionSlug), results.has(registration.id)),
  );

  const bySlug = new Map<string, Registration[]>();
  for (const registration of active) {
    const list = bySlug.get(registration.competitionSlug) ?? [];
    list.push(registration);
    bySlug.set(registration.competitionSlug, list);
  }

  const items = [...bySlug.entries()]
    .map(([slug, registrations]) => {
      const lead = registrations[0];
      const entrants = entrantsFor(registrations);
      return {
        key: slug,
        registration: lead,
        competition: competitionsBySlug.get(slug),
        result: registrations.map((registration) => results.get(registration.id)).find(Boolean),
        status: deriveDisplayStatus(lead, competitionsBySlug.get(slug)),
        paymentStatus: paymentStatusFor(registrations),
        entrants,
        searchText: entrants.map((entrant) => entrant.name).join(" "),
      };
    })
    .sort((a, b) => a.registration.competitionTitle.localeCompare(b.registration.competitionTitle));

  return (
    <>
      <DashboardHero
        eyebrow="Competitions"
        title="My Competitions"
        subtitle={
          <>
            Competitions your students have entered. Concluded events move to{" "}
            <Link href="/dashboard/history" prefetch>
              History &amp; Results
            </Link>
            .
          </>
        }
      />
      <DashboardPage>
        <MyCompetitionsPanel
          registerLabel={allRegistrations.length > 0 ? "Register for more competitions" : "Register for competitions"}
          emptyMessage={
            allRegistrations.length === 0
              ? "No students have been registered for a competition yet."
              : "Nothing active right now — check History & Results for past competitions."
          }
          items={items}
        />
      </DashboardPage>
    </>
  );
}
