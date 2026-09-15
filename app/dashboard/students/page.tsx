import { redirect } from "next/navigation";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { getCoordinatorSchool } from "@/domain/schools/service";
import { listSchoolRoster } from "@/domain/students/service";
import { AddStudentForm } from "@/ui/components/dashboard/AddStudentForm";
import { CsvDownloadButton } from "@/ui/components/dashboard/CsvDownloadButton";

export default async function StudentsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.role !== "school_coordinator") redirect("/dashboard");

  const supabase = await createClient();
  const school = await getCoordinatorSchool(supabase, user.id);
  if (!school) return <p className="text-muted">No school found for this coordinator account.</p>;

  const roster = await listSchoolRoster(supabase, school.id);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground">Students</h1>
        <CsvDownloadButton
          label="Download participant list (CSV)"
          filename={`${school.officialName}-students.csv`}
          rows={roster.map((s) => ({
            Name: s.fullName,
            Grade: s.grade ?? "",
            Guardian: s.guardianName ?? "",
            "Guardian contact": s.guardianMobile ?? s.guardianEmail ?? "",
          }))}
        />
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Grade</th>
              <th className="px-4 py-3 font-medium">Guardian</th>
            </tr>
          </thead>
          <tbody>
            {roster.map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium text-foreground">{s.fullName}</td>
                <td className="px-4 py-3 text-muted">{s.grade ?? "—"}</td>
                <td className="px-4 py-3 text-muted">{s.guardianName ?? "—"}</td>
              </tr>
            ))}
            {roster.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted">
                  No students added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        <AddStudentForm />
      </div>
    </div>
  );
}
