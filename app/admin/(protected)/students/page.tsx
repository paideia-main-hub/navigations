import { createAdminClient } from "@/data/supabase/admin";
import { listAllStudents } from "@/domain/students/service";
import { CsvDownloadButton } from "@/ui/components/dashboard/CsvDownloadButton";
import { StudentsTable } from "@/ui/components/admin/StudentsTable";

export default async function AdminStudentsPage() {
  const admin = createAdminClient();
  const students = await listAllStudents(admin);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground">Students</h1>
        <CsvDownloadButton
          label="Export students (CSV)"
          filename="students.csv"
          rows={students.map((s) => ({
            Name: s.fullName,
            School: s.schoolName ?? "Independent",
            Grade: s.grade ?? "",
            Guardian: s.guardianName ?? "",
          }))}
        />
      </div>
      <div className="mt-6">
        <StudentsTable students={students} />
      </div>
    </div>
  );
}
