import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  const role = profile?.role ?? "student";

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

  const { title, body } = copy[role] ?? copy.student;

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{title}</h1>
      <p className="mt-2 max-w-xl text-zinc-600 dark:text-zinc-400">{body}</p>
    </div>
  );
}
