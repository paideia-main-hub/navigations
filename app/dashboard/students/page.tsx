import { redirect } from "next/navigation";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { getCoordinatorSchool } from "@/domain/schools/service";
import { listSchoolRoster } from "@/domain/students/service";
import { StudentRoster } from "@/ui/components/dashboard/StudentRoster";
import { CsvDownloadButton } from "@/ui/components/dashboard/CsvDownloadButton";
import { DashboardHero, dashboardHeroGhostCtaClass } from "@/ui/components/dashboard/DashboardHero";
import { DashboardPage } from "@/ui/components/dashboard/DashboardShell";

export default async function StudentsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.role !== "school_coordinator") redirect("/dashboard");

  const supabase = await createClient();
  const school = await getCoordinatorSchool(supabase, user.id);
  if (!school) {
    return (
        <DashboardPage title="Students">
          <p className="text-muted">No school found for this coordinator account.</p>
        </DashboardPage>
    );
  }

  const roster = await listSchoolRoster(supabase, school.id);

  return (
    <>
      <DashboardHero eyebrow="School" title="Students" subtitle="Your school roster — add students and export the list.">
        <CsvDownloadButton
          label="Download participant list (CSV)"
          filename={`${school.officialName}-students.csv`}
          className={dashboardHeroGhostCtaClass}
          rows={roster.map((s) => ({
            Name: s.fullName,
            Grade: s.grade ?? "",
            Guardian: s.guardianName ?? "",
            "Guardian contact": s.guardianMobile ?? s.guardianEmail ?? "",
          }))}
        />
      </DashboardHero>
      <DashboardPage>
        <StudentRoster students={roster} />
      </DashboardPage>
    </>
  );
}
