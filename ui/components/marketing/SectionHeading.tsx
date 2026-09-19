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
        <p className="text-xs font-semibold tracking-wider text-accent-strong uppercase">{eyebrow}</p>
        <h2 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">{title}</h2>
      </div>
      {action && (
        <Link href={action.href} className="text-sm font-semibold text-accent-strong hover:underline">
          {action.label} →
        </Link>
      )}
    </div>
  );
}
