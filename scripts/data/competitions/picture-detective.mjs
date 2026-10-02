// From documentation/FRL_Catalogue_REVISED_Nov_Dec_2026.docx — Route 1,
// Live Performances. No standalone manual has been published yet; this file
// carries the catalogue's confirmed nature, competency alignment and
// evidence expectations. Detailed stage timing, rubric weights and venue
// arrangements will be published in the competition rulebook before
// registration and can be refined here (and re-seeded) once that lands.
import { leagueDates } from "./_shared.mjs";

export default {
  slug: "picture-detective",
  title: "Picture Detective",
  shortDescription: "Examine a visual scene, spot the clues, and explain your conclusions — a live observation and reasoning challenge for Junior students.",
  domain: "D1 – Academic Excellence & Intellectual Development",
  competencies: ["C01", "Observation", "Explanation"],
  supportsIndividual: true,
  supportsTeam: false,
  status: "open",
  pathway: "live_response",
  image: null,

  overview: `Picture Detective is a live, one-day observation and reasoning challenge for Junior students. Each candidate examines a visual scene, identifies the clues it contains, and explains the conclusions those clues support — a compact version of the same skill that runs through every reasoning-based competition in the League, sized to a Junior audience.

The task rewards careful looking and honest reasoning over guessing: a candidate who notices fewer details but reasons soundly from what they saw should do better than one who invents a confident story unsupported by the scene.

Competency alignment: C01 Critical Thinking is the core competency, with C03 Research & Inquiry and C05 Academic Communication as supporting evidence where a candidate explains their reasoning clearly.

Evidence of learning: candidates record their observations, distinguish evidence from guesses, and justify their conclusions to a judge — the same evidence-to-conclusion habit Young Scientist Observation and Think Masters ask for at older grades.`,

  eligibility: [
    {
      category: "primary",
      minGrade: "3",
      maxGrade: "5",
      notes:
        "Individual entry, Junior category. Final grade eligibility will be confirmed in the published competition rules before registration.",
    },
  ],

  stages: [
    {
      stageNumber: 1,
      title: "Scene Examination & Judge Response",
      format: "Timed examination of an organiser-issued visual scene, then a short spoken explanation to a judge",
      duration: "Approximately 30–45 minutes",
      taskDescription: `Each candidate is shown one visual scene — an image or a small set of related images — and given time to examine it closely and record what they notice. The candidate then identifies the clues the scene contains and explains, to a judge, the conclusions those clues support, being clear about what is observed fact and what is inference.`,
      progressionRule: "Single-round individual activity, scored out of 100 against the published rubric.",
    },
  ],

  rubrics: [
    {
      stageNumber: 1,
      isPublic: true,
      criteria: [
        { name: "Observation accuracy", weight: 30 },
        { name: "Distinguishing evidence from guesses", weight: 30 },
        { name: "Reasoning & justification", weight: 25 },
        { name: "Clarity of explanation", weight: 15 },
      ],
      tieBreakRule: "Higher Distinguishing evidence from guesses score, then higher Reasoning & justification score.",
    },
  ],

  resources: [
    {
      type: "article",
      title: "How to look at a scene like a detective",
      content: `Look at the whole scene once before focusing on any one detail. Ask what's actually there — not what you'd expect to be there. Write down what you see before you decide what it means. Then ask: which of my notes are things I actually saw, and which are guesses I'm making from them? A good explanation says both parts out loud.`,
    },
  ],

  faqs: [
    {
      question: "Do we know the scene in advance?",
      answer: "No. The scene is shown to you on the day, so there's nothing to prepare or memorise beforehand.",
    },
    {
      question: "Is it bad to say 'I'm not sure' about something?",
      answer:
        "No — judges are specifically looking at whether you can tell the difference between what you actually observed and what you're guessing. Being honest about which is which scores better than inventing a confident answer.",
    },
  ],

  events: leagueDates("2026-12-05", "Competition day", {
    activityNote: "Finale weekend, day one.",
  }),
};
