import { notFound } from "next/navigation";
import { createAdminClient } from "@/data/supabase/admin";
import { adminGetCompetitionById } from "@/domain/competitions/service";
import { statusLabels } from "@/domain/competitions/types";
import { Tabs } from "@/ui/components/Tabs";
import { Badge } from "@/ui/components/Badge";
import { CompetitionStatusControl } from "@/ui/components/admin/CompetitionStatusControl";
import { CompetitionOverviewForm } from "@/ui/components/admin/CompetitionOverviewForm";
import { CompetitionEligibilityForm } from "@/ui/components/admin/CompetitionEligibilityForm";
import { CompetitionStagesForm } from "@/ui/components/admin/CompetitionStagesForm";
import { CompetitionRubricsForm } from "@/ui/components/admin/CompetitionRubricsForm";
import { CompetitionManualsForm } from "@/ui/components/admin/CompetitionManualsForm";
import { CompetitionResourcesForm } from "@/ui/components/admin/CompetitionResourcesForm";
import { CompetitionFaqsForm } from "@/ui/components/admin/CompetitionFaqsForm";
import { CompetitionDatesForm } from "@/ui/components/admin/CompetitionDatesForm";
import { CompetitionWinnersForm } from "@/ui/components/admin/CompetitionWinnersForm";

export default async function EditCompetitionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();
  const competition = await adminGetCompetitionById(admin, id);
  if (!competition) notFound();

  const tabs = [
    { id: "overview", label: "Overview", content: <CompetitionOverviewForm competition={competition} /> },
    { id: "eligibility", label: "Eligibility & Rules", content: <CompetitionEligibilityForm competition={competition} /> },
    { id: "stages", label: "Stages & Challenges", content: <CompetitionStagesForm competition={competition} /> },
    { id: "judging", label: "Judging & Rubrics", content: <CompetitionRubricsForm competition={competition} /> },
    { id: "manual", label: "Manual", content: <CompetitionManualsForm competition={competition} /> },
    { id: "practice", label: "Practice & Resource Pack", content: <CompetitionResourcesForm competition={competition} /> },
    { id: "dates", label: "Important Dates", content: <CompetitionDatesForm competition={competition} /> },
    { id: "faq", label: "FAQ", content: <CompetitionFaqsForm competition={competition} /> },
    { id: "winners", label: "Winners Gallery", content: <CompetitionWinnersForm competition={competition} /> },
    {
      id: "results",
      label: "Results",
      content: (
        <p className="max-w-2xl text-sm text-muted">
          Results are generated from real registrations and judge scoring, then reviewed and published from the
          dedicated{" "}
          <a href={`/admin/results?competition=${competition.id}`} className="font-semibold text-accent">
            Results
          </a>{" "}
          section — publishing there also fills in this competition&apos;s Winners Gallery tab automatically.
        </p>
      ),
    },
    {
      id: "announcements",
      label: "Announcements",
      content: (
        <p className="max-w-2xl text-sm text-muted">
          Manage this competition&apos;s announcements from the{" "}
          <a href="/admin/announcements" className="font-semibold text-accent">
            Announcements
          </a>{" "}
          section — scope one to this competition from there.
        </p>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <Badge>{competition.domain || "No domain set"}</Badge>
        <Badge tone={competition.status === "open" ? "success" : "neutral"}>{statusLabels[competition.status]}</Badge>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground">{competition.title || "Untitled competition"}</h1>
        <CompetitionStatusControl competitionId={competition.id} status={competition.status} />
      </div>

      <div className="mt-8">
        <Tabs tabs={tabs} />
      </div>
    </div>
  );
}
