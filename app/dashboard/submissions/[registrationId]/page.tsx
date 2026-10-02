import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { getOwnStudentProfile } from "@/domain/students/service";
import { getSubmissionForRegistration, listOwnRegistrationsIn } from "@/data/repositories/submissions.repository";
import { submissionConfigFor, SUBMISSION_SLUGS } from "@/domain/submissions/config";
import { SubmissionForm } from "@/ui/components/dashboard/SubmissionForm";

export default async function SubmitWorkPage({ params }: { params: Promise<{ registrationId: string }> }) {
  const { registrationId } = await params;
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.role !== "student") redirect("/dashboard");

  const supabase = await createClient();
  const student = await getOwnStudentProfile(supabase, user.id);
  // Only registrations that belong to this student — anyone else's id 404s.
  const registration = (await listOwnRegistrationsIn(supabase, user.id, student?.id ?? null, SUBMISSION_SLUGS)).find(
    (r) => r.registrationId === registrationId,
  );
  const config = registration ? submissionConfigFor(registration.competitionSlug) : undefined;
  if (!registration || !config) notFound();

  const submission = await getSubmissionForRegistration(supabase, registrationId);

  return (
    <div className="max-w-3xl">
      <Link href="/dashboard/submissions" className="text-sm font-semibold text-accent">
        ← Work Submissions
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-foreground">{config.title} — submit your work</h1>
      <p className="mt-1 text-sm text-muted">
        {registration.registrationNumber}
        {student?.frlId ? ` · ${student.frlId}` : ""} · {registration.entrantName}
      </p>
      <p className="mt-4 rounded-xl border border-border bg-surface p-4 text-sm text-foreground">{config.brief}</p>

      <div className="mt-6">
        <SubmissionForm
          registrationId={registrationId}
          userId={user.id}
          config={config}
          initial={submission}
        />
      </div>
    </div>
  );
}
