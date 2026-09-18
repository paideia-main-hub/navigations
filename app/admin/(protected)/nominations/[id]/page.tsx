import { notFound } from "next/navigation";
import { createAdminClient } from "@/data/supabase/admin";
import { getNominationById, listClarifications } from "@/domain/award-nominations/service";
import { nominationStatusLabels } from "@/domain/award-nominations/types";
import { adminGetCategoryById } from "@/domain/awards/service";
import { listScoresForNomination } from "@/domain/award-judging/service";
import { getEvidenceSignedUrl } from "@/domain/storage/actions";
import { Badge } from "@/ui/components/Badge";
import { NominationReviewPanel } from "@/ui/components/admin/NominationReviewPanel";

export default async function AdminNominationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();
  const nomination = await getNominationById(admin, id);
  if (!nomination) notFound();

  const [category, scores, clarifications] = await Promise.all([
    adminGetCategoryById(admin, nomination.categoryId),
    listScoresForNomination(admin, nomination.id),
    listClarifications(admin, nomination.id),
  ]);

  const evidenceLinks = await Promise.all(
    nomination.evidenceFiles.map(async (f) => ({
      ...f,
      viewUrl: f.fileType === "link" ? f.fileUrl : (await getEvidenceSignedUrl(f.fileUrl)).url,
    })),
  );

  const average = scores.length > 0 ? Math.round(scores.reduce((sum, s) => sum + (s.totalScore ?? 0), 0) / scores.length) : null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{nomination.nominationNumber}</h1>
          <p className="text-muted">
            {nomination.categoryTitle} · {nomination.nomineeName}
          </p>
        </div>
        <Badge>{nominationStatusLabels[nomination.status]}</Badge>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-surface p-4">
            <h2 className="font-semibold text-foreground">Nominee</h2>
            <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted">Name</dt>
                <dd className="text-foreground">{nomination.nomineeName}</dd>
              </div>
              <div>
                <dt className="text-muted">Relationship / role</dt>
                <dd className="text-foreground">{nomination.nomineeRelationship ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted">School</dt>
                <dd className="text-foreground">{nomination.schoolName ?? "Independent"}</dd>
              </div>
              {nomination.route && (
                <div>
                  <dt className="text-muted">Route</dt>
                  <dd className="text-foreground capitalize">{nomination.route.replace("_", " ")}</dd>
                </div>
              )}
              <div>
                <dt className="text-muted">Verifier</dt>
                <dd className="text-foreground">
                  {nomination.verifierName ?? "—"} {nomination.verifierContact && `(${nomination.verifierContact})`}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <h2 className="font-semibold text-foreground">Submission</h2>
            <dl className="mt-2 space-y-3 text-sm">
              {Object.entries(nomination.formData).map(([key, value]) => (
                <div key={key}>
                  <dt className="font-medium text-foreground capitalize">{key.replace(/_/g, " ")}</dt>
                  <dd className="text-muted whitespace-pre-wrap">{value || "—"}</dd>
                </div>
              ))}
              {Object.keys(nomination.formData).length === 0 && <p className="text-muted">No free-text fields for this category.</p>}
            </dl>
          </div>

          {nomination.eventRecords.length > 0 && (
            <div className="rounded-xl border border-border bg-surface p-4">
              <h2 className="font-semibold text-foreground">Event records</h2>
              <div className="mt-2 space-y-2">
                {nomination.eventRecords.map((e, i) => (
                  <div key={e.id ?? i} className="rounded-lg border border-border p-3 text-sm">
                    <p className="font-medium text-foreground">
                      {e.sport} {e.event && `— ${e.event}`}
                    </p>
                    <p className="text-muted">
                      {e.organizer} · {e.level} · {e.role} · {e.result}
                    </p>
                    {e.evidenceNote && <p className="mt-1 text-xs text-muted">{e.evidenceNote}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-border bg-surface p-4">
            <h2 className="font-semibold text-foreground">Evidence (private)</h2>
            <ul className="mt-2 space-y-1 text-sm">
              {evidenceLinks.map((f) => (
                <li key={f.id}>
                  {f.viewUrl ? (
                    <a href={f.viewUrl} target="_blank" rel="noreferrer" className="font-semibold text-accent">
                      {f.fileType.toUpperCase()} — view
                    </a>
                  ) : (
                    <span className="text-muted">{f.fileType.toUpperCase()} — link expired, re-request from nominator</span>
                  )}
                </li>
              ))}
              {evidenceLinks.length === 0 && <li className="text-muted">No evidence uploaded.</li>}
            </ul>
          </div>

          {clarifications.length > 0 && (
            <div className="rounded-xl border border-border bg-surface p-4">
              <h2 className="font-semibold text-foreground">Clarification history</h2>
              <div className="mt-2 space-y-3 text-sm">
                {clarifications.map((c) => (
                  <div key={c.id} className="rounded-lg border border-border p-3">
                    <p className="text-foreground">{c.message}</p>
                    <p className="mt-1 text-xs text-muted">Requested {new Date(c.requestedAt).toLocaleString()}</p>
                    {c.responseText && (
                      <div className="mt-2 border-t border-border pt-2">
                        <p className="text-foreground">{c.responseText}</p>
                        <p className="mt-1 text-xs text-muted">Responded {c.respondedAt ? new Date(c.respondedAt).toLocaleString() : ""}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {category && category.rubricCriteria.length > 0 && (
            <div className="rounded-xl border border-border bg-surface p-4">
              <h2 className="font-semibold text-foreground">Judging</h2>
              <p className="mt-1 text-xs text-muted">Pass threshold: {category.passThreshold}%</p>
              <div className="mt-3 space-y-2 text-sm">
                {scores.map((s, i) => (
                  <div key={i} className="rounded-lg border border-border p-2">
                    <p className="font-medium text-foreground">
                      {s.judgeName}: {s.totalScore ?? "—"}%
                    </p>
                    {s.comments && <p className="text-xs text-muted">{s.comments}</p>}
                  </div>
                ))}
                {scores.length === 0 && <p className="text-muted">No judge has scored this yet.</p>}
              </div>
              {average != null && (
                <p className={`mt-2 text-sm font-semibold ${average >= category.passThreshold ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                  Average: {average}% {average >= category.passThreshold ? "— meets threshold" : "— below threshold"}
                </p>
              )}
            </div>
          )}

          <NominationReviewPanel nominationId={nomination.id} status={nominationStatusLabels[nomination.status]} />
        </div>
      </div>
    </div>
  );
}
