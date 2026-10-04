import { type ReactNode } from "react";
import { LayersRecognitionMark } from "@/ui/components/marketing/LayersRecognitionMark";
import { ScrollSplitCard, type ScrollSplitCardItem } from "@/ui/components/marketing/ScrollSplitCard";

function Icon({ path }: { path: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-8 w-8"
    >
      <path d={path} />
    </svg>
  );
}

const ICON_PATH: Record<string, string> = {
  certificate: "M6 2h9l5 5v9a2 2 0 0 1-2 2h-1M15 2v5h5M8 12h6M8 16h4M9 20.5 7 22v-6.5m-4 0V22l2-1.5M6 9.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z",
  badge: "M12 3.5 14 7l4 .6-2.9 2.8.7 4-3.8-2-3.8 2 .7-4L6 7.6 10 7l2-3.5Zm-4 12L6.5 22 12 19l5.5 3L16 15.5",
  chart: "M4 20V10m6 10V4m6 16v-7m6 7V8M2 20h20",
  star: "m12 2.6 2.9 5.9 6.5.9-4.7 4.6 1.1 6.4-5.8-3-5.8 3 1.1-6.4L2.6 9.4l6.5-.9L12 2.6Z",
  trophy: "M8 21h8m-4-4v4m-6-17h12v5a6 6 0 0 1-12 0V4Zm0 2H4a2 2 0 0 0 0 4h2m12-4h2a2 2 0 0 1 0 4h-2",
};

const RECOGNITION_IMAGE = "/recognition-ceremony.png";

const RECOGNITION_CARDS: ScrollSplitCardItem[] = [
  {
    title: "Competition Distinctions",
    description:
      "Recognising performance in each competition through transparent criteria, evidence-based evaluation and meaningful distinctions for participants.",
    icon: <Icon path={ICON_PATH.certificate!} />,
    bgClassName: "bg-accent-soft",
    textClassName: "text-foreground",
  },
  {
    title: "School Leaderboard and School Awards",
    description:
      "Recognising schools for achievement, participation, diversity and engagement through a transparent, balanced, merit-based evaluation framework.",
    icon: <Icon path={ICON_PATH.badge!} />,
    bgClassName: "bg-brand-deep",
    textClassName: "text-brand-deep-foreground",
  },
  {
    title: "Spotlight Awards",
    description:
      "Celebrating exceptional ideas, stories, mentorship and contributions extending beyond scheduled League competitions and formal challenges.",
    icon: <Icon path={ICON_PATH.chart!} />,
    bgClassName: "bg-accent",
    textClassName: "text-accent-foreground",
  },
  {
    title: "Teacher and Parent Recognition",
    description:
      "Honouring educators and parents whose guidance, encouragement and support meaningfully strengthen students’ future readiness journeys.",
    icon: <Icon path={ICON_PATH.star!} />,
    bgClassName: "bg-surface-alt",
    textClassName: "text-foreground",
  },
  {
    title: "Sports Recognition Awards",
    description:
      "Recognising verified sporting achievements earned outside League competitions, reflecting commitment, discipline, excellence and demonstrated perseverance.",
    icon: <Icon path={ICON_PATH.trophy!} />,
    bgClassName: "bg-brand-deep",
    textClassName: "text-brand-deep-foreground",
  },
];

export function RecognitionStrip(): ReactNode {
  return (
    <section className="relative bg-background">
      {/* Mobile-only: heading above the watermark band. */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-10 sm:hidden">
        <h2 className="flex items-center gap-3 text-sm font-bold tracking-wider text-foreground uppercase">
          <span aria-hidden="true" className="h-0.5 w-8 bg-accent" />
          5 Layers Recognitions
        </h2>
      </div>

      {/* Band height tracks the watermark type. Desktop heading sits at the bottom. */}
      <div className="relative">
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="relative flex h-[clamp(3.5rem,16vw,20rem)] items-end">
            <h2 className="relative z-10 hidden translate-y-3 items-center gap-3 text-sm font-bold tracking-wider text-foreground uppercase sm:flex">
              <span aria-hidden="true" className="h-0.5 w-8 bg-accent" />
              5 Layers Recognitions
            </h2>
          </div>
        </div>
        <LayersRecognitionMark variant="band" />
      </div>

      <ScrollSplitCard
        imageSrc={RECOGNITION_IMAGE}
        cards={RECOGNITION_CARDS}
        endLabel="Every layer of recognition, in one place."
      />
    </section>
  );
}
