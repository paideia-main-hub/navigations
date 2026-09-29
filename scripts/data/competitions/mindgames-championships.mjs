// From documentation/FRL_Catalogue_REVISED_Nov_Dec_2026.docx — Route 1,
// Live Performances. No standalone manual has been published yet; this file
// carries the catalogue's confirmed nature, competency alignment and
// evidence expectations. Detailed per-game rules, rubric weights and venue
// arrangements will be published in the competition rulebook before
// registration and can be refined here (and re-seeded) once that lands.
import { leagueDates } from "./_shared.mjs";

export default {
  slug: "mindgames-championships",
  title: "MindGames Championships",
  shortDescription:
    "Three levels — Discover, Connect and Master — two puzzle games per level, attempted by every candidate, with separate Junior and Senior rankings.",
  domain: "D1 – Academic Excellence & Intellectual Development",
  competencies: ["C01", "C02"],
  supportsIndividual: true,
  supportsTeam: false,
  status: "open",
  pathway: "live_response",
  image: "/competitions/mindgames-championships.webp",

  overview: `MindGames Championships is a live puzzle-and-reasoning event run across three progressive levels — Discover, Connect and Master — with two games at each level. Every candidate attempts all three levels in sequence; there is no elimination between levels. Junior and Senior candidates compete on the same event day but are ranked separately, and MindGames keeps its own combined Senior bracket (Grades 6 through O Level) rather than splitting Middle and Secondary the way other League activities do.

The three-level structure is designed to move from simple pattern and logic recognition (Discover), through games that require connecting two or more pieces of information (Connect), to games that demand sustained multi-step reasoning under time pressure (Master) — so a candidate's final ranking reflects performance across a genuine range of reasoning demands, not a single lucky round.

Competency alignment (proposed): C01 Critical Thinking, C02 Problem Solving and C12 Analytical Problem Solving.

Evidence of learning: candidates keep their puzzle responses, the strategies they used and any corrections they made — the same record that lets a moderator see reasoning, not just a final score.`,

  eligibility: [
    {
      category: "primary",
      minGrade: "3",
      maxGrade: "5",
      notes: "Junior bracket, Grades 3–5, individual entry. Ranked separately from the Senior bracket.",
    },
    {
      category: "middle",
      minGrade: "6",
      maxGrade: "8",
      notes:
        "Senior bracket, Grades 6 through O Level, individual entry, competing as one combined group rather than split Middle/Secondary categories. Ranked separately from the Junior bracket.",
    },
    {
      category: "secondary",
      minGrade: "9",
      maxGrade: "10",
      notes:
        "Senior bracket, Grades 6 through O Level, individual entry, competing as one combined group rather than split Middle/Secondary categories. Ranked separately from the Junior bracket.",
    },
  ],

  stages: [
    {
      stageNumber: 1,
      title: "Discover",
      format: "Two timed puzzle games focused on pattern and logic recognition",
      duration: "Proposed scored time: Junior 60 minutes, Senior 75 minutes, excluding briefing",
      taskDescription:
        "The opening level introduces the two games every candidate will see, focused on recognising patterns, sequences and straightforward logical relationships. Every candidate attempts both games; there is no elimination at this stage.",
      progressionRule: "All candidates proceed to Connect. Discover scores carry into the combined final ranking.",
    },
    {
      stageNumber: 2,
      title: "Connect",
      format: "Two timed puzzle games requiring candidates to combine two or more pieces of information",
      duration: "Included within the same proposed scored time as Discover and Master",
      taskDescription:
        "The second level raises the reasoning demand: each game now requires connecting separate pieces of information — rather than reading a single pattern — to reach an answer.",
      progressionRule: "All candidates proceed to Master. Connect scores carry into the combined final ranking.",
    },
    {
      stageNumber: 3,
      title: "Master",
      format: "Two timed puzzle games requiring sustained, multi-step reasoning",
      duration: "Included within the same proposed scored time as Discover and Connect",
      taskDescription:
        "The closing level asks candidates to sustain a chain of reasoning across several steps within the time limit, rather than reach a single-step answer.",
      progressionRule:
        "Final ranking is calculated across all three levels and both brackets are ranked separately (Junior; Senior, Grades 6–O Level combined).",
    },
  ],

  rubrics: [
    {
      stageNumber: null,
      isPublic: true,
      criteria: [
        { name: "Discover — accuracy & speed", weight: 30 },
        { name: "Connect — accuracy & speed", weight: 35 },
        { name: "Master — accuracy & speed", weight: 35 },
      ],
      tieBreakRule: "Higher Master score, then higher Connect score, then higher Discover score.",
    },
  ],

  resources: [
    {
      type: "article",
      title: "How the three levels build on each other",
      content: `Discover checks whether you can spot a pattern or a straightforward rule. Connect checks whether you can hold two or more pieces of information in mind at once and combine them. Master checks whether you can carry a chain of reasoning across several steps without losing the thread. Practising puzzle types that get progressively harder — not just more of the same easy type — is better preparation than speed drills on one game alone.`,
    },
    {
      type: "article",
      title: "Keeping a usable record while you work",
      content: `Note your reasoning as you go, not just your final answer — if a moderator ever reviews a close result, your working is what shows genuine reasoning versus a guess. If you change your mind partway through a puzzle, a quick correction mark is more useful than an erased trail.`,
    },
  ],

  faqs: [
    {
      question: "Do we get eliminated between levels?",
      answer:
        "No. Every candidate attempts all three levels — Discover, Connect and Master — in sequence. The final ranking is calculated across all three, not by knocking candidates out along the way.",
    },
    {
      question: "Why are Grade 6 students competing against O Level students?",
      answer:
        "MindGames keeps one combined Senior bracket (Grades 6 through O Level) rather than splitting Middle and Secondary the way most other League activities do — this is confirmed in the published catalogue, not an error.",
    },
    {
      question: "How long does the whole event take?",
      answer:
        "Proposed scored time is 60 minutes for Junior candidates and 75 minutes for Senior candidates, excluding briefing, across all three levels combined. Exact session timing will be confirmed in the published rulebook.",
    },
  ],

  events: leagueDates("2026-12-05", "Competition day", {
    activityNote: "Finale weekend, day one. All three levels — Discover, Connect and Master — run in one session.",
  }),
};
