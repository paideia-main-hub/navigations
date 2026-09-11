import { getCurrentUser } from "@/domain/auth/session";

const copy: Record<string, { title: string; body: string }> = {
  student: {
    title: "My Competitions",
    body: "Registered competitions, deadlines, manuals, resources and results will appear here once you register for a competition.",
  },
  school_coordinator: {
    title: "School Dashboard",
    body: "Add students, create teams, register for competitions and track results — this dashboard is wired up next.",
  },
  judge: {
    title: "Judging",
    body: "Assigned rounds, rubrics and scoring will appear here once judge assignments are configured by an admin.",
  },
  admin: {
    title: "Admin Console",
    body: "Manage competitions, users, registrations, announcements and results — the admin CMS is being built next.",
  },
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const { title, body } = copy[user?.role ?? "student"];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      <p className="mt-2 max-w-xl text-muted">{body}</p>
    </div>
  );
}
