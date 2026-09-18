import Link from "next/link";

export const metadata = { title: "Register | Future Competence Series" };

const paths = [
  {
    href: "/competitions",
    icon: "🔎",
    tone: "neutral" as const,
    title: "Just Visiting",
    body: "Browse competitions, manuals and results — no account needed.",
    cta: "Explore competitions",
  },
  {
    href: "/register/student",
    icon: "🎓",
    tone: "accent" as const,
    title: "Student",
    body: "Create your own account and register individually for competitions you're eligible for.",
    cta: "Register as a student",
  },
  {
    href: "/register/school",
    icon: "🏫",
    tone: "violet" as const,
    title: "School Coordinator",
    body: "Register your school, manage your student roster, and enter individuals or teams.",
    cta: "Register your school",
  },
  {
    href: "/register/judge",
    icon: "⚖️",
    tone: "amber" as const,
    title: "Judge",
    body: "Apply to judge a competition. An administrator reviews every application and schedules a short interview before granting access.",
    cta: "Apply to judge",
  },
  {
    href: "/register/nominator",
    icon: "🎖️",
    tone: "rose" as const,
    title: "Independent Nominator",
    body: "Submit an Idea of the Year, Story of the Year or Young Changemaker nomination without a school account.",
    cta: "Register as a nominator",
  },
];

const toneClasses: Record<string, string> = {
  neutral: "from-slate-500/15 to-slate-500/0 group-hover:border-slate-400",
  accent: "from-accent/20 to-accent/0 group-hover:border-accent",
  violet: "from-violet-500/15 to-violet-500/0 group-hover:border-violet-400",
  amber: "from-amber-500/15 to-amber-500/0 group-hover:border-amber-400",
  rose: "from-rose-500/15 to-rose-500/0 group-hover:border-rose-400",
};

export default function RegisterChoicePage() {
  return (
    <div className="min-h-[calc(100vh-1px)] bg-surface-muted">
      <div className="px-6 py-6">
        <Link href="/" className="inline-flex items-center gap-2 font-semibold tracking-tight text-foreground">
          <span className="rounded-md bg-accent px-2 py-1 text-sm text-accent-foreground">FCS</span>
          <span>Future Competence Series</span>
        </Link>
      </div>

      <div className="mx-auto max-w-5xl px-6 pt-8 pb-20 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Who&apos;s joining the Future Competence Series?
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted">
          Pick the path that fits you — each one leads to a different registration experience.
        </p>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {paths.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className={`group relative overflow-hidden rounded-2xl border border-border bg-surface p-6 text-left transition-all hover:-translate-y-1 hover:shadow-lg`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${toneClasses[p.tone]} transition-colors`} />
              <div className="relative">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-muted text-2xl">
                  {p.icon}
                </span>
                <h2 className="mt-4 text-xl font-bold text-foreground">{p.title}</h2>
                <p className="mt-2 text-sm text-muted">{p.body}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent">
                  {p.cta}
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>

        <p className="mt-10 text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-accent">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
