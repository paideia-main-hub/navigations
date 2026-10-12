// Only the main column swaps during navigations — the AdminShell sidebar stays mounted.
export default function AdminLoading() {
  return (
    <div aria-busy="true" aria-live="polite" className="animate-pulse space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="h-8 w-48 rounded-lg bg-surface" />
        <div className="h-9 w-36 rounded-full bg-surface" />
      </div>
      <div className="h-10 w-full max-w-md rounded-lg bg-surface" />
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="h-11 border-b border-border bg-surface-muted/60" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-12 border-b border-border last:border-0" />
        ))}
      </div>
    </div>
  );
}
