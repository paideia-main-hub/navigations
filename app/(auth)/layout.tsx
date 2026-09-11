import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-1px)] flex-col bg-zinc-50 dark:bg-zinc-950">
      <div className="px-6 py-6">
        <Link href="/" className="inline-flex items-center gap-2 font-semibold tracking-tight">
          <span className="rounded bg-teal-600 px-2 py-1 text-sm text-white">FCS</span>
          <span>Future Competence Series</span>
        </Link>
      </div>
      <div className="flex flex-1 items-center justify-center px-6 pb-16">
        <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-8 dark:border-white/10 dark:bg-zinc-900">
          {children}
        </div>
      </div>
    </div>
  );
}
