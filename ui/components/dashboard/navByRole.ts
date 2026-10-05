import type { UserRole } from "@/domain/auth/session";

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: string;
}

/** Role-scoped dashboard destinations — shared by sidebar and header account menu. */
export const NAV_BY_ROLE: Record<UserRole, DashboardNavItem[]> = {
  student: [
    { href: "/dashboard", label: "Overview", icon: "🏠" },
    { href: "/dashboard/competitions", label: "My Competitions", icon: "🏆" },
    { href: "/dashboard/submissions", label: "Work Submissions", icon: "📤" },
    { href: "/dashboard/history", label: "History & Results", icon: "📜" },
    { href: "/dashboard/register", label: "Register", icon: "➕" },
    { href: "/dashboard/nominate", label: "Start Nomination", icon: "✨" },
    { href: "/dashboard/nominations", label: "My Nominations", icon: "🎖️" },
    { href: "/dashboard/account", label: "Account", icon: "🔐" },
  ],
  school_coordinator: [
    { href: "/dashboard", label: "Overview", icon: "🏠" },
    { href: "/dashboard/registrations", label: "Registrations", icon: "📋" },
    { href: "/dashboard/students", label: "Students", icon: "🎓" },
    { href: "/dashboard/teams", label: "Teams", icon: "👥" },
    { href: "/dashboard/history", label: "History & Results", icon: "📜" },
    { href: "/dashboard/register", label: "Register", icon: "➕" },
    { href: "/dashboard/nominate", label: "Start Nomination", icon: "✨" },
    { href: "/dashboard/nominations", label: "My Nominations", icon: "🎖️" },
    { href: "/dashboard/account", label: "Account", icon: "🔐" },
  ],
  judge: [
    { href: "/dashboard", label: "Overview", icon: "🏠" },
    { href: "/dashboard/scoring", label: "Scoring", icon: "✅" },
    { href: "/dashboard/award-scoring", label: "Award Scoring", icon: "🎖️" },
    { href: "/dashboard/applications", label: "Applications", icon: "📝" },
    { href: "/dashboard/account", label: "Account", icon: "🔐" },
  ],
  nominator: [
    { href: "/dashboard", label: "Overview", icon: "🏠" },
    { href: "/dashboard/nominate", label: "Start Nomination", icon: "✨" },
    { href: "/dashboard/nominations", label: "My Nominations", icon: "🎖️" },
    { href: "/dashboard/account", label: "Account", icon: "🔐" },
  ],
  admin: [{ href: "/admin", label: "Admin Console", icon: "🛠️" }],
};

export const ROLE_LABELS: Record<UserRole, string> = {
  student: "Student",
  school_coordinator: "School Coordinator",
  judge: "Judge",
  nominator: "Nominator",
  admin: "Administrator",
};
