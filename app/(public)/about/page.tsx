import { PageBanner } from "@/ui/components/marketing/PageBanner";

export const metadata = { title: "About | Future Competence Series" };

export default function AboutPage() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      <PageBanner eyebrow="Competency Vision" title="About / Competency Vision" />
      <div className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-slate-600 dark:text-slate-400">
          The Future Competence Series is both a public information website and an operational
          competition platform, supporting around 27 competitions for Primary, Middle and Secondary
          students. It exists to give students a structured way to develop and demonstrate real
          competencies — not just to collect certificates — through registration, preparation,
          practice resources, transparent judging and published results.
        </p>
      </div>
    </div>
  );
}
