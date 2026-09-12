import Link from "next/link";
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

export function StudentDashboard({ registrations }: { registrations: Registration[] }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">My Competitions</h1>
        <Link
          href="/dashboard/register"
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90"
        >
          Register for a competition
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Registered" value={registrations.length} />
        <StatCard
          label="Pending"
          value={registrations.filter((r) => r.status === "pending").length}
        />
        <StatCard
          label="Qualified"
          value={registrations.filter((r) => r.status === "qualified" || r.status === "finalist").length}
        />
        <StatCard
          label="Completed"
          value={registrations.filter((r) => r.status === "completed").length}
        />
      </div>

      <div className="mt-8 overflow-x-auto rounded-xl border border-border bg-surface">
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
            {registrations.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted">
                  You haven&apos;t registered for any competitions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
