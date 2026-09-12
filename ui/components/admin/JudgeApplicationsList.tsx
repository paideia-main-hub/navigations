"use client";

import { useActionState, useState } from "react";
import {
  approveApplicationAction,
  rejectApplicationAction,
  scheduleInterviewAction,
  type ActionState,
} from "@/domain/judge-applications/actions";
import {
  interviewModeLabels,
  judgeApplicationStatusLabels,
  type AdminJudgeApplication,
  type InterviewMode,
} from "@/domain/judge-applications/types";
import { Badge } from "@/ui/components/Badge";

const initialState: ActionState = { error: null };

const statusTone: Record<string, "success" | "warning" | "neutral" | "accent"> = {
  pending: "warning",
  interview_scheduled: "accent",
  approved: "success",
  rejected: "neutral",
};

function ScheduleInterviewForm({ applicationId }: { applicationId: string }) {
  const [state, formAction, pending] = useActionState(scheduleInterviewAction, initialState);

  return (
    <form action={formAction} className="mt-3 grid gap-2 rounded-lg border border-border bg-background p-3 sm:grid-cols-4">
      <input type="hidden" name="application_id" value={applicationId} />
      <select name="mode" defaultValue={"online" as InterviewMode} className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground">
        {Object.entries(interviewModeLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <input
        type="datetime-local"
        name="interview_at"
        required
        className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
      />
      <input
        type="text"
        name="location"
        placeholder="Meeting link or address"
        className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground sm:col-span-2"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60 sm:col-span-4"
      >
        {pending ? "Scheduling…" : "Schedule interview"}
      </button>
      {state.error && <p className="text-sm text-red-600 dark:text-red-400 sm:col-span-4">{state.error}</p>}
    </form>
  );
}

function ApproveButton({ applicationId }: { applicationId: string }) {
  const [state, formAction, pending] = useActionState(approveApplicationAction, initialState);
  return (
    <form action={formAction}>
      <input type="hidden" name="application_id" value={applicationId} />
      <button type="submit" disabled={pending} className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60">
        {pending ? "Approving…" : "Approve"}
      </button>
      {state.error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}

function RejectForm({ applicationId }: { applicationId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(rejectApplicationAction, initialState);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground hover:border-accent">
        Reject
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-1 gap-2">
      <input type="hidden" name="application_id" value={applicationId} />
      <input name="notes" placeholder="Reason (optional)" className="flex-1 rounded-full border border-border bg-background px-3 py-2 text-sm text-foreground" />
      <button type="submit" disabled={pending} className="rounded-full border border-red-500 px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400">
        {pending ? "…" : "Confirm reject"}
      </button>
      {state.error && <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}

export function JudgeApplicationsList({ applications }: { applications: AdminJudgeApplication[] }) {
  const [schedulingId, setSchedulingId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {applications.map((a) => (
        <div key={a.id} className="rounded-xl border border-border bg-surface p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-semibold text-foreground">{a.judgeName}</p>
              <p className="text-sm text-muted">
                {a.judgeEmail} · applying for <span className="font-medium text-foreground">{a.competitionTitle}</span>
              </p>
            </div>
            <Badge tone={statusTone[a.status]}>{judgeApplicationStatusLabels[a.status]}</Badge>
          </div>

          {a.status === "interview_scheduled" && a.interviewAt && (
            <p className="mt-2 text-sm text-muted">
              Interview: {interviewModeLabels[a.interviewMode ?? "online"]} on{" "}
              {new Date(a.interviewAt).toLocaleString()} {a.interviewLocation && `— ${a.interviewLocation}`}
            </p>
          )}
          {a.status === "rejected" && a.adminNotes && <p className="mt-2 text-sm text-muted">Reason: {a.adminNotes}</p>}

          {(a.status === "pending" || a.status === "interview_scheduled") && (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setSchedulingId(schedulingId === a.id ? null : a.id)}
                className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground hover:border-accent"
              >
                {a.status === "interview_scheduled" ? "Reschedule" : "Schedule interview"}
              </button>
              <ApproveButton applicationId={a.id} />
              <RejectForm applicationId={a.id} />
            </div>
          )}

          {schedulingId === a.id && <ScheduleInterviewForm applicationId={a.id} />}
        </div>
      ))}
      {applications.length === 0 && <p className="text-sm text-muted">No judge applications yet.</p>}
    </div>
  );
}
