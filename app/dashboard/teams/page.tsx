import { redirect } from "next/navigation";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { getCoordinatorSchool } from "@/domain/schools/service";
import { listSchoolRoster } from "@/domain/students/service";
import { listSchoolTeams } from "@/domain/teams/service";
import { CreateTeamForm } from "@/ui/components/dashboard/CreateTeamForm";
import { DashboardHero } from "@/ui/components/dashboard/DashboardHero";
import { DashboardPage } from "@/ui/components/dashboard/DashboardShell";

function memberCountLabel(count: number) {
  return `${count} member${count === 1 ? "" : "s"}`;
}

export default async function TeamsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.role !== "school_coordinator") redirect("/dashboard");

  const supabase = await createClient();
  const school = await getCoordinatorSchool(supabase, user.id);
  if (!school) {
    return (
        <DashboardPage title="Teams">
          <p className="text-muted">No school found for this coordinator account.</p>
        </DashboardPage>
    );
  }

  const [roster, teams] = await Promise.all([listSchoolRoster(supabase, school.id), listSchoolTeams(supabase, school.id)]);

  return (
    <>
      <DashboardHero eyebrow="School" title="Teams" subtitle="Create teams from your roster and enter them as a group." />
      <DashboardPage>
        <CreateTeamForm roster={roster} />
        <div className="grid gap-3">
          {teams.map((team) => (
            <article
              key={team.id}
              className="rounded-2xl border border-border bg-surface p-4 shadow-[0_18px_40px_-36px_rgba(31,32,65,0.55)] sm:p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-extrabold tracking-tight text-foreground">{team.name}</h3>
                <span className="shrink-0 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent-strong">
                  {memberCountLabel(team.members.length)}
                </span>
              </div>
              {team.members.length === 0 ? (
                <p className="mt-3 text-sm text-muted">No members yet.</p>
              ) : (
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {team.members.map((member) => (
                    <li
                      key={member.studentId}
                      className="flex items-center justify-between gap-3 rounded-xl bg-surface-muted px-3 py-2.5"
                    >
                      <span className="min-w-0 truncate text-sm font-medium text-foreground">{member.studentName}</span>
                      <span className="shrink-0 text-xs text-muted">{member.grade ? `Grade ${member.grade}` : ""}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
          {teams.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-10 text-center text-sm text-muted">
              No teams created yet.
            </div>
          ) : null}
        </div>
      </DashboardPage>
    </>
  );
}
