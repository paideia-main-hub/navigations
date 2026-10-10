import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { getOwnStudentProfile } from "@/domain/students/service";
import { getSubmissionForRegistration, listOnlineSubmissionCompetitions, listOwnRegistrationsIn } from "@/data/repositories/submissions.repository";
import { categoryLabels, type AgeCategory } from "@/domain/competitions/types";
import { submissionConfigFor } from "@/domain/submissions/config";
import { SubmissionForm } from "@/ui/components/dashboard/SubmissionForm";
import { DashboardHero } from "@/ui/components/dashboard/DashboardHero";
import { DashboardPage } from "@/ui/components/dashboard/DashboardShell";

export default async function SubmitWorkPage({ params }: { params: Promise<{ registrationId: string }> }) {
  const { registrationId } = await params;
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.role !== "student") redirect("/dashboard");

  const supabase = await createClient();
  const student = await getOwnStudentProfile(supabase, user.id);
  const online = await listOnlineSubmissionCompetitions(supabase);
  // Only registrations that belong to this student — anyone else's id 404s.
  const registration = (
    await listOwnRegistrationsIn(
      supabase,
      user.id,
      student?.id ?? null,
      online.map((competition) => competition.slug),
    )
  ).find((r) => r.registrationId === registrationId);
  if (!registration) notFound();
  const config = submissionConfigFor(registration.competitionSlug);
  const submission = config ? await getSubmissionForRegistration(supabase, registrationId) : null;
  const gradeCategory = [
    registration.grade,
    registration.category ? (categoryLabels[registration.category as AgeCategory] ?? registration.category) : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const showsEntryRecord =
    registration.competitionSlug !== "inquiryquest" &&
    registration.competitionSlug !== "culturescript" &&
    registration.competitionSlug !== "message-for-humanity";

  return (
    <>
      <DashboardHero
        eyebrow="Submit work"
        title={config?.title ?? registration.competitionTitle}
        subtitle={`${registration.registrationNumber}${student?.frlId ? ` · ${student.frlId}` : ""} · ${registration.entrantName}`}
      />
      <DashboardPage>
        <div className="max-w-3xl">
          <Link
            href="/dashboard/submissions"
            prefetch
            className="inline-flex text-sm font-semibold text-accent hover:opacity-90"
          >
            ← Back to Work Submissions
          </Link>
          {config ? (
            <>
              <p className="mt-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm leading-relaxed text-muted">
                {config.brief}
              </p>
              {showsEntryRecord ? (
              <dl className="mt-3 grid gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold text-muted">Registration / Entry ID</dt>
                  <dd className="text-foreground">{registration.registrationNumber}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-muted">Competition</dt>
                  <dd className="text-foreground">{registration.competitionTitle}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-muted">{registration.entryType === "team" ? "Team" : "Student"}</dt>
                  <dd className="text-foreground">{registration.entrantName || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-muted">School</dt>
                  <dd className="text-foreground">{registration.schoolName ?? "Independent"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-muted">Grade / category</dt>
                  <dd className="text-foreground">{gradeCategory || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-muted">Participation type</dt>
                  <dd className="text-foreground">{registration.entryType === "team" ? "Team" : "Individual"}</dd>
                </div>
                {registration.entryType === "team" ? (
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-semibold text-muted">Team members</dt>
                    <dd className="text-foreground">
                      {registration.teamMembers.length > 0 ? registration.teamMembers.join(", ") : "—"}
                    </dd>
                  </div>
                ) : null}
              </dl>
              ) : null}
              <div className="mt-4">
                <SubmissionForm
                  registrationId={registrationId}
                  registrationNumber={registration.registrationNumber}
                  config={config}
                  initial={submission}
                />
              </div>
            </>
          ) : (
            <p className="mt-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm leading-relaxed text-muted">
              Online submission is open for this competition. The questions to collect will be added later.
            </p>
          )}
        </div>
      </DashboardPage>
    </>
  );
}
