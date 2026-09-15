import { redirect } from "next/navigation";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { listMyApplications } from "@/domain/judge-applications/service";
import { judgeApplicationStatusLabels, interviewModeLabels } from "@/domain/judge-applications/types";
import { listOpenAndUpcoming } from "@/domain/competitions/service";
import { categoryLabels, statusLabels } from "@/domain/competitions/types";
import { ApplyToJudgeButton } from "@/ui/components/dashboard/ApplyToJudgeButton";
import { Badge } from "@/ui/components/Badge";

const applicationStatusTone: Record<string, "success" | "warning" | "neutral" | "accent"> = {
  pending: "warning",
  interview_scheduled: "accent",
  approved: "success",
  rejected: "neutral",
};

export default async function ApplicationsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.role !== "judge") redirect("/dashboard");

  const supabase = await createClient();
  const [applications, openCompetitions] = await Promise.all([listMyApplications(supabase, user.id), listOpenAndUpcoming(supabase)]);
  const appliedSlugs = new Set(applications.map((a) => a.competitionSlug));

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Applications</h1>
      <p className="mt-2 max-w-xl text-muted">Apply to judge a competition, then score assigned entrants once an administrator approves your application.</p>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-foreground">My Applications</h2>
        <div className="space-y-3">
          {applications.map((a) => (
            <div key={a.id} className="rounded-xl border border-border bg-surface p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-foreground">{a.competitionTitle}</p>
                <Badge tone={applicationStatusTone[a.status]}>{judgeApplicationStatusLabels[a.status]}</Badge>
              </div>
              {a.status === "interview_scheduled" && a.interviewAt && (
                <p className="mt-1 text-sm text-muted">
                  Interview: {interviewModeLabels[a.interviewMode ?? "online"]} on {new Date(a.interviewAt).toLocaleString()}{" "}
                  {a.interviewLocation && `— ${a.interviewLocation}`}
                </p>
              )}
              {a.status === "rejected" && a.adminNotes && <p className="mt-1 text-sm text-muted">Reason: {a.adminNotes}</p>}
            </div>
          ))}
          {applications.length === 0 && <p className="text-sm text-muted">You haven&apos;t applied to judge any competitions yet.</p>}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-foreground">Browse Competitions to Judge</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {openCompetitions
            .filter((c) => !appliedSlugs.has(c.slug))
            .map((c) => (
              <div key={c.slug} className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4">
                <div className="flex items-center justify-between">
                  <Badge>{c.domain || "Uncategorized"}</Badge>
                  <Badge tone={c.status === "open" ? "success" : "warning"}>{statusLabels[c.status]}</Badge>
                </div>
                <p className="font-semibold text-foreground">{c.title}</p>
                <div className="flex flex-wrap gap-1">
                  {c.eligibility.map((e) => (
                    <span key={e.id} className="rounded-md bg-surface-muted px-2 py-0.5 text-xs text-muted">
                      {categoryLabels[e.category]}
                    </span>
                  ))}
                </div>
                <div className="mt-2">
                  <ApplyToJudgeButton competitionId={c.id} />
                </div>
              </div>
            ))}
          {openCompetitions.filter((c) => !appliedSlugs.has(c.slug)).length === 0 && (
            <p className="text-sm text-muted">No new competitions to apply for right now.</p>
          )}
        </div>
      </section>
    </div>
  );
}
