import { redirect } from "next/navigation";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { listAssignments } from "@/domain/award-judging/service";
import { AwardScoreCard } from "@/ui/components/dashboard/AwardScoreCard";
import { DashboardHero } from "@/ui/components/dashboard/DashboardHero";
import { DashboardPage } from "@/ui/components/dashboard/DashboardShell";

export default async function AwardScoringPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.role !== "judge") redirect("/dashboard");

  const supabase = await createClient();
  const assignments = await listAssignments(supabase, user.id);

  return (
    <>
      <DashboardHero
        eyebrow="Judging"
        title="Award Scoring"
        subtitle="Every nomination in an award category you are assigned to judge."
      />
      <DashboardPage>
        <div className="space-y-3">
          {assignments.map((a) => (
            <AwardScoreCard key={a.id} assignment={a} />
          ))}
          {assignments.length === 0 && (
            <p className="rounded-xl border border-border bg-surface p-8 text-center text-muted">
              No nominations to score yet — an administrator assigns judges to award categories from the Awards
              console.
            </p>
          )}
        </div>
      </DashboardPage>
    </>
  );
}
