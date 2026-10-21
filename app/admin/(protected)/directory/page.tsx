import Link from "next/link";
import { createAdminClient } from "@/data/supabase/admin";
import { adminListCompetitions } from "@/domain/competitions/service";
import { listAllPayments } from "@/domain/payments/service";
import { listAllRegistrations } from "@/domain/registrations/service";
import { registrationStatusLabels } from "@/domain/registrations/types";
import { listAllSchools } from "@/domain/schools/service";
import { listAllStudents } from "@/domain/students/service";
import { listAllTeams } from "@/domain/teams/service";
import { PaymentsTable } from "@/ui/components/admin/PaymentsTable";
import { RegistrationsTable } from "@/ui/components/admin/RegistrationsTable";
import { SchoolsTable } from "@/ui/components/admin/SchoolsTable";
import { StudentsTable } from "@/ui/components/admin/StudentsTable";
import { TeamsTable } from "@/ui/components/admin/TeamsTable";
import { CsvDownloadButton } from "@/ui/components/dashboard/CsvDownloadButton";

const TABS = [
  { id: "schools", label: "Schools", icon: "🏫" },
  { id: "students", label: "Students", icon: "🎓" },
  { id: "teams", label: "Teams", icon: "👥" },
  { id: "registrations", label: "Registrations", icon: "📋" },
  { id: "payments", label: "Payment Approvals", icon: "💳" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function resolveTab(value: string | undefined): TabId {
  return TABS.some((tab) => tab.id === value) ? (value as TabId) : "schools";
}

export default async function AdminDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab: tabParam } = await searchParams;
  const tab = resolveTab(tabParam);

  const admin = createAdminClient();
  const [schools, students, teams, competitions, registrations, payments] = await Promise.all([
    listAllSchools(admin),
    listAllStudents(admin),
    listAllTeams(admin),
    adminListCompetitions(admin),
    listAllRegistrations(admin),
    listAllPayments(admin),
  ]);

  const pendingPayments = payments.filter((p) => p.status === "pending_review").length;
  const counts: Record<TabId, number> = {
    schools: schools.length,
    students: students.length,
    teams: teams.length,
    registrations: registrations.length,
    payments: payments.length,
  };

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-foreground">Directory</h1>
        <p className="mt-1 text-sm text-muted">
          Schools, students, teams, registrations, and payment approvals in one place.
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Directory sections"
        className="mt-6 flex flex-wrap gap-1 rounded-2xl border border-border bg-surface p-1"
      >
        {TABS.map((item) => {
          const active = tab === item.id;
          const badge =
            item.id === "payments" && pendingPayments > 0
              ? `${pendingPayments} pending`
              : String(counts[item.id]);
          return (
            <Link
              key={item.id}
              href={`/admin/directory?tab=${item.id}`}
              prefetch
              role="tab"
              aria-selected={active}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ${
                active
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted hover:bg-surface-muted hover:text-foreground"
              }`}
            >
              <span aria-hidden>{item.icon}</span>
              <span>{item.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  active ? "bg-white/20 text-accent-foreground" : "bg-surface-muted text-muted"
                }`}
              >
                {badge}
              </span>
            </Link>
          );
        })}
      </div>

      <div role="tabpanel" className="mt-6">
        {tab === "schools" ? (
          <section>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-foreground">Schools</h2>
              <CsvDownloadButton
                label="Export schools (CSV)"
                filename="schools.csv"
                rows={schools.map((s) => ({
                  Name: s.officialName,
                  Coordinators: (s.coordinators ?? [])
                    .map((c) => (c.mobile ? `${c.name} (${c.mobile})` : c.name))
                    .join("; "),
                  City: s.city ?? "",
                  Country: s.country ?? "",
                  "School type": s.schoolType ?? "",
                  Principal: s.principalName ?? "",
                }))}
              />
            </div>
            <div className="mt-4">
              <SchoolsTable schools={schools} />
            </div>
          </section>
        ) : null}

        {tab === "students" ? (
          <section>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-foreground">Students</h2>
              <CsvDownloadButton
                label="Export students (CSV)"
                filename="students.csv"
                rows={students.map((s) => ({
                  Name: s.fullName,
                  School: s.schoolName ?? "Independent",
                  Grade: s.grade ?? "",
                  Guardian: s.guardianName ?? "",
                }))}
              />
            </div>
            <div className="mt-4">
              <StudentsTable students={students} />
            </div>
          </section>
        ) : null}

        {tab === "teams" ? (
          <section>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-foreground">Teams</h2>
              <CsvDownloadButton
                label="Export teams (CSV)"
                filename="teams.csv"
                rows={teams.map((t) => ({
                  Team: t.name,
                  School: t.schoolName ?? "Independent",
                  Members: t.members.map((m) => m.studentName).join("; "),
                  Competitions: (t.competitionTitles ?? []).join("; "),
                }))}
              />
            </div>
            <div className="mt-4">
              <TeamsTable teams={teams} />
            </div>
          </section>
        ) : null}

        {tab === "registrations" ? (
          <section>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-foreground">Registrations</h2>
              <CsvDownloadButton
                label="Export registrations (CSV)"
                filename="registrations.csv"
                rows={registrations.map((r) => ({
                  Competition: r.competitionTitle,
                  "Entry type": r.entryType,
                  Entrant: r.entrantName,
                  "Registration #": r.registrationNumber,
                  Status: registrationStatusLabels[r.status],
                  "Submitted at": new Date(r.submittedAt).toLocaleDateString("en-GB"),
                }))}
              />
            </div>
            <div className="mt-4">
              <RegistrationsTable
                registrations={registrations}
                competitions={competitions.map((c) => ({ slug: c.slug, title: c.title }))}
              />
            </div>
          </section>
        ) : null}

        {tab === "payments" ? (
          <section>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-foreground">Payment Approvals</h2>
                <p className="mt-1 max-w-2xl text-sm text-muted">
                  Fee receipts uploaded during registration. Approving one doesn&apos;t change the
                  registration&apos;s own status — it clears the payment side of &ldquo;under review&rdquo; so the
                  entrant can see it&apos;s settled.
                </p>
              </div>
              {pendingPayments > 0 ? (
                <span className="rounded-full bg-amber-500/10 px-3 py-1.5 text-sm font-semibold text-amber-700 dark:text-amber-400">
                  {pendingPayments} awaiting review
                </span>
              ) : null}
            </div>
            <div className="mt-4">
              <PaymentsTable payments={payments} />
            </div>
            {payments.length === 0 ? (
              <p className="mt-4 text-xs text-muted">
                Nothing here yet — receipts appear as soon as a student, team or school coordinator uploads one
                during registration.
              </p>
            ) : null}
          </section>
        ) : null}
      </div>
    </div>
  );
}
