import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { getCoordinatorSchool } from "@/domain/schools/service";
import { listSchoolRegistrations, listMyRegistrations } from "@/domain/registrations/service";
import { listSchoolRoster, getOwnStudentProfile } from "@/domain/students/service";
import { listSchoolTeams } from "@/domain/teams/service";
import { listAssignments } from "@/domain/judging/service";
import { getPublishedResultsFor } from "@/domain/results/service";
import { StudentDashboard } from "@/ui/components/dashboard/StudentDashboard";
import { SchoolDashboard } from "@/ui/components/dashboard/SchoolDashboard";
import { JudgeDashboard } from "@/ui/components/dashboard/JudgeDashboard";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const role = user?.role ?? "student";
  const supabase = await createClient();

  if (role === "school_coordinator" && user) {
    const school = await getCoordinatorSchool(supabase, user.id);
    if (!school) {
      return <p className="text-muted">No school found for this coordinator account.</p>;
    }

    const [roster, teams, registrations] = await Promise.all([
      listSchoolRoster(supabase, school.id),
      listSchoolTeams(supabase, school.id),
      listSchoolRegistrations(supabase, school.id),
    ]);

    return <SchoolDashboard school={school} roster={roster} teams={teams} registrations={registrations} />;
  }

  if (role === "judge") {
    return <JudgeDashboard assignments={listAssignments()} />;
  }

  if (role === "admin") {
    return (
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Console</h1>
        <p className="mt-2 max-w-xl text-muted">
          Manage competitions, users, registrations, announcements and results — the admin CMS is
          a dedicated build coming next.
        </p>
      </div>
    );
  }

  if (!user) return <StudentDashboard fullName="" profile={null} registrations={[]} results={new Map()} />;

  const [profile, registrations] = await Promise.all([
    getOwnStudentProfile(supabase, user.id),
    listMyRegistrations(supabase, user.id),
  ]);
  const results = await getPublishedResultsFor(supabase, registrations.map((r) => r.id));

  return <StudentDashboard fullName={user.fullName} profile={profile} registrations={registrations} results={results} />;
}
