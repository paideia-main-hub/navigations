import Link from "next/link";

export function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs font-semibold tracking-wider text-blue-600 uppercase dark:text-blue-400">{eyebrow}</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl dark:text-slate-50">{title}</h2>
      </div>
      {action && (
        <Link href={action.href} className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400">
          {action.label} →
        </Link>
      )}
    </div>
  );
}
