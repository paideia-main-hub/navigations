import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { listOpenAndUpcoming } from "@/domain/competitions/service";
import { getPaymentAccount } from "@/domain/payments/service";
import { getCoordinatorSchool } from "@/domain/schools/service";
import { listMyRegistrations } from "@/domain/registrations/service";
import { registrationListStatus } from "@/domain/registrations/types";
import { getOwnStudentProfile, listSchoolRoster } from "@/domain/students/service";
import { listSchoolTeams } from "@/domain/teams/service";
import {
  CompetitionBasket,
  type CompetitionCardStanding,
} from "@/ui/components/dashboard/CompetitionBasket";
import { CoordinatorCompetitionGrid } from "@/ui/components/dashboard/CoordinatorCompetitionGrid";
import { DashboardHero } from "@/ui/components/dashboard/DashboardHero";
import { DashboardPage } from "@/ui/components/dashboard/DashboardShell";

export default async function DashboardRegisterPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();

  if (user.role === "student") {
    const [competitions, registrations, student, paymentAccount] = await Promise.all([
      listOpenAndUpcoming(supabase),
      listMyRegistrations(supabase, user.id),
      getOwnStudentProfile(supabase, user.id),
      getPaymentAccount(supabase),
    ]);
    const standingBySlug: Record<string, CompetitionCardStanding> = {};
    for (const registration of registrations) {
      const standing = registrationListStatus(registration);
      if (standing.key === "rejected") continue;
      // Registered only once payment (or later stage) is approved; otherwise review pending.
      const next: CompetitionCardStanding =
        standing.key === "pending" ? "pending" : "registered";
      const current = standingBySlug[registration.competitionSlug];
      if (current === "registered") continue;
      standingBySlug[registration.competitionSlug] = next;
    }

    return (
      <>
        <DashboardHero
          eyebrow="Competitions"
          title="Register for competitions"
          subtitle="Open a competition, complete the form, add it to your hamper, then pay once for everything with a single receipt."
        />
        <DashboardPage>
          <div id="register">
            {student ? (
              <CompetitionBasket
                competitions={competitions}
                standingBySlug={standingBySlug}
                student={{
                  fullName: student.fullName,
                  frlId: student.frlId,
                  grade: student.grade,
                  schoolName: student.schoolName ?? null,
                  studentId: student.id,
                }}
                paymentAccount={paymentAccount}
              />
            ) : (
              <p className="rounded-xl border border-border bg-surface p-6 text-sm text-muted">
                No student profile is linked to this account yet, so registration isn&apos;t available.
              </p>
            )}
          </div>
        </DashboardPage>
      </>
    );
  }

  const [competitions, paymentAccount, school] = await Promise.all([
    listOpenAndUpcoming(supabase),
    getPaymentAccount(supabase),
    getCoordinatorSchool(supabase, user.id),
  ]);
  const roster = school ? await listSchoolRoster(supabase, school.id) : [];
  const teams = school ? await listSchoolTeams(supabase, school.id) : [];

  return (
    <>
      <DashboardHero
        eyebrow="Competitions"
        title="Register"
        subtitle="Add each competition, then register the whole hamper with one receipt."
      />
      <DashboardPage>
        {school ? (
          <CoordinatorCompetitionGrid
            competitions={competitions}
            roster={roster}
            teams={teams}
            schoolId={school.id}
            schoolName={school.officialName}
            paymentAccount={paymentAccount}
          />
        ) : (
          <p className="text-muted">No school found for this coordinator account.</p>
        )}
      </DashboardPage>
    </>
  );
}
