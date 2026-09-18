import { createAdminClient } from "@/data/supabase/admin";
import { adminListCompetitions } from "@/domain/competitions/service";
import { listAllRegistrations } from "@/domain/registrations/service";
import { registrationStatusLabels } from "@/domain/registrations/types";
import { CsvDownloadButton } from "@/ui/components/dashboard/CsvDownloadButton";
import { RegistrationsTable } from "@/ui/components/admin/RegistrationsTable";

export default async function AdminRegistrationsPage() {
  const admin = createAdminClient();
  const [competitions, registrations] = await Promise.all([adminListCompetitions(admin), listAllRegistrations(admin)]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground">Registrations</h1>
        <CsvDownloadButton
          label="Export registrations (CSV)"
          filename="registrations.csv"
          rows={registrations.map((r) => ({
            Competition: r.competitionTitle,
            "Entry type": r.entryType,
            Entrant: r.entrantName,
            "Registration #": r.registrationNumber,
            Status: registrationStatusLabels[r.status],
            "Submitted at": new Date(r.submittedAt).toLocaleDateString(),
          }))}
        />
      </div>

      <div className="mt-6">
        <RegistrationsTable
          registrations={registrations}
          competitions={competitions.map((c) => ({ slug: c.slug, title: c.title }))}
        />
      </div>
    </div>
  );
}
