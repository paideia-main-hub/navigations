import { notFound } from "next/navigation";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { getCompetitionBySlug } from "@/domain/competitions/service";
import { getCoordinatorSchool } from "@/domain/schools/service";
import { listSchoolRoster, getOwnStudentProfile } from "@/domain/students/service";
import { RegistrationWizard } from "@/ui/components/registration/RegistrationWizard";

export default async function CompetitionRegisterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getCurrentUser();
  const supabase = await createClient();
  const competition = await getCompetitionBySlug(supabase, slug);
  if (!competition) notFound();

  if (!user || user.role === "judge" || user.role === "admin") {
    return (
      <p className="text-muted">
        Only students and school coordinators register for competitions. Switch to a student or
        school account to continue.
      </p>
    );
  }

  const isSchool = user.role === "school_coordinator";

  if (isSchool) {
    const school = await getCoordinatorSchool(supabase, user.id);
    if (!school) {
      return <p className="text-muted">No school found for this coordinator account.</p>;
    }

    const roster = await listSchoolRoster(supabase, school.id);

    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-foreground">Register for {competition.title}</h1>
        <RegistrationWizard
          competition={competition}
          mode="school"
          schoolId={school.id}
          schoolName={school.officialName}
          roster={roster}
        />
      </div>
    );
  }

  const ownProfile = await getOwnStudentProfile(supabase, user.id);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Register for {competition.title}</h1>
      <RegistrationWizard
        competition={competition}
        mode="student"
        studentName={user.fullName}
        studentId={ownProfile?.id}
      />
    </div>
  );
}
