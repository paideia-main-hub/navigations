import Link from "next/link";

export function QuickLink({ href, icon, title, body }: { href: string; icon: string; title: string; body: string }) {
  return (
    <Link
      href={href}
      prefetch
      className="cursor-pointer rounded-xl border border-border bg-accent-soft p-4 transition hover:border-accent hover:bg-surface hover:shadow-md"
    >
      <p className="font-semibold text-foreground">
        {icon} {title}
      </p>
      <p className="mt-1 text-sm text-muted">{body}</p>
    </Link>
  );
}
