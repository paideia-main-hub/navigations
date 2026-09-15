// A separate badge component from ui/components/Badge.tsx, deliberately not
// shared — Badge.tsx is used throughout the dashboards and admin panel,
// which this redesign must not touch.
const tones = {
  neutral: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  blue: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
  success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  warning: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  dark: "bg-white/10 text-slate-200",
} as const;

export function ArenaBadge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones;
}) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide uppercase ${tones[tone]}`}>
      {children}
    </span>
  );
}
