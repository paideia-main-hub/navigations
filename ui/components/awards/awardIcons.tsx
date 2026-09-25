import type { ReactNode } from "react";
import type { AwardLayer } from "@/domain/awards/types";

/** One icon per recognition layer — 24x24, drawn in currentColor so each
 * section tints its own tile, matching the stroke weight of
 * ui/components/marketing/faqIcons.tsx without repurposing that file's own
 * (differently scoped) icon set. */
const paths: Record<AwardLayer, ReactNode> = {
  competition_distinction: (
    <path d="M12 3.5 14 7l4 .6-2.9 2.8.7 4-3.8-2-3.8 2 .7-4L6 7.6 10 7l2-3.5Zm-4 12L6.5 22 12 19l5.5 3L16 15.5" />
  ),
  school_award: <path d="M4 21V9l8-5 8 5v12M4 21h16M9 21v-6h6v6M9 12h.01M15 12h.01M9 8h.01M15 8h.01" />,
  spotlight: <path d="m12 2 2.6 6.6L21 9.3l-5 4.6 1.4 6.9L12 17.3l-5.4 3.5L8 13.9 3 9.3l6.4-.7L12 2Z" />,
  teacher_parent: <path d="M12 21s-7-4.6-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.4-9.5 9-9.5 9Z" />,
  sports: <path d="M6 21V4m0 3h11l-2.5 3L17 13H6" />,
  principal: <path d="M4 8h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Zm4 0V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M4 12h16" />,
};

export function AwardLayerIcon({ layer, className = "h-5 w-5" }: { layer: AwardLayer; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {paths[layer]}
    </svg>
  );
}
