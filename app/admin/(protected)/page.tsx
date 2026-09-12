import { createAdminClient } from "@/data/supabase/admin";
import { adminListCompetitions } from "@/domain/competitions/service";
import { listAllSchools } from "@/domain/schools/service";
import { listAllStudents } from "@/domain/students/service";
import { listAllRegistrations } from "@/domain/registrations/service";
import { StatCard } from "@/ui/components/dashboard/StatCard";

export default async function AdminDashboardPage() {
  const admin = createAdminClient();
  const [competitions, schools, students, registrations] = await Promise.all([
    adminListCompetitions(admin),
    listAllSchools(admin),
    listAllStudents(admin),
    listAllRegistrations(admin),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Admin Console</h1>
      <p className="mt-2 max-w-xl text-muted">
        Manage competitions, announcements, and see who&apos;s registered across every school.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Competitions" value={competitions.length} />
        <StatCard label="Schools" value={schools.length} />
        <StatCard label="Students" value={students.length} />
        <StatCard label="Registrations" value={registrations.length} />
      </div>
    </div>
  );
}
