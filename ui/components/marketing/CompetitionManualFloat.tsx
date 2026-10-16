/** Fixed corner CTA — downloads this competition’s complete manual. */
export function CompetitionManualFloat({
  fileUrl,
  title,
}: {
  fileUrl: string;
  title: string;
}) {
  return (
    <a
      href={fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      download
      aria-label={`Download manual: ${title}`}
      title="Download competition manual"
      className="group fixed z-40 flex h-11 items-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      style={{ left: 30, bottom: 30 }}
    >
      <span
        aria-hidden="true"
        className="-mr-11 flex h-11 max-w-11 items-center justify-end overflow-hidden rounded-full bg-accent pr-10 text-xs font-semibold whitespace-nowrap text-accent-foreground shadow-[0_10px_22px_-8px_rgba(255,105,31,0.55)] transition-[max-width,padding] duration-300 ease-out group-hover:max-w-[13rem] group-hover:pl-3.5 group-focus-visible:max-w-[13rem] group-focus-visible:pl-3.5"
      >
        Download competition manual
      </span>
      <span className="relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground shadow-[0_10px_22px_-8px_rgba(255,105,31,0.55)] transition-[transform,box-shadow] duration-300 ease-out group-hover:-translate-x-2 group-hover:shadow-[0_14px_28px_-8px_rgba(255,105,31,0.65)] group-focus-visible:-translate-x-2">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="h-5 w-5"
        >
          <path d="M12 3v12" />
          <path d="m7 10 5 5 5-5" />
          <path d="M5 21h14" />
        </svg>
      </span>
    </a>
  );
}
