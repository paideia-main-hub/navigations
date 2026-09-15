import { redirect } from "next/navigation";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { listAssignments } from "@/domain/judging/service";
import { ScoreCard } from "@/ui/components/dashboard/ScoreCard";

export default async function ScoringPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.role !== "judge") redirect("/dashboard");

  const supabase = await createClient();
  const assignments = await listAssignments(supabase, user.id);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Scoring</h1>
      <p className="mt-2 max-w-xl text-muted">Every entrant registered for a competition you&apos;re assigned to judge.</p>

      <div className="mt-6 space-y-3">
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
    </div>
  );
}
