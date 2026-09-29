// From documentation/FRL_Catalogue_REVISED_Nov_Dec_2026.docx — Route 1,
// Applied Skills Challenges. No standalone manual has been published yet;
// this file carries the catalogue's confirmed nature, competency alignment
// and evidence expectations. Detailed stage timing, rubric weights and venue
// arrangements will be published in the competition rulebook before
// registration and can be refined here (and re-seeded) once that lands.
import { leagueDates } from "./_shared.mjs";

export default {
  slug: "young-orator",
  title: "Young Orator",
  shortDescription: "A first speaking competition for younger students: brief preparation, a short speech on a familiar topic, one simple judge response.",
  domain: "D2 – Communication & Public Expression",
  competencies: ["C06", "C08"],
  supportsIndividual: true,
  supportsTeam: false,
  status: "open",
  pathway: "applied_skills",
  image: "/competitions/young-orator.webp",

  overview: `Young Orator gives younger students their first structured public-speaking experience inside the League. After a brief preparation period, each candidate delivers a short speech of one to two minutes on a familiar, age-appropriate topic, then answers one simple question from a judge.

The format is deliberately gentle: the topic is one a Junior-age student can reasonably speak about without specialist research, the preparation time is short by design, and the single judge question is meant to check understanding and composure rather than test the candidate under pressure.

Competency alignment: C06 Verbal Communication and C08 Presentation & Public Speaking are the core competencies this activity makes visible.

Evidence of learning: judges look for organised ideas, clear speech and a sensible response to the single follow-up question — the building blocks every later Applied Skills or Live Performance activity builds on.`,

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
      title: "Preparation, Speech & Judge Response",
      format: "Brief supervised preparation, then a short individual speech and one judge question",
      duration: "1–2 minute speech, after a short preparation period",
      taskDescription: `Each candidate receives a familiar, age-appropriate topic and a short, supervised preparation period. The candidate then delivers a speech of one to two minutes, organising their ideas into a beginning, a main point and a simple ending. After the speech, one judge asks a single simple question related to what the candidate said, and the candidate responds.`,
      progressionRule: "Single-round individual activity, scored out of 100 against the published rubric.",
    },
  ],

  rubrics: [
    {
      stageNumber: 1,
      isPublic: true,
      criteria: [
        { name: "Organisation of ideas", weight: 30 },
        { name: "Clarity of speech", weight: 30 },
        { name: "Confidence & delivery", weight: 20 },
        { name: "Response to judge's question", weight: 20 },
      ],
      tieBreakRule: "Higher Organisation of ideas score, then higher Clarity of speech score.",
    },
  ],

  resources: [
    {
      type: "article",
      title: "A simple speech shape for a 1–2 minute talk",
      content: `Beginning — say what you're going to talk about in one sentence. Middle — give one or two things you think or know about it, in your own words. Ending — finish with a short sentence that sums it up. Practise saying it out loud, not just reading it silently — a speech you've only read feels different once you say it.`,
    },
    {
      type: "article",
      title: "Answering the judge's question",
      content: `The question is simple on purpose — it usually asks you to say a little more about something from your own speech. Take a breath before answering. It's fine to think for a second before you speak. There's no single "correct" answer being looked for; judges want to see that you understood your own topic and can respond calmly.`,
    },
  ],

  faqs: [
    {
      question: "How much time do we get to prepare?",
      answer:
        "A short, supervised period — enough to organise your thoughts, not to write and memorise a full script. Exact timing will be confirmed in the published rulebook.",
    },
    {
      question: "Is the topic something we need to research beforehand?",
      answer:
        "No. Topics are age-appropriate and familiar, so no specialist research or preparation before the event is expected.",
    },
    {
      question: "What if I don't know the answer to the judge's question?",
      answer:
        "It's a simple, related question, not a test of outside knowledge — take a moment, and answer as clearly as you can based on what you already said.",
    },
  ],

  events: leagueDates("2026-12-04", "Competition day", {
    activityNote: "Applied Skills Challenges, week two, closing day.",
  }),
};
