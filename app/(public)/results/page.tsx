import { createClient } from "@/data/supabase/server";
import { listCompetitions, listPublishedWinners, type PublishedWinner } from "@/domain/competitions/service";
import { resolveCompetitionCardImage } from "@/domain/competitions/cardImage";
import { competencyGroupsFor } from "@/domain/competitions/competencies";
import { categoryLabels, type AgeCategory, type CompetitionSummary } from "@/domain/competitions/types";
import { awardRank } from "@/domain/results/types";
import { ResultsExplorer, type ResultCard, type ResultWinner } from "./ResultsExplorer";

export const metadata = { title: "Results & Recognition | Navigations" };

/** The three competition distinctions a card shows, in order. */
const PLACES = ["gold", "silver", "bronze"] as const;

/** Admin-uploaded card artwork, or null — the same rule as the competition
 * cards (CompetitionCardArt), so a card never points at a missing file. */
function artworkFor(c: CompetitionSummary): string | null {
  return resolveCompetitionCardImage(c.imageUrl);
}

/** "Grades 6 – 8" for one grade category of a competition, or its whole range
 * when the result isn't tied to a category. */
function gradeLabel(c: CompetitionSummary, category: AgeCategory | null): string {
  const rules = c.eligibility.filter((e) => !category || e.category === category);
  const grades = rules.flatMap((e) => [Number(e.minGrade), Number(e.maxGrade)]).filter((n) => Number.isFinite(n) && n > 0);
  if (grades.length === 0) return category ? categoryLabels[category] : "";
  const low = Math.min(...grades);
  const high = Math.max(...grades);
  return low === high ? `Grade ${low}` : `Grades ${low} – ${high}`;
}

function toWinner(w: PublishedWinner): ResultWinner {
  return {
    place: w.award as ResultWinner["place"],
    name: w.studentName,
    school: w.schoolName,
    photoUrl: w.photoUrl,
    teamMembers: w.entryType === "team" ? (w.teamMembers ?? []) : [],
  };
}

/** One card per competition and grade category that has at least one
 * published distinction — a competition with Junior and Senior categories
 * ranks each separately, so each gets its own three places. */
function buildCards(competitions: CompetitionSummary[], winners: PublishedWinner[]): ResultCard[] {
  const bySlug = new Map(competitions.map((c) => [c.slug, c]));
  const groups = new Map<string, { competition: CompetitionSummary; category: AgeCategory | null; winners: PublishedWinner[] }>();

  for (const w of winners) {
    if (!(PLACES as readonly string[]).includes(w.award)) continue;
    const competition = bySlug.get(w.competitionSlug);
    if (!competition) continue;
    const category = (w.category as AgeCategory | undefined) ?? null;
    const key = `${competition.slug}:${category ?? "all"}`;
    const group = groups.get(key) ?? { competition, category, winners: [] };
    group.winners.push(w);
    groups.set(key, group);
  }

  const categoryOrder: (AgeCategory | null)[] = ["primary", "middle", "secondary", null];
  return [...groups.entries()]
    .map(([key, { competition: c, category, winners: list }]) => ({
      key,
      slug: c.slug,
      title: c.title,
      pathway: c.pathway,
      groupKeys: competencyGroupsFor(c.competencies).map((g) => g.key),
      category,
      gradeLabel: gradeLabel(c, category),
      imageUrl: artworkFor(c),
      winners: [...list]
        .sort((a, b) => awardRank[a.award as keyof typeof awardRank] - awardRank[b.award as keyof typeof awardRank])
        .slice(0, 3)
        .map(toWinner),
    }))
    .sort((a, b) => a.title.localeCompare(b.title) || categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category));
}

export default async function ResultsPage() {
  const supabase = await createClient();
  const [competitions, winners] = await Promise.all([listCompetitions(supabase), listPublishedWinners(supabase)]);

  // Archived competitions keep their published results here (they're past
  // editions); drafts never had a public life, so they're left out.
  const cards = buildCards(
    competitions.filter((c) => c.status !== "draft"),
    winners,
  );

  // Up to three uploaded artworks for the banner collage — from competitions
  // with results first, then any competition. None uploaded yet means no
  // collage, just the decorative accent.
  const bannerImages = [
    ...new Set(
      [...cards.map((c) => c.imageUrl), ...competitions.map(artworkFor)].filter((src): src is string => Boolean(src)),
    ),
  ].slice(0, 3);

  return (
    <div className="bg-background">
      <div className="relative overflow-hidden bg-brand-deep">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-6 py-12 md:grid-cols-[1fr_auto] md:py-14">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white uppercase sm:text-5xl">Results &amp; Recognition</h1>
            <p className="mt-3 text-lg text-brand-deep-muted">Explore outcomes across every pathway.</p>
          </div>
          <div aria-hidden="true" className="relative hidden h-44 w-[26rem] md:block">
            {bannerImages.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element -- static competition artwork in public/
              <img
                key={src}
                src={src}
                alt=""
                className="absolute top-1/2 h-40 w-32 rounded-2xl border-4 border-brand-deep object-cover shadow-xl"
                style={{ left: `${i * 7.5}rem`, transform: `translateY(-50%) rotate(${(i - 1) * 5}deg)`, zIndex: i === 1 ? 2 : 1 }}
              />
            ))}
            <span className="absolute -right-2 bottom-0 h-16 w-16 rounded-full bg-accent opacity-90" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <ResultsExplorer cards={cards} />
      </div>
    </div>
  );
}
