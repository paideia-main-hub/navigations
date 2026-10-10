import { redirect } from "next/navigation";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { getCoordinatorSchool } from "@/domain/schools/service";
import { listSchoolRoster } from "@/domain/students/service";
import { AddStudentForm } from "@/ui/components/dashboard/AddStudentForm";
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
      <DashboardPage title="Students">
        {roster.length === 0 ? (
          <div className="rounded-2xl border border-accent/25 bg-accent-soft px-6 py-14 text-center">
            <p className="text-lg font-semibold text-foreground">No students added yet</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
              Add a student to build your roster, then register them for competitions.
            </p>
            <div className="mt-6">
              <AddStudentForm />
            </div>
          </div>
        ) : (
          <StudentRoster students={roster} />
        )}
      </DashboardPage>
    </>
  );
}
