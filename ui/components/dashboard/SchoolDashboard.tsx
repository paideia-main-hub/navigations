import Link from "next/link";
import type { StudentProfile } from "@/domain/students/types";
import type { Team } from "@/domain/teams/types";
import type { Registration } from "@/domain/registrations/types";
import { registrationStatusLabels } from "@/domain/registrations/types";
import { Badge } from "@/ui/components/Badge";
import { StatCard } from "./StatCard";

const statusTone: Record<string, "success" | "warning" | "neutral"> = {
  approved: "success",
  qualified: "success",
  finalist: "success",
  completed: "success",
  pending: "warning",
  rejected: "neutral",
};

export function SchoolDashboard({
  roster,
  teams,
  registrations,
}: {
  roster: StudentProfile[];
  teams: Team[];
  registrations: Registration[];
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">School Dashboard</h1>
        <Link
          href="/dashboard/register"
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90"
        >
          Register a student or team
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Students" value={roster.length} />
        <StatCard label="Teams" value={teams.length} />
        <StatCard label="Registrations" value={registrations.length} />
        <StatCard label="Pending" value={registrations.filter((r) => r.status === "pending").length} />
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-foreground">Registrations</h2>
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full min-w-[560px] text-left text-sm">
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
                  <td className="px-4 py-3">
                    <Link href={`/competitions/${r.competitionSlug}`} className="font-medium text-foreground hover:text-accent">
                      {r.competitionTitle}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {r.entrantName} <span className="capitalize">({r.entryType})</span>
                  </td>
                  <td className="px-4 py-3 text-muted">{r.registrationNumber}</td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTone[r.status] ?? "neutral"}>{registrationStatusLabels[r.status]}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">Student roster</h2>
          <div className="overflow-x-auto rounded-xl border border-border bg-surface">
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
                    <td className="px-4 py-3 text-muted">{s.grade}</td>
                    <td className="px-4 py-3 text-muted">{s.guardianName ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">Teams</h2>
          <div className="space-y-3">
            {teams.map((t) => (
              <div key={t.id} className="rounded-xl border border-border bg-surface p-4">
                <p className="font-medium text-foreground">{t.name}</p>
                <p className="text-xs text-muted">{t.members.map((m) => m.studentName).join(", ")}</p>
              </div>
            ))}
            {teams.length === 0 && <p className="text-sm text-muted">No teams created yet.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
