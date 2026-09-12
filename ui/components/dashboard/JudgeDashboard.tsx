"use client";

import { useActionState, useState } from "react";
import type { Competition } from "@/domain/competitions/types";
import { categoryLabels, statusLabels } from "@/domain/competitions/types";
import type { JudgeApplication } from "@/domain/judge-applications/types";
import { judgeApplicationStatusLabels, interviewModeLabels } from "@/domain/judge-applications/types";
import { applyToJudgeAction, type ActionState as ApplyState } from "@/domain/judge-applications/actions";
import type { JudgeAssignment } from "@/domain/judging/types";
import { submitScoreAction, type ActionState as ScoreState } from "@/domain/judging/actions";
import { Badge } from "@/ui/components/Badge";
import { StatCard } from "./StatCard";

const applyInitialState: ApplyState = { error: null };
const scoreInitialState: ScoreState = { error: null };

const applicationStatusTone: Record<string, "success" | "warning" | "neutral" | "accent"> = {
  pending: "warning",
  interview_scheduled: "accent",
  approved: "success",
  rejected: "neutral",
};

function ApplyButton({ competitionId }: { competitionId: string }) {
  const [state, formAction, pending] = useActionState(applyToJudgeAction, applyInitialState);
  return (
    <form action={formAction}>
      <input type="hidden" name="competition_id" value={competitionId} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Applying…" : "Apply to judge"}
      </button>
      {state.error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{state.error}</p>}
      {state.success && <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">Application submitted.</p>}
    </form>
  );
}

function ScoreCard({ assignment }: { assignment: JudgeAssignment }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(submitScoreAction, scoreInitialState);
  const [values, setValues] = useState<Record<string, number>>(assignment.criteriaScores);

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-semibold text-foreground">{assignment.entrantName}</p>
          <p className="text-sm text-muted">
            {assignment.competitionTitle} · {assignment.stageTitle}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {assignment.locked ? (
            <Badge tone="neutral">Locked</Badge>
          ) : assignment.status === "scored" ? (
            <Badge tone="success">Scored — {assignment.totalScore}/100</Badge>
          ) : (
            <Badge tone="warning">Pending</Badge>
          )}
          {!assignment.locked && (
            <button
              onClick={() => setOpen((v) => !v)}
              className="rounded-full border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:border-accent"
            >
              {open ? "Close" : assignment.status === "scored" ? "Review" : "Score"}
            </button>
          )}
        </div>
      </div>

      {open && !assignment.locked && (
        <form action={formAction} className="mt-4 space-y-3 border-t border-border pt-4">
          <input type="hidden" name="judge_assignment_id" value={assignment.judgeAssignmentId} />
          <input type="hidden" name="registration_id" value={assignment.registrationId} />
          {assignment.criteria.map((c) => (
            <div key={c.name} className="flex items-center gap-4">
              <label className="w-40 shrink-0 text-sm text-foreground">
                {c.name} <span className="text-muted">({c.weight}%)</span>
              </label>
              <input type="hidden" name="criterion_name" value={c.name} />
              <input type="hidden" name="criterion_weight" value={c.weight} />
              <input
                type="range"
                name="criterion_value"
                min={0}
                max={100}
                value={values[c.name] ?? 50}
                onChange={(e) => setValues((prev) => ({ ...prev, [c.name]: Number(e.target.value) }))}
                className="flex-1"
              />
              <span className="w-10 text-right text-sm text-muted">{values[c.name] ?? 50}</span>
            </div>
          ))}
          <div>
            <label className="text-sm font-medium text-foreground">Comments (optional)</label>
            <textarea
              name="comments"
              rows={2}
              defaultValue={assignment.comments ?? ""}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </div>
          {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Submitting…" : "Submit score"}
          </button>
        </form>
      )}
    </div>
  );
}

export function JudgeDashboard({
  assignments,
  applications,
  openCompetitions,
}: {
  assignments: JudgeAssignment[];
  applications: JudgeApplication[];
  openCompetitions: Competition[];
}) {
  const pending = assignments.filter((a) => a.status === "pending").length;
  const appliedSlugs = new Set(applications.map((a) => a.competitionSlug));

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Judging</h1>
      <p className="mt-2 max-w-xl text-muted">
        Apply to judge a competition, then score assigned entrants once an administrator approves
        your application.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Assigned" value={assignments.length} />
        <StatCard label="Pending" value={pending} />
        <StatCard label="Scored" value={assignments.length - pending} />
      </div>

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
                  Interview: {interviewModeLabels[a.interviewMode ?? "online"]} on{" "}
                  {new Date(a.interviewAt).toLocaleString()} {a.interviewLocation && `— ${a.interviewLocation}`}
                </p>
              )}
              {a.status === "rejected" && a.adminNotes && <p className="mt-1 text-sm text-muted">Reason: {a.adminNotes}</p>}
            </div>
          ))}
          {applications.length === 0 && <p className="text-sm text-muted">You haven&apos;t applied to judge any competitions yet.</p>}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-foreground">Browse competitions to judge</h2>
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
                  <ApplyButton competitionId={c.id} />
                </div>
              </div>
            ))}
          {openCompetitions.filter((c) => !appliedSlugs.has(c.slug)).length === 0 && (
            <p className="text-sm text-muted">No new competitions to apply for right now.</p>
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-foreground">Scoring</h2>
        <div className="space-y-3">
          {assignments.map((a) => (
            <ScoreCard key={a.id} assignment={a} />
          ))}
          {assignments.length === 0 && (
            <p className="rounded-xl border border-border bg-surface p-8 text-center text-muted">
              No entrants to score yet — apply to a competition above, and scoring will appear here
              once an administrator approves you.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
