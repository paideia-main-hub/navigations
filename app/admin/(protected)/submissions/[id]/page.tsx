import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/data/supabase/admin";
import { adminGetSubmission } from "@/data/repositories/submissions.repository";
import { adminListCompetitions } from "@/domain/competitions/service";
import { categoryLabels, type AgeCategory } from "@/domain/competitions/types";
import { isFieldVisible, rubricCriteria, submissionConfigFor, wordCount } from "@/domain/submissions/config";
import { SubmissionFileLink } from "@/ui/components/admin/SubmissionFileLink";
import { SubmissionScoreForm } from "@/ui/components/admin/SubmissionScoreForm";

export default async function AdminSubmissionReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();
  const submission = await adminGetSubmission(admin, id);
  if (!submission) notFound();

  const config = submissionConfigFor(submission.competitionSlug);
  const competitions = await adminListCompetitions(admin);
  const competitionTitle =
    config?.title ?? competitions.find((c) => c.slug === submission.competitionSlug)?.title ?? submission.competitionSlug;

  const visibleFields = config?.fields.filter((f) => isFieldVisible(f, submission.answers)) ?? [];
  const extraAnswers = Object.entries(submission.answers).filter(
    ([key]) => !visibleFields.some((f) => f.id === key || ("linkAlternative" in f && f.linkAlternative === key)),
  );
  const extraFiles = Object.entries(submission.files).filter(([key]) => !visibleFields.some((f) => f.id === key));

  return (
    <div>
      <Link href={`/admin/submissions?competition=${submission.competitionSlug}`} className="text-sm font-semibold text-accent">
        ← Work Submissions · {competitionTitle}
      </Link>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{submission.answers.title || competitionTitle}</h1>
          <p className="mt-1 text-sm text-muted">
            {submission.entrantName}
            {submission.frlId ? ` · ${submission.frlId}` : ""} · {submission.registrationNumber} · {submission.schoolName ?? "Independent"}
            {submission.category ? ` · ${categoryLabels[submission.category as AgeCategory] ?? submission.category}` : ""}
            {submission.grade ? ` · Grade ${submission.grade}` : ""}
          </p>
          {submission.submittedAt && (
            <p className="text-xs text-muted">Submitted {new Date(submission.submittedAt).toLocaleString("en-GB")}</p>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <section className="space-y-3">
          <h2 className="text-sm font-bold tracking-wider text-muted uppercase">The entry</h2>
          <dl className="divide-y divide-border rounded-xl border border-border bg-surface">
            {visibleFields.map((field) => {
              if (field.kind === "file") {
                const file = submission.files[field.id];
                const link = field.linkAlternative ? submission.answers[field.linkAlternative] : "";
                return (
                  <div key={field.id} className="px-4 py-3">
                    <dt className="text-xs font-semibold text-muted">{field.label}</dt>
                    <dd className="mt-1 text-sm">
                      {file ? <SubmissionFileLink path={file.path} name={file.name} size={file.size} /> : link ? null : <span className="text-muted">Not provided</span>}
                    </dd>
                  </div>
                );
              }
              if (field.kind === "url") {
                const url = submission.answers[field.id];
                if (!url) return null;
                return (
                  <div key={field.id} className="px-4 py-3">
                    <dt className="text-xs font-semibold text-muted">{field.label.replace(/^…or /, "")}</dt>
                    <dd className="mt-1 text-sm">
                      <a href={url} target="_blank" rel="noopener noreferrer" className="font-semibold break-all text-accent hover:underline">
                        {url} ↗
                      </a>
                    </dd>
                  </div>
                );
              }
              const value = submission.answers[field.id];
              const words =
                field.kind === "textarea" && field.words && value
                  ? wordCount(value)
                  : null;
              return (
                <div key={field.id} className="px-4 py-3">
                  <dt className="text-xs font-semibold text-muted">
                    {field.kind === "declaration" ? "Declaration" : field.label}
                    {words != null ? ` · ${words} words` : ""}
                  </dt>
                  <dd className="mt-1 text-sm whitespace-pre-line text-foreground">
                    {field.kind === "declaration" ? (
                      <span>
                        {value === "yes" ? "✓ " : "✗ Not confirmed — "}
                        {field.label}
                      </span>
                    ) : (
                      value || <span className="text-muted">—</span>
                    )}
                  </dd>
                </div>
              );
            })}
            {extraAnswers.map(([key, value]) => (
              <div key={key} className="px-4 py-3">
                <dt className="text-xs font-semibold text-muted">{key}</dt>
                <dd className="mt-1 text-sm whitespace-pre-line text-foreground">{value || "—"}</dd>
              </div>
            ))}
            {extraFiles.map(([key, file]) => (
              <div key={key} className="px-4 py-3">
                <dt className="text-xs font-semibold text-muted">{key}</dt>
                <dd className="mt-1 text-sm">
                  <SubmissionFileLink path={file.path} name={file.name} size={file.size} />
                </dd>
              </div>
            ))}
            {visibleFields.length === 0 && extraAnswers.length === 0 && extraFiles.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted">No answers or files on this entry yet.</p>
            ) : null}
          </dl>
        </section>

        <section>
          <h2 className="text-sm font-bold tracking-wider text-muted uppercase">Score</h2>
          <div className="mt-3">
            {config && rubricCriteria(config).length > 0 ? (
              <SubmissionScoreForm
                submissionId={submission.id}
                rubric={config.rubric}
                initialScores={submission.scores}
                initialFeedback={submission.feedback ?? ""}
                scored={submission.status === "scored"}
              />
            ) : (
              <p className="rounded-xl border border-border bg-surface px-4 py-4 text-sm text-muted">
                This competition does not have a published online-submission rubric yet, so marks can&apos;t be entered
                here. The uploaded work is still available on the left.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
