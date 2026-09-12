import { createAdminClient } from "@/data/supabase/admin";
import { adminListCompetitions } from "@/domain/competitions/service";
import { listAllRegistrations } from "@/domain/registrations/service";
import { registrationStatusLabels } from "@/domain/registrations/types";
import { Badge } from "@/ui/components/Badge";
import { CsvDownloadButton } from "@/ui/components/dashboard/CsvDownloadButton";

const statusTone: Record<string, "success" | "warning" | "neutral"> = {
  approved: "success",
  qualified: "success",
  finalist: "success",
  completed: "success",
  pending: "warning",
  rejected: "neutral",
};

export default async function AdminRegistrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ competition?: string }>;
}) {
  const { competition } = await searchParams;
  const admin = createAdminClient();
  const [competitions, registrations] = await Promise.all([
    adminListCompetitions(admin),
    listAllRegistrations(admin, { competitionSlug: competition || undefined }),
  ]);

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

      <form method="get" className="mt-4 flex items-center gap-2">
        <select
          name="competition"
          defaultValue={competition ?? ""}
          className="rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground"
        >
          <option value="">All competitions</option>
          {competitions.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.title}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground hover:border-accent">
          Filter
        </button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted">
              <th className="px-4 py-3 font-medium">Competition</th>
              <th className="px-4 py-3 font-medium">Entry</th>
              <th className="px-4 py-3 font-medium">Registration #</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium text-foreground">{r.competitionTitle}</td>
                <td className="px-4 py-3 text-muted">
                  {r.entrantName} <span className="capitalize">({r.entryType})</span>
                </td>
                <td className="px-4 py-3 text-muted">{r.registrationNumber}</td>
                <td className="px-4 py-3">
                  <Badge tone={statusTone[r.status] ?? "neutral"}>{registrationStatusLabels[r.status]}</Badge>
                </td>
              </tr>
            ))}
            {registrations.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted">
                  No registrations match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
