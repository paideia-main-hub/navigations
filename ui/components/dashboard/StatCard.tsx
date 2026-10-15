import {
  dashboardCardEyebrowClass,
  dashboardCardRuleClass,
  dashboardGlowCardClass,
  dashboardGlowOrbClass,
} from "@/ui/components/dashboard/dashboardGlowCard";

export function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className={`${dashboardGlowCardClass} flex min-h-[7.5rem] flex-col justify-between px-4 py-4`}>
      <div aria-hidden className={dashboardGlowOrbClass} />

      <div className="relative">
        <p className={dashboardCardEyebrowClass}>{label}</p>
        <span aria-hidden className={dashboardCardRuleClass} />
      </div>

      <p className="relative mt-4 text-2xl font-medium tracking-tight text-foreground tabular-nums sm:text-3xl sm:leading-none">
        {value}
      </p>
    </div>
  );
}
