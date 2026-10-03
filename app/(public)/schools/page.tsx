import { PageBanner } from "@/ui/components/marketing/PageBanner";
import { FaqAccordion } from "@/ui/components/marketing/FaqAccordion";
import { ClosingCta } from "@/ui/components/marketing/ClosingCta";
import type { FaqCardItem } from "@/ui/components/marketing/FaqExpandGrid";
import { FaqIcon } from "@/ui/components/marketing/faqIcons";

export const metadata = { title: "For Schools | Navigations" };

const items: FaqCardItem[] = [
  {
    id: "why-participate",
    icon: <FaqIcon name="trophy" />,
    question: "Why schools should participate",
    answer: (
      <>
        The League gives your students a structured way to develop and demonstrate real competencies — not just
        collect certificates — across four Route 1 categories: Applied Skills Challenges, Independent Submission,
        Project Showcasing and Live Performances. Registering as a school also unlocks School Awards: Champion School, School
        Excellence, Whole School Participation, Diversified School and Collaboration &amp; Integrity, computed from
        your students&apos; own participation and results across the season.
      </>
    ),
  },
  {
    id: "eligibility",
    icon: <FaqIcon name="id-badge" />,
    question: "Eligible grades and age categories",
    answer: (
      <>
        Every competition sits under one of three categories — Primary, Middle or Secondary — and publishes its own
        grade range (and, where relevant, age range) on that competition&apos;s Eligibility &amp; Registration Rules
        tab. Because pathways draw from different age groups, check the specific competition rather than assuming a
        League-wide cutoff.
      </>
    ),
  },
  {
    id: "entry-options",
    icon: <FaqIcon name="users" />,
    question: "Individual and team entry options",
    answer: (
      <>
        Some competitions accept individual entrants only, some are team-only, and some allow both — this is set per
        competition and shown on its Eligibility &amp; Registration Rules tab. As a coordinator you can enter
        students either way from your dashboard: individually, or grouped into a team you assemble yourself.
      </>
    ),
  },
  {
    id: "team-size",
    icon: <FaqIcon name="scale" />,
    question: "Maximum / minimum team size for each competition",
    answer: (
      <>
        Team size limits are set per competition, not League-wide — a live-response challenge and a project showcase
        rarely want the same team size. The minimum and maximum are published on each competition&apos;s Eligibility
        &amp; Registration Rules tab, and the registration form will not let you submit a team outside that range.
      </>
    ),
  },
  {
    id: "coordinator-role",
    icon: <FaqIcon name="clipboard" />,
    question: "School coordinator responsibilities",
    answer: (
      <>
        A School Coordinator account is the hub for your school&apos;s participation: maintain your student roster,
        enter individuals or teams into eligible competitions, track every registration&apos;s status from your
        dashboard, and pass on preparation resources and deadlines to students and parents. Coordinators are also the
        point of contact the League uses for anything specific to your school.
      </>
    ),
  },
  {
    id: "deadlines",
    icon: <FaqIcon name="calendar-clock" />,
    question: "Registration deadlines and competition calendar",
    answer: (
      <>
        For the 2026 season: registration is open <strong>8 October – 10 November</strong>, submissions for advance
        work close <strong>22 November</strong>, the activity period runs <strong>23 November – 4 December</strong>,
        and finals &amp; recognition take place <strong>5–6 December</strong>. Individual competitions can carry their own
        round and result dates on top of this — the full published schedule is on the Competition Calendar page, and
        each competition repeats its own dates on its Important Dates tab.
      </>
    ),
  },
  {
    id: "fees",
    icon: <FaqIcon name="wallet" />,
    question: "Competition fees / payment policy, where applicable",
    answer: (
      <>
        Most competitions in the League carry no entry fee. Where one does apply, the amount is shown on that
        competition&apos;s page before you register, so there are no fees added at checkout that you have not
        already seen — and payment instructions are given as part of the registration flow itself.
      </>
    ),
  },
  {
    id: "manuals",
    icon: <FaqIcon name="book" />,
    question: "Manuals, rules and judging rubrics",
    answer: (
      <>
        Every competition publishes up to four documents: registration rules, guiding principles, a complete manual
        and a judging rubric, all downloadable from that competition&apos;s Manual tab. The Judging &amp; Rubrics tab
        breaks the rubric down into its weighted criteria and states the tie-break rule used if two entries score
        the same.
      </>
    ),
  },
  {
    id: "consent",
    icon: <FaqIcon name="shield-check" />,
    question: "Required student / parent consent",
    answer: (
      <>
        Registration captures four consent items: acceptance of the terms, the privacy policy, permission to publish
        results (name and school) and permission to publish photos. Results and photo consent are independent of
        each other — a student can be included in published results without their photo appearing, if that is what
        was consented to.
      </>
    ),
  },
  {
    id: "recognition",
    icon: <FaqIcon name="medal" />,
    question: "Certificates, awards and school recognition",
    answer: (
      <>
        Every student who completes their competition receives a Digital Certificate and a Digital Badge marking the
        competency it evidenced. On top of that sit five layers of awards — Competition Distinctions, School Awards,
        Spotlight Awards, Teacher/Parent Recognition and Sports &amp; Principal awards — with School Awards computed
        directly from your school&apos;s registrations and results across the season.
      </>
    ),
  },
  {
    id: "results-policy",
    icon: <FaqIcon name="megaphone" />,
    question: "Result publication policy",
    answer: (
      <>
        Results stay private until an authorised administrator reviews and approves them — nothing is published
        automatically the moment judging finishes. Once approved, results appear on the Results &amp; Winners page
        and on the relevant competition page, subject to the results-publication consent captured at registration.
      </>
    ),
  },
  {
    id: "support",
    icon: <FaqIcon name="headset" />,
    question: "Contact / support channel for coordinators",
    answer: (
      <>
        Coordinators can reach the League team through the Contact page for anything account- or competition-specific,
        and the FAQs page covers the questions that come up most often across every role, not just schools.
      </>
    ),
  },
];

export default function ForSchoolsPage() {
  return (
    <div className="bg-background">
      <PageBanner
        eyebrow="Institutional Access"
        title="For Schools"
        subtitle="Everything a school coordinator needs to register their school and manage student and team entries across Navigations."
        className="-mt-24 pt-28 pb-28 sm:-mt-28 sm:pt-32 sm:pb-32 lg:pt-36 lg:pb-36"
        showNet
        netLattice="angular"
        curvedBottom
      />
      <div className="mx-auto max-w-7xl px-6 py-14">
        <FaqAccordion
          variant="schools"
          items={items}
          searchPlaceholder="Search questions…"
          stuckHref="/contact"
          stuckLabel="Contact us"
          stuckDescription="Ask us directly and we will give you a clear answer about school registration and coordination."
        />
      </div>

      <ClosingCta
        primaryHref="/register/school"
        primaryLabel="Register your school"
        secondaryHref="/manuals"
        secondaryLabel="Browse manuals & guidelines"
      />
    </div>
  );
}
