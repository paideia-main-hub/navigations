import { createAdminClient } from "@/data/supabase/admin";
import { listAllSchools } from "@/domain/schools/service";
import { CsvDownloadButton } from "@/ui/components/dashboard/CsvDownloadButton";
import { DataTable } from "@/ui/components/DataTable";

export default async function AdminSchoolsPage() {
  const admin = createAdminClient();
  const schools = await listAllSchools(admin);

  const countryOptions = Array.from(new Set(schools.map((s) => s.country).filter((c): c is string => Boolean(c)))).sort();

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
        <DataTable
          rows={schools}
          searchPlaceholder="Search by name or city…"
          searchFields={(s) => [s.officialName, s.city, s.country]}
          filters={[
            {
              label: "Country",
              options: countryOptions.map((c) => ({ value: c, label: c })),
              predicate: (s, value) => s.country === value,
            },
          ]}
          emptyMessage="No schools registered yet."
        >
          {(pageRows) => (
            <div className="overflow-x-auto rounded-xl border border-border bg-surface">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-muted">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">City</th>
                    <th className="px-4 py-3 font-medium">Country</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((s) => (
                    <tr key={s.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-medium text-foreground">{s.officialName}</td>
                      <td className="px-4 py-3 text-muted">{s.city ?? "—"}</td>
                      <td className="px-4 py-3 text-muted">{s.country ?? "—"}</td>
                      <td className="px-4 py-3 text-muted">{s.schoolType ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DataTable>
      </div>
    </div>
  );
}
