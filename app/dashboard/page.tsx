import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { getCoordinatorAvatarUrl } from "@/domain/profiles/avatar";
import { getCoordinatorSchool } from "@/domain/schools/service";
import { deriveDisplayStatus, listSchoolRegistrations, listMyRegistrations } from "@/domain/registrations/service";
import { registrationListStatus } from "@/domain/registrations/types";
import { listSchoolRoster, getOwnStudentProfile } from "@/domain/students/service";
import { listSchoolTeams } from "@/domain/teams/service";
import { listAssignments } from "@/domain/judging/service";
import { listMyApplications } from "@/domain/judge-applications/service";
import { listCompetitions } from "@/domain/competitions/service";
import { StatCard } from "@/ui/components/dashboard/StatCard";
import { StudentProfileCard } from "@/ui/components/dashboard/StudentProfileCard";
import { SchoolOverview } from "@/ui/components/dashboard/SchoolOverview";
import { QuickLink } from "@/ui/components/dashboard/QuickLink";
import { DashboardHero } from "@/ui/components/dashboard/DashboardHero";
import { DashboardPage } from "@/ui/components/dashboard/DashboardShell";

export default async function DashboardOverviewPage() {
  const user = await getCurrentUser();
  if (!user) return null; // the layout already redirects unauthenticated visitors

  const supabase = await createClient();

  if (user.role === "school_coordinator") {
    const school = await getCoordinatorSchool(supabase, user.id);
    if (!school) {
      return (
        <DashboardPage title="Overview">
          <p className="text-muted">No school found for this coordinator account.</p>
        </DashboardPage>
      );
    }

    const [roster, teams, registrations] = await Promise.all([
      listSchoolRoster(supabase, school.id),
      listSchoolTeams(supabase, school.id),
      listSchoolRegistrations(supabase, school.id),
    ]);

    return (
      <>
        <DashboardHero
          eyebrow="Dashboard"
          title={`Welcome back, ${school.officialName}`}
          subtitle="Registrations, roster, teams, and results for your school."
        />
        <DashboardPage title="Overview">
          <SchoolOverview
            school={school}
            coordinatorName={user.fullName}
            avatarUrl={await getCoordinatorAvatarUrl(user.id)}
            studentCount={roster.length}
            teamCount={teams.length}
            registrationCount={registrations.length}
            pendingCount={registrations.filter((r) => registrationListStatus(r).key === "pending").length}
          />
        </DashboardPage>
      </>
    );
  }

  if (user.role === "judge") {
    const [assignments, applications] = await Promise.all([listAssignments(supabase, user.id), listMyApplications(supabase, user.id)]);
    const pending = assignments.filter((a) => a.status === "pending").length;

    return (
      <>
        <DashboardHero
          eyebrow="Dashboard"
          title={`Welcome back, ${user.fullName}`}
          subtitle="Apply to judge, then score assigned entrants once you are approved."
        />
        <DashboardPage>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatCard label="Assigned" value={assignments.length} />
            <StatCard label="Pending" value={pending} />
            <StatCard label="Scored" value={assignments.length - pending} />
          </div>

          <section className="mt-8 grid gap-4 sm:grid-cols-2">
            <QuickLink href="/dashboard/scoring" icon="✅" title="Score Entrants" body={`${pending} entrant(s) waiting on your score.`} />
            <QuickLink
              href="/dashboard/applications"
              icon="📝"
              title="Applications"
              body={applications.length === 0 ? "Apply to judge a competition." : `${applications.length} application(s) on file.`}
            />
          </section>
        </DashboardPage>
      </>
    );
  }

  // Student
  const [profile, registrations, allCompetitions] = await Promise.all([
    getOwnStudentProfile(supabase, user.id),
    listMyRegistrations(supabase, user.id),
    listCompetitions(supabase),
  ]);
  const competitionsBySlug = new Map(allCompetitions.map((c) => [c.slug, c]));

  const displayStatuses = registrations.map((r) => deriveDisplayStatus(r, competitionsBySlug.get(r.competitionSlug)));
  const counts = {
    registered: displayStatuses.filter((s) => s === "registered").length,
    upcoming: displayStatuses.filter((s) => s === "upcoming").length,
    in_progress: displayStatuses.filter((s) => s === "in_progress").length,
    qualified: displayStatuses.filter((s) => s === "qualified").length,
    completed: displayStatuses.filter((s) => s === "completed").length,
  };

  return (
    <>
      <DashboardHero
        eyebrow="Dashboard"
        title={`Welcome back, ${user.fullName}`}
        subtitle="Your competitions, submissions, nominations, and results."
      />
      <DashboardPage>
        <div className="space-y-8">
          {profile ? <StudentProfileCard fullName={user.fullName} profile={profile} /> : null}

          <section>
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold tracking-[0.16em] text-accent-strong uppercase">This season</p>
                <h2 className="mt-1 text-lg font-extrabold tracking-tight text-foreground">Your competition status</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
              <StatCard label="Registered" value={counts.registered} />
              <StatCard label="Upcoming" value={counts.upcoming} />
              <StatCard label="In Progress" value={counts.in_progress} />
              <StatCard label="Qualified" value={counts.qualified} />
              <StatCard label="Completed" value={counts.completed} />
            </div>
          </section>

          <section>
            <div className="mb-4">
              <p className="text-[11px] font-bold tracking-[0.16em] text-accent-strong uppercase">Next steps</p>
              <h2 className="mt-1 text-lg font-extrabold tracking-tight text-foreground">Jump back in</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <QuickLink
                href="/dashboard/competitions"
                icon="🏆"
                title="My Competitions"
                body="Deadlines, manuals and practice resources."
              />
              <QuickLink
                href="/dashboard/history"
                icon="📜"
                title="History & Results"
                body="Concluded competitions and results."
              />
              <QuickLink
                href="/dashboard/register"
                icon="➕"
                title="Register"
                body="Sign up for a new competition."
                emphasize
              />
            </div>
          </section>
        </div>
      </DashboardPage>
    </>
  );
}
