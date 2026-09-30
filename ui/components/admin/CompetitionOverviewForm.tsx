"use client";

import { useActionState } from "react";
import { updateCompetitionCoreAction, type ActionState } from "@/domain/competitions/actions";
import { pathwayLabels, pathwayOrder, type Competition } from "@/domain/competitions/types";
import { FormField } from "@/ui/components/FormField";

const initialState: ActionState = { error: null };

export function CompetitionOverviewForm({ competition }: { competition: Competition }) {
  const [state, formAction, pending] = useActionState(updateCompetitionCoreAction, initialState);

  return (
    <form action={formAction} className="max-w-2xl space-y-4">
      <input type="hidden" name="competition_id" value={competition.id} />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Title" name="title" required defaultValue={competition.title} />
        <div>
          <FormField label="Slug" name="slug" required defaultValue={competition.slug} />
          <p className="mt-1 text-xs text-muted">Used in the public URL — spaces/punctuation are converted to hyphens automatically.</p>
        </div>
      </div>
      <FormField label="Short description" name="short_description" defaultValue={competition.shortDescription} />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Important Dates card 1" name="dates_card_one" defaultValue={competition.datesCardOne} />
        <FormField label="Important Dates card 2" name="dates_card_two" defaultValue={competition.datesCardTwo} />
      </div>
      <p className="-mt-2 text-xs text-muted">
        Shown as small cards at the bottom of this competition&apos;s Important Dates slide. Leave a field blank to hide that card.
      </p>
      <div>
        <label className="text-sm font-medium text-foreground">Overview</label>
        <textarea
          name="overview"
          rows={5}
          defaultValue={competition.overview}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
        />
      </div>
      <FormField label="Domain / competency area" name="domain" defaultValue={competition.domain} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-foreground">Participation category</label>
          <select
            name="pathway"
            defaultValue={competition.pathway ?? ""}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
          >
            <option value="">Not assigned</option>
            {pathwayOrder.map((p) => (
              <option key={p} value={p}>
                {pathwayLabels[p]}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted">Which Route 1 card this appears under on the home page.</p>
        </div>
        <div>
          <FormField label="Image URL" name="image_url" defaultValue={competition.imageUrl ?? ""} />
          <p className="mt-1 text-xs text-muted">
            Card artwork. Leave blank to use the default at /competitions/{competition.slug}.webp.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" name="supports_individual" defaultChecked={competition.supportsIndividual} />
          Supports individual entries
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" name="supports_team" defaultChecked={competition.supportsTeam} />
          Supports team entries
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FormField label="Fee amount" name="fee_amount" type="number" defaultValue={competition.feeAmount?.toString() ?? ""} />
          <p className="mt-1 text-xs text-muted">
            Every registration requires a fee receipt upload regardless — leave blank if the amount isn&apos;t set yet and
            students will see &ldquo;to be confirmed&rdquo;.
          </p>
        </div>
        <FormField label="Season" name="season" defaultValue={competition.season ?? ""} />
      </div>

      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      {state.success && <p className="text-sm text-emerald-600 dark:text-emerald-400">Saved.</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save overview"}
      </button>
    </form>
  );
}
