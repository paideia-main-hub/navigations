import { createAdminClient } from "@/data/supabase/admin";
import { StatCard } from "@/ui/components/dashboard/StatCard";
import { QuickLink } from "@/ui/components/dashboard/QuickLink";

async function countRows(
  admin: ReturnType<typeof createAdminClient>,
  table: "competitions" | "schools" | "students" | "registrations",
): Promise<number> {
  const { count, error } = await admin.from(table).select("id", { count: "exact", head: true });
  if (error) return 0;
  return count ?? 0;
}

export default async function AdminDashboardPage() {
  const admin = createAdminClient();
  const [competitions, schools, students, registrations] = await Promise.all([
    countRows(admin, "competitions"),
    countRows(admin, "schools"),
    countRows(admin, "students"),
    countRows(admin, "registrations"),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Admin Console</h1>
      <p className="mt-2 max-w-xl text-muted">
        Manage competitions, announcements, and see who&apos;s registered across every school.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Competitions" value={competitions} />
        <StatCard label="Schools" value={schools} />
        <StatCard label="Students" value={students} />
        <StatCard label="Registrations" value={registrations} />
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-foreground">Quick Links</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <QuickLink href="/admin/competitions" icon="🏆" title="Competitions" body="Create, edit and publish competition content." />
          <QuickLink href="/admin/results" icon="🏅" title="Results" body="Generate standings and publish winners." />
          <QuickLink href="/admin/registrations" icon="📋" title="Registrations" body="View and export every registration." />
          <QuickLink href="/admin/judge-applications" icon="📝" title="Judge Applications" body="Review and approve judge applicants." />
          <QuickLink href="/admin/announcements" icon="📣" title="Announcements" body="Publish site-wide or competition notices." />
          <QuickLink href="/admin/appreciations" icon="✨" title="Appreciations" body="Add appreciations shown under Announcements." />
          <QuickLink href="/admin/schools" icon="🏫" title="Schools" body="View every registered school." />
        </div>
      </section>
    </div>
  );
}
