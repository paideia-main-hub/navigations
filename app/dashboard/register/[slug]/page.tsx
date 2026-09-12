import { notFound } from "next/navigation";
import { getCurrentUser } from "@/domain/auth/session";
import { getCompetitionBySlug } from "@/domain/competitions/service";
import { listSchoolRoster } from "@/domain/students/service";
import { RegistrationWizard } from "@/ui/components/registration/RegistrationWizard";

export default async function CompetitionRegisterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const competition = getCompetitionBySlug(slug);
  if (!competition) notFound();

  const user = await getCurrentUser();

  if (user?.role === "judge" || user?.role === "admin") {
    return (
      <p className="text-muted">
        Only students and school coordinators register for competitions. Switch to a student or
        school account to continue.
      </p>
    );
  }

  const isSchool = user?.role === "school_coordinator";

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Register for {competition.title}</h1>
      <RegistrationWizard
        competition={competition}
        mode={isSchool ? "school" : "student"}
        studentName={!isSchool ? user?.fullName : undefined}
        roster={isSchool ? listSchoolRoster() : undefined}
      />
    </div>
  );
}
