import { createAdminClient } from "@/data/supabase/admin";
import { listAllSchools } from "@/domain/schools/service";
import { CsvDownloadButton } from "@/ui/components/dashboard/CsvDownloadButton";
import { SchoolsTable } from "@/ui/components/admin/SchoolsTable";

export default async function AdminSchoolsPage() {
  const admin = createAdminClient();
  const schools = await listAllSchools(admin);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground">Schools</h1>
        <CsvDownloadButton
          label="Export schools (CSV)"
          filename="schools.csv"
          rows={schools.map((s) => ({
            Name: s.officialName,
            City: s.city ?? "",
            Country: s.country ?? "",
            "School type": s.schoolType ?? "",
            Principal: s.principalName ?? "",
          }))}
        />
      </div>
      <div className="mt-6">
        <SchoolsTable schools={schools} />
      </div>
    </div>
  );
}
