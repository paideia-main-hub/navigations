// From documentation/FRL_Catalogue_REVISED_Nov_Dec_2026.docx — Route 1,
// Applied Skills Challenges. No standalone manual has been published yet;
// this file carries the catalogue's confirmed nature, competency alignment
// and evidence expectations. Detailed stage timing, rubric weights and venue
// arrangements will be published in the competition rulebook before
// registration and can be refined here (and re-seeded) once that lands.
import { leagueDates } from "./_shared.mjs";

export default {
  slug: "ecosphere",
  title: "EcoSphere",
  shortDescription: "Team challenge: turn an issued school-improvement problem and evidence pack into an action plan and present it.",
  domain: "D5 – Environmental & Social Responsibility",
  supportsIndividual: false,
  supportsTeam: true,
  status: "open",
  pathway: "applied_skills",
  image: "/competitions/ecosphere.webp",

  overview: `EcoSphere is a live, one-day team challenge. Each team receives an issued problem and evidence pack describing a real school-improvement issue, then works within the session to produce a school improvement action plan — assigning responsibilities, allocating resources and setting measurable success indicators — before presenting it to the judging panel.

The task is designed to make planning and stewardship visible rather than reward a polished proposal built in advance: the team sees its issue and evidence pack for the first time in the room, and is judged on how it turns that evidence into a workable, resourced, measurable plan.

Competency alignment: C38 Environmental Responsibility and C40 Service Project Management are the core competencies, with C36 Social Responsibility as supporting evidence where a team's plan genuinely engages the wider school community.

Evidence of learning: teams submit a needs analysis grounded in the issued evidence, a concrete action plan, a resource allocation and a set of measurable indicators — and are expected to defend how each was reached.`,

  eligibility: [
    {
      category: "secondary",
      minGrade: "9",
      maxGrade: "12",
      teamMinSize: 3,
      teamMaxSize: 3,
      notes:
        "Team of 3, Senior category. Final grade eligibility will be confirmed in the published competition rules before registration.",
    },
  ],

  stages: [
    {
      stageNumber: 1,
      title: "Issue Briefing, Planning & Panel Presentation",
      format: "Issued problem and evidence pack, team planning session, then a live presentation to the panel",
      duration: "Single session, timing to be confirmed in the published rulebook",
      taskDescription: `Every team receives the same issued school-improvement problem and a supporting evidence pack at the start of the session. Working from that evidence, the team builds a needs analysis, drafts an action plan that assigns responsibilities across its members, allocates realistic resources, and sets indicators the school could actually use to check whether the plan worked.

The team then presents its plan to the panel and responds to questions on its feasibility, its resourcing and how its indicators would be measured in practice.`,
      progressionRule: "Single-round team challenge, scored out of 100 against the published rubric.",
    },
  ],

  rubrics: [
    {
      stageNumber: 1,
      isPublic: true,
      criteria: [
        { name: "Needs analysis & use of evidence", weight: 25 },
        { name: "Action plan quality & feasibility", weight: 25 },
        { name: "Resource allocation", weight: 20 },
        { name: "Measurable indicators", weight: 15 },
        { name: "Presentation & team collaboration", weight: 15 },
      ],
      tieBreakRule: "Higher Action plan quality & feasibility score, then higher Needs analysis & use of evidence score.",
    },
  ],

  resources: [
    {
      type: "article",
      title: "Reading an issued evidence pack",
      content: `Before drafting anything: what is the issue actually about, in one sentence? What does the evidence pack tell you that you didn't already assume? Who in the school is affected, and who would need to act on your plan? What would "success" look like in a way someone could actually check in a term or a year — not just "it improved"?`,
    },
    {
      type: "article",
      title: "What a workable action plan includes",
      content: `A clear statement of the problem, tied directly to the issued evidence. Named responsibilities — who does what, not just "the school should". A realistic resource list — time, people, materials or budget the plan actually needs. Indicators that are specific and measurable, not just aspirational. A short account of how the plan would be checked and adjusted if it wasn't working.`,
    },
  ],

  faqs: [
    {
      question: "Do we prepare our plan in advance?",
      answer:
        "No. The problem and evidence pack are issued at the start of the session, so the plan has to be built from evidence you're seeing for the first time in the room, not a proposal you arrived with.",
    },
    {
      question: "What does the panel actually question us on?",
      answer:
        "Mainly feasibility and measurement — whether your plan's resourcing is realistic, and whether your indicators would actually tell someone whether the plan worked.",
    },
  ],

  events: leagueDates("2026-12-03", "Competition day", {
    activityNote: "Applied Skills Challenges, week two.",
  }),
};
