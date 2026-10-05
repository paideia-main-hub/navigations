import { PageBanner } from "@/ui/components/marketing/PageBanner";

export const metadata = {
  title: "Competency Vision | Navigations",
  description:
    "Navigations creates purposeful opportunities for school-age learners to develop and demonstrate future competencies.",
};

export default function CompetencyVisionPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <PageBanner
        title="Our Competency Vision"
        className="-mt-24 pt-28 pb-28 sm:-mt-28 sm:pt-32 sm:pb-32 lg:pt-36 lg:pb-36"
        showNet
        netLattice="angular"
        curvedBottom
      />

      <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-12 sm:py-16">
        <h2 className="text-2xl font-extrabold text-foreground sm:text-3xl">
          Opportunities for Future Readiness
        </h2>
        <div className="mt-6 space-y-6 text-base leading-relaxed text-muted sm:text-lg">
          <p>
            Navigations creates purposeful opportunities for school-age learners to develop and
            demonstrate future competencies through practical challenges, creative expression and
            meaningful participation. Academically grounded in future competence frameworks and
            connected with the United Nations Sustainable Development Goals, it brings learning into
            action.
          </p>
          <p>
            Its flagship initiative, Future Ready League — Lahore Edition 2026, offers 25+
            competitions and challenges across four participation pathways, recognising learners’
            skills, effort and achievement.
          </p>
        </div>
      </div>
    </div>
  );
}
