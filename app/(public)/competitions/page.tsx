import { CompetitionsDirectory } from "./CompetitionsDirectory";

export const metadata = {
  title: "Competitions | Future Competence Series",
};

export default async function CompetitionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="text-3xl font-bold text-foreground">Competitions</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Browse all competitions in the Future Competence Series. Filter by age category,
        participation type or status, or search by name.
      </p>
      <div className="mt-8">
        <CompetitionsDirectory initialQuery={q ?? ""} />
      </div>
    </div>
  );
}
