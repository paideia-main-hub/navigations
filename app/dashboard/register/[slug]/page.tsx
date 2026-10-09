import { notFound } from "next/navigation";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { getPublicCompetitionBySlug } from "@/domain/competitions/service";
import { getPaymentAccount } from "@/domain/payments/service";
import { getCoordinatorSchool } from "@/domain/schools/service";
import { listSchoolRoster, getOwnStudentProfile } from "@/domain/students/service";
import { RegistrationWizard } from "@/ui/components/registration/RegistrationWizard";
import { DashboardHero } from "@/ui/components/dashboard/DashboardHero";
import { DashboardPage } from "@/ui/components/dashboard/DashboardShell";

export default async function CompetitionRegisterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getCurrentUser();
  const supabase = await createClient();
  // Drafts and archived competitions can't be registered for, even by URL.
  const [competition, paymentAccount] = await Promise.all([
    getPublicCompetitionBySlug(supabase, slug),
    getPaymentAccount(supabase),
  ]);
  if (!competition) notFound();

  if (!user || user.role === "judge" || user.role === "admin") {
    return (
      <DashboardPage>
        <p className="text-muted">
          Only students and school coordinators register for competitions. Switch to a student or
          school account to continue.
        </p>
      </DashboardPage>
    );
  }

  const isSchool = user.role === "school_coordinator";

  if (isSchool) {
    const school = await getCoordinatorSchool(supabase, user.id);
    if (!school) {
      return (
        <DashboardPage>
          <p className="text-muted">No school found for this coordinator account.</p>
        </DashboardPage>
      );
    }

    const roster = await listSchoolRoster(supabase, school.id);

    return (
      <>
        <DashboardHero
          eyebrow="Register"
          title={competition.title}
          subtitle={`Entering on behalf of ${school.officialName}.`}
        />
        <DashboardPage>
          <div>
            <RegistrationWizard
              competition={competition}
              mode="school"
              schoolId={school.id}
              schoolName={school.officialName}
              roster={roster}
              paymentAccount={paymentAccount}
            />
          </div>
        </DashboardPage>
      </>
    );
  }

  const ownProfile = await getOwnStudentProfile(supabase, user.id);

  return (
    <>
      <DashboardHero eyebrow="Register" title={competition.title} subtitle="Complete registration for yourself." />
      <DashboardPage>
        <div>
          <RegistrationWizard
            competition={competition}
            mode="student"
            studentName={user.fullName}
            paymentAccount={paymentAccount}
            studentId={ownProfile?.id}
          />
        </div>
      </DashboardPage>
    </>
  );
}
