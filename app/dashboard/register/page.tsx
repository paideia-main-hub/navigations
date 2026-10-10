import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { listOpenAndUpcoming } from "@/domain/competitions/service";
import { getPaymentAccount } from "@/domain/payments/service";
import { categoryLabels, statusLabels } from "@/domain/competitions/types";
import { listMyRegistrations } from "@/domain/registrations/service";
import { getOwnStudentProfile } from "@/domain/students/service";
import { CompetitionBasket } from "@/ui/components/dashboard/CompetitionBasket";
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
    const registeredSlugs = registrations.filter((r) => r.status !== "rejected").map((r) => r.competitionSlug);

    return (
      <>
        <DashboardHero
          eyebrow="Competitions"
          title="Register for competitions"
          subtitle="Add as many competitions as you like, then check out once: confirm your details, give consent, and pay one total with a single receipt."
        />
        <DashboardPage>
          <div className="mt-6">
            {student ? (
              <CompetitionBasket
                competitions={competitions}
                registeredSlugs={registeredSlugs}
                student={{
                  fullName: student.fullName,
                  frlId: student.frlId,
                  grade: student.grade,
                  schoolName: student.schoolName ?? null,
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

  const competitions = await listOpenAndUpcoming(supabase);

  return (
    <>
      <DashboardHero
        eyebrow="Competitions"
        title="Register"
        subtitle="Open and upcoming competitions you can enter now."
      />
      <DashboardPage>
        <CoordinatorCompetitionGrid
          competitions={competitions.map((competition) => ({
            slug: competition.slug,
            title: competition.title,
            domain: competition.domain,
            statusLabel: statusLabels[competition.status],
            open: competition.status === "open",
            categories: [...new Set(competition.eligibility.map((rule) => categoryLabels[rule.category]))],
          }))}
        />
      </DashboardPage>
    </>
  );
}
