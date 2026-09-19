import { categoryLabels } from "@/domain/competitions/types";

export function ArenaFinder() {
  return (
    <form
      action="/competitions"
      className="mx-auto -mt-10 flex max-w-5xl flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-xl sm:flex-row sm:items-center"
    >
      <div className="flex-1">
        <label className="text-xs font-semibold tracking-wide text-muted uppercase">
          Competition name
        </label>
        <input
          type="search"
          name="q"
          placeholder="Robotics, Public Oratory, Applied STEM…"
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
        />
      </div>
      <div>
        <label className="text-xs font-semibold tracking-wide text-muted uppercase">
          Age group
        </label>
        <select
          name="category"
          defaultValue="all"
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground sm:w-44"
        >
          <option value="all">All Categories</option>
          {Object.entries(categoryLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold tracking-wide text-muted uppercase">Status</label>
        <select
          name="status"
          defaultValue="all"
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground sm:w-40"
        >
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="upcoming">Upcoming</option>
        </select>
      </div>
      <button
        type="submit"
        className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent/90"
      >
        Search Competitions
      </button>
    </form>
  );
}
