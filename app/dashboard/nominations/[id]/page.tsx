import { notFound, redirect } from "next/navigation";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { getNominationById, listClarifications } from "@/domain/award-nominations/service";
import { nominationStatusLabels } from "@/domain/award-nominations/types";
import { Badge } from "@/ui/components/Badge";
import { RespondToClarificationForm } from "@/ui/components/dashboard/RespondToClarificationForm";

export default async function TrackNominationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const nomination = await getNominationById(supabase, id);
  if (!nomination) notFound();

  const clarifications = await listClarifications(supabase, id);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{nomination.nominationNumber}</h1>
          <p className="text-muted">{nomination.categoryTitle} · {nomination.nomineeName}</p>
        </div>
        <Badge>{nominationStatusLabels[nomination.status]}</Badge>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-surface p-4">
        <h2 className="font-semibold text-foreground">Clarification requests</h2>
        <div className="mt-2 space-y-3 text-sm">
          {clarifications.map((c) => (
            <div key={c.id} className="rounded-lg border border-border p-3">
              <p className="text-foreground">{c.message}</p>
              <p className="mt-1 text-xs text-muted">Requested {new Date(c.requestedAt).toLocaleString()}</p>
              {c.responseText ? (
                <div className="mt-2 border-t border-border pt-2">
                  <p className="text-foreground">{c.responseText}</p>
                  <p className="mt-1 text-xs text-muted">Responded {c.respondedAt ? new Date(c.respondedAt).toLocaleString() : ""}</p>
                </div>
              ) : (
                <RespondToClarificationForm nominationId={nomination.id} clarificationId={c.id} />
              )}
            </div>
          ))}
          {clarifications.length === 0 && <p className="text-muted">No clarification requests — nothing to do here.</p>}
        </div>
      </div>
    </div>
  );
}
