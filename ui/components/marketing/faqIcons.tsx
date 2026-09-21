import type { ReactNode } from "react";

/** Shared icon set for the For Schools / For Students FAQ cards
 * (FaqExpandGrid). 24x24, drawn in currentColor so each card tints its own
 * icon tile. Kept in one file because both pages draw from the same set. */

const paths: Record<string, ReactNode> = {
  trophy: <path d="M8 21h8m-4-4v4m-6-17h12v5a6 6 0 0 1-12 0V4Zm0 2H4a2 2 0 0 0 0 4h2m12-4h2a2 2 0 0 1 0 4h-2" />,
  "id-badge": (
    <path d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm3 5a3 3 0 1 0 6 0 3 3 0 0 0-6 0Zm-1 9c.6-2.4 2.4-4 4-4s3.4 1.6 4 4" />
  ),
  users: (
    <path d="M17 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9.5 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm12.5 10v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
  ),
  scale: <path d="M12 3v18m0-18 5 3m-5-3-5 3m0 0-3 7a4 4 0 0 0 6 0l-3-7Zm10 0-3 7a4 4 0 0 0 6 0l-3-7ZM7 21h10" />,
  clipboard: (
    <path d="M9 3h6v2.5H9zM7.5 5H6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1.5M9 12h6M9 16h4" />
  ),
  "calendar-clock": (
    <>
      <path d="M8 2v4m8-4v4M3 10h10M5 6h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4M3 8a2 2 0 0 1 2-2v0" />
      <path d="M17.5 22a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0-3.2v-1.8l1.2-1" />
    </>
  ),
  wallet: <path d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Zm0 3h18M16 13.5h.01" />,
  book: <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5V6a2 2 0 0 1 2-2h14v15.5M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-2.5" />,
  "shield-check": <path d="M12 2 4 5.5V11c0 5 3.4 8.8 8 10 4.6-1.2 8-5 8-10V5.5L12 2Zm-3 9.5 2 2 4-4.5" />,
  medal: (
    <path d="M12 3.5 14 7l4 .6-2.9 2.8.7 4-3.8-2-3.8 2 .7-4L6 7.6 10 7l2-3.5Zm-4 12L6.5 22 12 19l5.5 3L16 15.5" />
  ),
  megaphone: <path d="M3 11v2a2 2 0 0 0 2 2h1l2 6h2l-1.5-6H10l9 4V5l-9 4H6a2 2 0 0 0-2 2Zm16-3v6" />,
  headset: <path d="M4 13v-1a8 8 0 0 1 16 0v1m-16 0v4a2 2 0 0 0 2 2h1v-7H5a1 1 0 0 0-1 1Zm16 0v4a2 2 0 0 1-2 2h-1v-7h1a1 1 0 0 1 1 1Zm-3 6a3 3 0 0 1-3 2h-2" />,
  target: <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-4a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0-3.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />,
  flow: <path d="M4 6h5v5H4zm11 0h5v5h-5zM6.5 11v3.5m0 0H16a2 2 0 0 1 2 2V17m-11-2.5v0M15 13h5v5h-5z" />,
  "book-open": <path d="M12 6.5c-1.5-1.3-4-2-7-2v13c3 0 5.5.7 7 2 1.5-1.3 4-2 7-2V4.5c-3 0-5.5.7-7 2Zm0 0V19" />,
  toolbox: <path d="M3 9h18v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9Zm2 0V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3M9 13h6" />,
  play: <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm-2-6V8l6 4-6 4Z" />,
  inbox: <path d="M4 12h4l2 3h4l2-3h4M4 12 5.5 5A2 2 0 0 1 7.4 3.5h9.2A2 2 0 0 1 18.5 5L20 12m-16 0v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6" />,
  bell: <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Zm4.3 9a1.8 1.8 0 0 0 3.4 0" />,
};

export function FaqIcon({ name, className = "h-5 w-5" }: { name: keyof typeof paths; className?: string }) {
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
      {paths[name]}
    </svg>
  );
}
