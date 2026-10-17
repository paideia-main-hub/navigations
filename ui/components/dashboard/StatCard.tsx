import {
  dashboardCardEyebrowClass,
  dashboardCardRuleClass,
  dashboardGlowCardClass,
  dashboardGlowOrbClass,
} from "@/ui/components/dashboard/dashboardGlowCard";

export function StatCard({
  label,
  value,
  className = "",
}: {
  label: string;
  value: number | string;
  className?: string;
}) {
  return (
    <div
      className={`${dashboardGlowCardClass} flex min-h-[5.25rem] flex-col justify-between px-3 py-3 sm:min-h-[7.5rem] sm:px-4 sm:py-4 ${className}`}
    >
      <div aria-hidden className={dashboardGlowOrbClass} />

      <div className="relative">
        <p className={dashboardCardEyebrowClass}>{label}</p>
        <span aria-hidden className={dashboardCardRuleClass} />
      </div>

      <p className="relative mt-2 text-2xl font-medium tracking-tight text-foreground tabular-nums sm:mt-4 sm:text-3xl sm:leading-none">
        {value}
      </p>
    </div>
  );
}
