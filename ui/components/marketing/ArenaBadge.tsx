// A separate badge component from ui/components/Badge.tsx, deliberately not
// shared — Badge.tsx is used throughout the dashboards and admin panel,
// which this redesign must not touch.
const tones = {
  neutral: "bg-surface-muted text-muted",
  blue: "bg-accent-soft text-accent-strong",
  success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  warning: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  dark: "bg-brand-deep text-brand-deep-foreground",
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
