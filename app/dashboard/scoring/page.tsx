import { redirect } from "next/navigation";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { listAssignments } from "@/domain/judging/service";
import { ScoreCard } from "@/ui/components/dashboard/ScoreCard";
import { DashboardHero } from "@/ui/components/dashboard/DashboardHero";
import { DashboardPage } from "@/ui/components/dashboard/DashboardShell";

export default async function ScoringPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.role !== "judge") redirect("/dashboard");

  const supabase = await createClient();
  const assignments = await listAssignments(supabase, user.id);

  return (
    <>
      <DashboardHero
        eyebrow="Judging"
        title="Scoring"
        subtitle="Every entrant registered for a competition you are assigned to judge."
      />
      <DashboardPage>
        <div className="space-y-3">
          {assignments.map((a) => (
            <ScoreCard key={a.id} assignment={a} />
          ))}
          {assignments.length === 0 && (
            <p className="rounded-xl border border-border bg-surface p-8 text-center text-muted">
              No entrants to score yet — apply to a competition from the Applications tab, and scoring will appear here
              once an administrator approves you.
            </p>
          )}
        </div>
      </DashboardPage>
    </>
  );
}
