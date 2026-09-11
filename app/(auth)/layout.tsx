import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-1px)] flex-col bg-surface-muted">
      <div className="px-6 py-6">
        <Link href="/" className="inline-flex items-center gap-2 font-semibold tracking-tight text-foreground">
          <span className="rounded-md bg-accent px-2 py-1 text-sm text-accent-foreground">FCS</span>
          <span>Future Competence Series</span>
        </Link>
      </div>
      <div className="flex flex-1 items-center justify-center px-6 pb-16">
        <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8">{children}</div>
      </div>
    </div>
  );
}
