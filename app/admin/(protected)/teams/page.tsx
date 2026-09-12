import { createAdminClient } from "@/data/supabase/admin";
import { listAllTeams } from "@/domain/teams/service";
import { CsvDownloadButton } from "@/ui/components/dashboard/CsvDownloadButton";

export default async function AdminTeamsPage() {
  const admin = createAdminClient();
  const teams = await listAllTeams(admin);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground">Teams</h1>
        <CsvDownloadButton
          label="Export teams (CSV)"
          filename="teams.csv"
          rows={teams.map((t) => ({
            Team: t.name,
            School: t.schoolName ?? "Independent",
            Members: t.members.map((m) => m.studentName).join("; "),
          }))}
        />
      </div>
      <div className="mt-6 space-y-3">
        {teams.map((t) => (
          <div key={t.id} className="rounded-xl border border-border bg-surface p-4">
            <p className="font-medium text-foreground">{t.name}</p>
            <p className="text-xs text-muted">{t.schoolName ?? "Independent"}</p>
            <p className="mt-1 text-sm text-muted">{t.members.map((m) => m.studentName).join(", ") || "No members"}</p>
          </div>
        ))}
        {teams.length === 0 && <p className="text-sm text-muted">No teams created yet.</p>}
      </div>
    </div>
  );
}
