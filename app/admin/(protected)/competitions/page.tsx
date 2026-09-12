import Link from "next/link";
import { createAdminClient } from "@/data/supabase/admin";
import { adminListCompetitions } from "@/domain/competitions/service";
import { statusLabels } from "@/domain/competitions/types";
import { CompetitionStatusControl } from "@/ui/components/admin/CompetitionStatusControl";

export default async function AdminCompetitionsPage() {
  const admin = createAdminClient();
  const competitions = await adminListCompetitions(admin);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground">Competitions</h1>
        <Link
          href="/admin/competitions/new"
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90"
        >
          + New competition
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted">
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Entry types</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {competitions.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{c.title}</p>
                  <p className="text-xs text-muted">/{c.slug}</p>
                </td>
                <td className="px-4 py-3 text-muted">
                  {c.supportsIndividual && c.supportsTeam ? "Individual & Team" : c.supportsIndividual ? "Individual" : "Team"}
                </td>
                <td className="px-4 py-3">
                  <CompetitionStatusControl competitionId={c.id} status={c.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/competitions/${c.id}`} className="text-sm font-semibold text-accent">
                    Edit →
                  </Link>
                </td>
              </tr>
            ))}
            {competitions.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted">
                  No competitions yet. Create the first one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-muted">{Object.values(statusLabels).join(" · ")}</p>
    </div>
  );
}
