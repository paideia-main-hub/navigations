import Link from "next/link";

export function QuickLink({ href, icon, title, body }: { href: string; icon: string; title: string; body: string }) {
  return (
    <Link href={href} className="rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent">
      <p className="font-semibold text-foreground">
        {icon} {title}
      </p>
      <p className="mt-1 text-sm text-muted">{body}</p>
    </Link>
  );
}
