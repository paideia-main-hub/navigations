import { createAdminClient } from "@/data/supabase/admin";
import { listAllStudents } from "@/domain/students/service";
import { CsvDownloadButton } from "@/ui/components/dashboard/CsvDownloadButton";

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
      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">School</th>
              <th className="px-4 py-3 font-medium">Grade</th>
              <th className="px-4 py-3 font-medium">Guardian</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium text-foreground">{s.fullName}</td>
                <td className="px-4 py-3 text-muted">{s.schoolName ?? "Independent"}</td>
                <td className="px-4 py-3 text-muted">{s.grade ?? "—"}</td>
                <td className="px-4 py-3 text-muted">{s.guardianName ?? "—"}</td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted">
                  No students registered yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
