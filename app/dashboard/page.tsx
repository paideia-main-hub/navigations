import { getCurrentUser } from "@/domain/auth/session";
import { listAllRegistrations } from "@/domain/registrations/service";
import { listSchoolRoster } from "@/domain/students/service";
import { listSchoolTeams } from "@/domain/teams/service";
import { listAssignments } from "@/domain/judging/service";
import { StudentDashboard } from "@/ui/components/dashboard/StudentDashboard";
import { SchoolDashboard } from "@/ui/components/dashboard/SchoolDashboard";
import { JudgeDashboard } from "@/ui/components/dashboard/JudgeDashboard";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const role = user?.role ?? "student";

  if (role === "school_coordinator") {
    return (
      <SchoolDashboard
        roster={listSchoolRoster()}
        teams={listSchoolTeams()}
        registrations={listAllRegistrations()}
      />
    );
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

  return <StudentDashboard registrations={listAllRegistrations()} />;
}
