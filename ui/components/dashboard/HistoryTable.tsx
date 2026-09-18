import Link from "next/link";
import type { Registration } from "@/domain/registrations/types";
import { registrationStatusLabels } from "@/domain/registrations/types";
import type { ResultInfo } from "@/domain/results/types";
import { Badge } from "@/ui/components/Badge";
import { DataTable } from "@/ui/components/DataTable";
import { CsvDownloadButton } from "./CsvDownloadButton";

const statusTone: Record<string, "success" | "warning" | "neutral"> = {
  approved: "success",
  qualified: "success",
  finalist: "success",
  completed: "success",
  pending: "warning",
  rejected: "neutral",
};

/** A competition/team participation record with its outcome — the shared
 * table behind every "History & Results" page (student and school alike):
 * every registration ever submitted, newest first, with its published
 * result if one exists yet. */
export function HistoryTable({
  registrations,
  results,
  exportFilename,
  exportLabel = "Export history (CSV)",
  emptyMessage = "No competition history yet.",
  limit,
  showExport = true,
}: {
  registrations: Registration[];
  results: Map<string, ResultInfo>;
  exportFilename: string;
  exportLabel?: string;
  emptyMessage?: string;
  /** Cap the number of rows shown — used for a "recent activity" preview. */
  limit?: number;
  showExport?: boolean;
}) {
  const sorted = [...registrations]
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, limit ?? registrations.length);

  return (
    <div>
      {showExport && (
        <div className="mb-3 flex justify-end">
          <CsvDownloadButton
            label={exportLabel}
            filename={exportFilename}
            rows={sorted.map((r) => {
              const result = results.get(r.id);
              return {
                Competition: r.competitionTitle,
                Entrant: r.entrantName,
                "Entry type": r.entryType,
                "Registration #": r.registrationNumber,
                Status: registrationStatusLabels[r.status],
                Result: result ? (result.customAwardLabel ?? result.award ?? "Released") : "",
                Score: result?.score != null ? String(result.score) : "",
                "Submitted at": new Date(r.submittedAt).toLocaleDateString(),
              };
            })}
          />
        </div>
      )}
      <DataTable
        rows={sorted}
        searchPlaceholder="Search by competition, entrant or registration #…"
        searchFields={(r) => [r.competitionTitle, r.entrantName, r.registrationNumber]}
        filters={[
          {
            label: "Status",
            options: Object.entries(registrationStatusLabels).map(([value, label]) => ({ value, label })),
            predicate: (r, value) => r.status === value,
          },
        ]}
        emptyMessage={emptyMessage}
      >
        {(pageRows) => (
          <div className="overflow-x-auto rounded-xl border border-border bg-surface">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="px-4 py-3 font-medium">Competition</th>
                  <th className="px-4 py-3 font-medium">Entrant</th>
                  <th className="px-4 py-3 font-medium">Registration #</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Result</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((r) => {
                  const result = results.get(r.id);
                  return (
                    <tr key={r.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">
                        <Link href={`/competitions/${r.competitionSlug}`} className="font-medium text-foreground hover:text-accent">
                          {r.competitionTitle}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {r.entrantName} <span className="capitalize">({r.entryType})</span>
                        {r.entryType === "team" && r.teamMembers && r.teamMembers.length > 0 && (
                          <p className="text-xs text-muted">{r.teamMembers.join(", ")}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted">{r.registrationNumber}</td>
                      <td className="px-4 py-3">
                        <Badge tone={statusTone[r.status] ?? "neutral"}>{registrationStatusLabels[r.status]}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {result ? (
                          <>
                            {result.customAwardLabel ?? result.award ?? "Released"}
                            {result.score != null && ` · ${result.score}`}
                          </>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted">{new Date(r.submittedAt).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </DataTable>
    </div>
  );
}
