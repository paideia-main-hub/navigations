import Link from "next/link";
import { createAdminClient } from "@/data/supabase/admin";
import { adminListCompetitions } from "@/domain/competitions/service";
import { CompetitionsTable } from "@/ui/components/admin/CompetitionsTable";

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

      <div className="mt-6">
        <CompetitionsTable competitions={competitions} />
      </div>
    </div>
  );
}
