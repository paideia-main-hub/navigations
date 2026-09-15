import { categoryLabels } from "@/domain/competitions/types";

export function ArenaFinder() {
  return (
    <form
      action="/competitions"
      className="mx-auto -mt-10 flex max-w-5xl flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex-1">
        <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
          Competition name
        </label>
        <input
          type="search"
          name="q"
          placeholder="Robotics, Public Oratory, Applied STEM…"
          className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>
      <div>
        <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
          Age group
        </label>
        <select
          name="category"
          defaultValue="all"
          className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 sm:w-44"
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
        <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">Status</label>
        <select
          name="status"
          defaultValue="all"
          className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 sm:w-40"
        >
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="upcoming">Upcoming</option>
        </select>
      </div>
      <button
        type="submit"
        className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
      >
        Search Competitions
      </button>
    </form>
  );
}
