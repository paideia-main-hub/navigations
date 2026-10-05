import { redirect } from "next/navigation";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { getCoordinatorSchool } from "@/domain/schools/service";
import { listSchoolRoster } from "@/domain/students/service";
import { listSchoolTeams } from "@/domain/teams/service";
import { CreateTeamForm } from "@/ui/components/dashboard/CreateTeamForm";
import { DashboardHero } from "@/ui/components/dashboard/DashboardHero";
import { DashboardPage } from "@/ui/components/dashboard/DashboardShell";

export default async function TeamsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.role !== "school_coordinator") redirect("/dashboard");

  const supabase = await createClient();
  const school = await getCoordinatorSchool(supabase, user.id);
  if (!school) {
    return (
      <DashboardPage>
        <p className="text-muted">No school found for this coordinator account.</p>
      </DashboardPage>
    );
  }

  const [roster, teams] = await Promise.all([listSchoolRoster(supabase, school.id), listSchoolTeams(supabase, school.id)]);

  return (
    <>
      <DashboardHero eyebrow="School" title="Teams" subtitle="Create teams from your roster and enter them as a group." />
      <DashboardPage>
        <div className="space-y-3">
          {teams.map((t) => (
            <div key={t.id} className="rounded-xl border border-border bg-surface p-4">
              <p className="font-medium text-foreground">{t.name}</p>
              <p className="text-xs text-muted">{t.members.map((m) => m.studentName).join(", ")}</p>
            </div>
          ))}
          {teams.length === 0 && (
            <div className="rounded-xl border border-border bg-surface p-8 text-center text-muted">No teams created yet.</div>
          )}
        </div>
        <div className="mt-4">
          <CreateTeamForm roster={roster} />
        </div>
      </DashboardPage>
    </>
  );
}
