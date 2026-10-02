import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { getOwnStudentProfile } from "@/domain/students/service";
import { listOwnRegistrationsIn, listSubmissionsForRegistrations } from "@/data/repositories/submissions.repository";
import { SUBMISSION_COMPETITIONS, SUBMISSION_SLUGS, submissionStatusLabels } from "@/domain/submissions/config";

export default async function WorkSubmissionsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.role !== "student") redirect("/dashboard");

  const supabase = await createClient();
  const student = await getOwnStudentProfile(supabase, user.id);
  const registrations = await listOwnRegistrationsIn(supabase, user.id, student?.id ?? null, SUBMISSION_SLUGS);
  const submissions = await listSubmissionsForRegistrations(supabase, registrations.map((r) => r.registrationId));
  const byRegistration = new Map(submissions.map((s) => [s.registrationId, s]));

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Work Submissions</h1>
      <p className="mt-2 max-w-2xl text-muted">
        {SUBMISSION_COMPETITIONS.map((c) => c.title).join(", ")} are Independent Submission competitions — you hand in your work here
        and it&apos;s reviewed and scored by the League team. Open a competition you&apos;re registered in to submit your entry.
      </p>

      {registrations.length === 0 ? (
        <div className="mt-6 rounded-xl border border-border bg-surface p-8 text-center">
          <p className="text-muted">You aren&apos;t registered in any Independent Submission competition yet.</p>
          <Link href="/dashboard/competitions#register" className="mt-3 inline-block text-sm font-semibold text-accent">
            Register from My Competitions →
          </Link>
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {registrations.map((r) => {
            const s = byRegistration.get(r.registrationId);
            const status = s?.status ?? null;
            return (
              <li key={r.registrationId} className="flex flex-col rounded-xl border border-border bg-surface p-5">
                <p className="text-[0.68rem] font-semibold tracking-[0.14em] text-accent-strong uppercase">Independent Submission</p>
                <p className="mt-1 text-lg font-bold text-foreground">{r.competitionTitle}</p>
                <p className="text-xs text-muted">
                  {r.registrationNumber}
                  {r.entryType === "team" ? ` · Team ${r.entrantName}` : ""}
                </p>
                <p
                  className={`mt-3 inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                    status === "scored"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                      : status === "submitted"
                        ? "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
                  }`}
                >
                  {status ? submissionStatusLabels[status] : "Not started"}
                  {status === "scored" && s?.totalScore != null ? ` · ${s.totalScore}/${s.maxScore}` : ""}
                </p>
                <Link
                  href={`/dashboard/submissions/${r.registrationId}`}
                  className="mt-4 w-fit rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90"
                >
                  {status === "scored" ? "View score & feedback" : status === "submitted" ? "View / update submission" : "Open & submit work"}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
