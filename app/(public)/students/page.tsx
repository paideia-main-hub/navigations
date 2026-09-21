import Link from "next/link";
import { PageBanner } from "@/ui/components/marketing/PageBanner";
import { FaqExpandGrid, type FaqCardItem } from "@/ui/components/marketing/FaqExpandGrid";
import { FaqIcon } from "@/ui/components/marketing/faqIcons";

export const metadata = { title: "For Students | Future Competence Series" };

const items: FaqCardItem[] = [
  {
    id: "eligibility",
    icon: <FaqIcon name="id-badge" />,
    question: "Who can participate and category eligibility",
    answer: (
      <>
        Every competition falls under Primary, Middle or Secondary, with its own grade range (and sometimes an age
        range) published on that competition&apos;s Eligibility &amp; Registration Rules tab. Browse the Competitions
        directory and filter by grade to see everything you are eligible for right now.
      </>
    ),
  },
  {
    id: "entry-mode",
    icon: <FaqIcon name="users" />,
    question: "Individual or team participation rules",
    answer: (
      <>
        This is set per competition — some are individual-only, some are team-only, and some let you choose either
        way. You can register yourself directly with a student account, or your school coordinator can enter you
        individually or as part of a team; either route uses the same eligibility rules.
      </>
    ),
  },
  {
    id: "skill-focus",
    icon: <FaqIcon name="target" />,
    question: "What the competition is designed to develop",
    answer: (
      <>
        Every competition sits under one of four pathways: Applied Skills Challenges, Independent Submission
        Challenges, Project Showcase Challenges or Live Response Challenges. That pathway is the clearest signal of
        what a competition is actually testing — pick the one that matches how you like to work before picking by
        subject alone.
      </>
    ),
  },
  {
    id: "stages",
    icon: <FaqIcon name="flow" />,
    question: "Competition stages and progression criteria",
    answer: (
      <>
        Multi-stage competitions publish each stage&apos;s format, duration, task and the rule that decides who
        advances, on the Competition Stages tab. Not every competition has more than one stage — check this tab
        first to see whether yours does.
      </>
    ),
  },
  {
    id: "preparation",
    icon: <FaqIcon name="book-open" />,
    question: "What to prepare for each stage",
    answer: (
      <>
        The Stage-wise Challenges tab spells out what each stage actually asks of you, and the Practice &amp;
        Resource Pack on the same competition page gives you practice questions, sample tasks and videos to work
        through beforehand — all viewable directly on the site, nothing to download first.
      </>
    ),
  },
  {
    id: "materials-rules",
    icon: <FaqIcon name="toolbox" />,
    question: "Allowed materials / tools and prohibited practices",
    answer: (
      <>
        The Guiding Principles tab and the competition&apos;s manual set out exactly what you may bring or use during
        a stage, and what counts as an unfair advantage. When in doubt about a specific tool or material, that tab is
        the authority, not a guess — ask your coordinator to confirm with the League if it still isn&apos;t clear.
      </>
    ),
  },
  {
    id: "judging",
    icon: <FaqIcon name="scale" />,
    question: "Judging rubric and how marks are awarded",
    answer: (
      <>
        The Judging &amp; Rubrics tab lists the weighted criteria your entry is actually scored against, plus the
        tie-break rule used if two entries land on the same total. Reading this before you start is the single best
        way to spend your prep time — it tells you where the marks really are.
      </>
    ),
  },
  {
    id: "practice",
    icon: <FaqIcon name="play" />,
    question: "Practice material and sample tasks",
    answer: (
      <>
        Every competition has its own Practice &amp; Resource Pack, and the Practice / Resource Centre brings all of
        them together in one place if you want to browse across competitions before deciding what to enter.
      </>
    ),
  },
  {
    id: "deadlines",
    icon: <FaqIcon name="calendar-clock" />,
    question: "Important deadlines and result dates",
    answer: (
      <>
        For the 2026 season: registration runs <strong>1–10 October</strong>, advance submissions are due{" "}
        <strong>23 October</strong>, the activity period is <strong>26 October – 5 November</strong>, and finals
        &amp; recognition happen <strong>6–7 November</strong>. Your specific competition&apos;s round and result
        dates are on its Important Dates tab, and the full season schedule is on the Competition Calendar page.
      </>
    ),
  },
  {
    id: "after-registration",
    icon: <FaqIcon name="inbox" />,
    question: "What happens after registration",
    answer: (
      <>
        You&apos;ll get a registration number in the form FCS-2026-XXXX, and your dashboard becomes the place to
        track status, see upcoming dates and pick up practice resources. From there it&apos;s on you to prepare —
        the League doesn&apos;t send anything further until the next stage or result date is due.
      </>
    ),
  },
  {
    id: "qualification",
    icon: <FaqIcon name="bell" />,
    question: "How qualification / finalist status will be communicated",
    answer: (
      <>
        Advancement between stages, and final results, are published through your dashboard and the competition
        page once an administrator has reviewed and approved them — never informally or ahead of that review, even
        if you hear something from a judge on the day.
      </>
    ),
  },
  {
    id: "awards",
    icon: <FaqIcon name="medal" />,
    question: "Awards, certificates and winner publication information",
    answer: (
      <>
        Every student who completes their competition gets a Digital Certificate and a Digital Badge. Top-ranked
        entrants are additionally recognised through Competition Distinctions, and your name, school and photo
        appear in published results only to the extent you (or your parent) consented to at registration.
      </>
    ),
  },
  {
    id: "conduct",
    icon: <FaqIcon name="shield-check" />,
    question: "Code of conduct and academic integrity rules",
    answer: (
      <>
        Work submitted has to be your own — the manual for each competition sets out what independent work means for
        that format, along with expected conduct toward judges and other competitors during live stages. Breaching
        it can mean disqualification, so if a stage is ambiguous about what&apos;s allowed, ask before you act rather
        than after.
      </>
    ),
  },
];

export default function ForStudentsPage() {
  return (
    <div className="bg-background">
      <PageBanner
        eyebrow="Competitor Tier"
        title="For Students"
        subtitle="What you need to know before signing up and competing in the Future Competence Series."
      />
      <div className="mx-auto max-w-6xl px-6 py-14">
        <FaqExpandGrid items={items} />

        <div className="mt-12">
          <Link
            href="/register/student"
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent/90"
          >
            Create your student account
          </Link>
        </div>
      </div>
    </div>
  );
}
