export const metadata = { title: "Announcements | Future Competence Series" };

const categories = ["Registration", "Schedule", "Venue", "Manual Update", "Results", "Final Round", "General Notice"];

export default function AnnouncementsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Announcements</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Site-wide and competition-specific notices, published by administrators.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map((c) => (
          <span
            key={c}
            className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
          >
            {c}
          </span>
        ))}
      </div>
      <p className="mt-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
        No announcements have been published yet. Once the admin CMS is connected, published
        notices will appear here, filterable by category and competition.
      </p>
    </div>
  );
}
