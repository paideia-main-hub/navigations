// From documentation/FRL_Catalogue_REVISED_Nov_Dec_2026.docx — Route 1,
// Project Showcasing. No standalone manual has been published yet; this
// file carries the catalogue's confirmed nature, competency alignment and
// evidence expectations. Detailed rubric weights and display arrangements
// will be published in the competition rulebook before registration and can
// be refined here (and re-seeded) once that lands.
import { leagueDates } from "./_shared.mjs";

export default {
  slug: "digitalhorizon",
  title: "DigitalHorizon",
  shortDescription: "Design an environmental awareness poster, submit it in advance, and see it displayed at the League finale.",
  domain: "D4 – Digital & Media Literacy",
  competencies: ["C16", "C20"],
  supportsIndividual: true,
  supportsTeam: false,
  status: "open",
  pathway: "project_showcase",
  image: null,

  overview: `DigitalHorizon asks students to design an original environmental awareness poster and submit it ahead of the League finale, where it joins a curated display alongside the other Project Showcasing entries. It is a submission-and-display competition rather than a live judged round: the work is made in advance, on the student's own time, and assessed from the finished poster and its supporting sources.

The task is deliberately about combining a clear message with credible information — a striking poster that makes an inaccurate or unsupported claim is not what this competition is looking for.

Competency alignment: C16 Digital Literacy and C20 Information & Media Literacy are the core competencies, with C19 Digital Media Creation and C38 Environmental Responsibility as supporting evidence.

Evidence of learning: entrants submit the poster itself, a source list backing any factual claim it makes, and a short design rationale explaining the choices behind it — together, these are what let a judge tell credible information use from a good-looking guess.`,

  eligibility: [
    {
      category: "secondary",
      minGrade: "9",
      maxGrade: "12",
      notes:
        "Individual entry, Senior category. Final grade eligibility will be confirmed in the published competition rules before registration.",
    },
  ],

  stages: [
    {
      stageNumber: 1,
      title: "Poster Design & Submission",
      format: "Independent design work, submitted online ahead of the work deadline",
      duration: "Self-paced, ahead of the published submission deadline",
      taskDescription: `Working independently, the entrant designs one original environmental awareness poster, chooses and records the sources behind any factual claim it makes, and writes a short rationale explaining the design and messaging choices behind it. All three — the poster file, the source list and the rationale — are uploaded together by the submission deadline.`,
      progressionRule: "Assessed from the submitted poster, source list and rationale against the published rubric; no live round.",
    },
  ],

  rubrics: [
    {
      stageNumber: 1,
      isPublic: true,
      criteria: [
        { name: "Message clarity & impact", weight: 30 },
        { name: "Credibility of information & sourcing", weight: 25 },
        { name: "Design & visual communication", weight: 25 },
        { name: "Design rationale", weight: 20 },
      ],
      tieBreakRule: "Higher Credibility of information & sourcing score, then higher Message clarity & impact score.",
    },
  ],

  resources: [
    {
      type: "article",
      title: "Before you design: get the message right",
      content: `One poster should carry one clear message, not three competing ones. Every factual claim on the poster needs a source you can name — if you can't say where a number or fact came from, don't put it on the poster. A striking design still needs to be honest; judges are explicitly checking whether the information holds up, not just whether the poster looks good.`,
    },
  ],

  faqs: [
    {
      question: "Is this judged live, or just from what we submit?",
      answer:
        "Just from what you submit — the poster, your source list and your design rationale. There's no live presentation for this competition; selected posters go on display at the finale.",
    },
    {
      question: "What exactly needs a source?",
      answer:
        "Any factual claim your poster makes — a statistic, a scientific fact, anything a reader might otherwise take on trust. Your source list should let a judge check where each one came from.",
    },
  ],

  events: leagueDates("2026-12-05", "Displayed at the finale", {
    workDeadline: true,
    activityNote: "Submit your poster, sources and design rationale by the work deadline; the curated display runs across both finale days, 5–6 December.",
  }),
};
