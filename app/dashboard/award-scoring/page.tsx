import { redirect } from "next/navigation";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { listAssignments } from "@/domain/award-judging/service";
import { AwardScoreCard } from "@/ui/components/dashboard/AwardScoreCard";

export default async function AwardScoringPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.role !== "judge") redirect("/dashboard");

  const supabase = await createClient();
  const assignments = await listAssignments(supabase, user.id);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Award Scoring</h1>
      <p className="mt-2 max-w-xl text-muted">Every nomination in an award category you&apos;re assigned to judge.</p>

      <div className="mt-6 space-y-3">
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
    </div>
  );
}
