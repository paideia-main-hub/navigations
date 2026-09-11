// Temporary in-memory sample data shaped like the Supabase schema
// (supabase/migrations/0001_init_schema.sql). Swap for real queries once
// the Supabase project is live — see lib/supabase/server.ts.

export type AgeCategory = "primary" | "middle" | "secondary";
export type CompetitionStatus = "draft" | "upcoming" | "open" | "closed" | "archived";
export type EntryType = "individual" | "team";

export interface EligibilityRule {
  category: AgeCategory;
  minGrade: string;
  maxGrade: string;
  teamMinSize?: number;
  teamMaxSize?: number;
}

export interface CompetitionStage {
  stageNumber: number;
  title: string;
  format: string;
  duration: string;
  taskDescription: string;
  progressionRule: string;
}

export interface RubricCriterion {
  name: string;
  weight: number;
}

export interface Winner {
  studentName: string;
  schoolName: string;
  award: "gold" | "silver" | "bronze" | "finalist";
  photoUrl?: string;
}

export interface Competition {
  slug: string;
  title: string;
  shortDescription: string;
  overview: string;
  domain: string;
  status: CompetitionStatus;
  participationType: EntryType | "both";
  registrationDeadline: string;
  eventDate: string;
  eligibility: EligibilityRule[];
  stages: CompetitionStage[];
  rubric: RubricCriterion[];
  faqs: { question: string; answer: string }[];
  winners: Winner[];
}

export const competitions: Competition[] = [
  {
    slug: "young-innovators-challenge",
    title: "Young Innovators Challenge",
    shortDescription: "A hands-on invention and problem-solving competition for aspiring engineers.",
    overview:
      "The Young Innovators Challenge asks students to identify a real-world problem in their community and design a working prototype solution, developing creativity, engineering thinking, and presentation skills.",
    domain: "STEM & Innovation",
    status: "open",
    participationType: "both",
    registrationDeadline: "2026-10-15",
    eventDate: "2026-11-20",
    eligibility: [
      { category: "middle", minGrade: "6", maxGrade: "8", teamMinSize: 1, teamMaxSize: 3 },
      { category: "secondary", minGrade: "9", maxGrade: "12", teamMinSize: 1, teamMaxSize: 4 },
    ],
    stages: [
      {
        stageNumber: 1,
        title: "Concept Submission",
        format: "Online submission",
        duration: "2 weeks",
        taskDescription: "Submit a one-page concept note describing the problem and proposed solution.",
        progressionRule: "Top 100 concepts advance to prototyping.",
      },
      {
        stageNumber: 2,
        title: "Prototype Build",
        format: "Take-home build + video documentation",
        duration: "4 weeks",
        taskDescription: "Build a working or scale prototype and document the process on video.",
        progressionRule: "Top 30 teams advance to the final showcase.",
      },
      {
        stageNumber: 3,
        title: "Final Showcase",
        format: "In-person exhibition and judging",
        duration: "1 day",
        taskDescription: "Present the prototype to a judging panel and answer questions.",
        progressionRule: "Judges rank finalists using the published rubric.",
      },
    ],
    rubric: [
      { name: "Originality", weight: 30 },
      { name: "Technical execution", weight: 30 },
      { name: "Real-world impact", weight: 25 },
      { name: "Presentation", weight: 15 },
    ],
    faqs: [
      {
        question: "Can a team have members from different schools?",
        answer: "No — teams must be composed of students from the same registered school.",
      },
      {
        question: "Is there a registration fee?",
        answer: "No, this competition is free to enter.",
      },
    ],
    winners: [
      { studentName: "Amara K.", schoolName: "Greenfield International School", award: "gold" },
      { studentName: "Team Circuit Breakers", schoolName: "Northgate High School", award: "silver" },
    ],
  },
  {
    slug: "digital-literacy-cup",
    title: "Digital Literacy Cup",
    shortDescription: "Tests practical digital skills — from safe internet use to basic coding logic.",
    overview:
      "The Digital Literacy Cup evaluates students' everyday digital competence: online safety, information literacy, and foundational computational thinking, through timed practical rounds.",
    domain: "Digital Literacy",
    status: "upcoming",
    participationType: "individual",
    registrationDeadline: "2026-11-01",
    eventDate: "2026-12-05",
    eligibility: [{ category: "primary", minGrade: "3", maxGrade: "5" }],
    stages: [
      {
        stageNumber: 1,
        title: "Online Qualifier",
        format: "Timed online quiz",
        duration: "45 minutes",
        taskDescription: "Answer scenario-based questions on online safety and digital tools.",
        progressionRule: "Top 20% of scorers per region advance.",
      },
      {
        stageNumber: 2,
        title: "Regional Final",
        format: "In-person practical test",
        duration: "1 hour",
        taskDescription: "Complete hands-on tasks on school computers under supervision.",
        progressionRule: "Highest scorer per region is declared regional winner.",
      },
    ],
    rubric: [
      { name: "Accuracy", weight: 50 },
      { name: "Speed", weight: 20 },
      { name: "Safe-practice judgment", weight: 30 },
    ],
    faqs: [
      {
        question: "Do students need their own device?",
        answer: "No, both rounds run on school-provided computers.",
      },
    ],
    winners: [],
  },
  {
    slug: "public-speaking-championship",
    title: "Public Speaking Championship",
    shortDescription: "A stage-wise oratory competition building confidence and communication skills.",
    overview:
      "Students prepare and deliver speeches on assigned and open topics across elimination rounds, judged on content, delivery, and audience engagement.",
    domain: "Communication",
    status: "closed",
    participationType: "individual",
    registrationDeadline: "2026-08-01",
    eventDate: "2026-09-10",
    eligibility: [
      { category: "middle", minGrade: "6", maxGrade: "8" },
      { category: "secondary", minGrade: "9", maxGrade: "12" },
    ],
    stages: [
      {
        stageNumber: 1,
        title: "School Round",
        format: "In-school elimination",
        duration: "1 day",
        taskDescription: "3-minute speech on an assigned topic.",
        progressionRule: "Top 2 speakers per school advance.",
      },
      {
        stageNumber: 2,
        title: "Grand Final",
        format: "In-person",
        duration: "1 day",
        taskDescription: "5-minute prepared speech plus a 2-minute impromptu round.",
        progressionRule: "Judges rank all finalists.",
      },
    ],
    rubric: [
      { name: "Content & structure", weight: 35 },
      { name: "Delivery & voice", weight: 35 },
      { name: "Audience engagement", weight: 30 },
    ],
    faqs: [],
    winners: [
      { studentName: "Zoya R.", schoolName: "Lakeview Grammar School", award: "gold" },
      { studentName: "Hassan M.", schoolName: "Crescent Model School", award: "silver" },
      { studentName: "Priya S.", schoolName: "Riverside Academy", award: "bronze" },
    ],
  },
];

export function getCompetitionBySlug(slug: string) {
  return competitions.find((c) => c.slug === slug);
}

export const categoryLabels: Record<AgeCategory, string> = {
  primary: "Primary",
  middle: "Middle",
  secondary: "Secondary",
};

export const statusLabels: Record<CompetitionStatus, string> = {
  draft: "Draft",
  upcoming: "Upcoming",
  open: "Open",
  closed: "Closed",
  archived: "Archived",
};
