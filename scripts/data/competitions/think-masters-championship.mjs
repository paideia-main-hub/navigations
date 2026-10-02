// Extracted from MANUALS/MANUALS/Think_Masters_Championship-2.docx
// (Review Draft — Version 4.0, 17 August 2026)
import { leagueDates } from "./_shared.mjs";

export default {
  slug: "think-masters-championship",
  title: "Think Masters Championship",
  shortDescription:
    "A one-venue, one-day team championship combining a reasoning competition with a problem-solving tournament: research an unseen scenario, present, defend and document.",
  domain: "D1 – Academic Excellence & Intellectual Development",
  competencies: ["C01", "C02", "C03"],
  supportsIndividual: false,
  supportsTeam: true,
  status: "open",
  pathway: "live_response",
  image: null,
  manualFile: "Think_Masters_Championship-2.docx",
  manualVersion: "Review Draft v4.0",
  manualDate: "2026-08-17",

  overview: `Think Masters Championship is a school-based team competition combining a reasoning competition and a problem-solving tournament. It exists to identify and strengthen students' thinking competencies through research, analysis, evidence use, problem interpretation, presentation, questioning and solution justification — deliberately broader than conventional academic performance. Scenarios may come from science, society, environment, business, education, school life and everyday life; what is assessed is how a team investigates, thinks, solves and justifies, not simply what it already knows.

Teams of three register through their school and attend a single controlled event. The official scenario is released at the venue, so no team can arrive with a pre-built answer. From there the team moves through one continuous research-to-decision journey: understand the problem, investigate, evaluate evidence, analyse, generate and compare alternatives, and select a defensible response — all before presenting to a three-person panel and defending that response under questioning. The same research and reasoning is then converted into a two-page written summary, due in advance of the live final.

Core competencies developed: C01 Critical Thinking and C02 Problem Solving. A team's position is an achievement record; competency credit still depends on what a student actually did and can evidence, not on the result alone.`,

  eligibility: [
    {
      category: "secondary",
      minGrade: "9",
      maxGrade: "10",
      teamMinSize: 3,
      teamMaxSize: 3,
      notes:
        "Team of exactly 3 students, registered through the school. Grade range is proposed and will be confirmed in the published competition rules before registration. All three members must participate in research and presentation; competency credit is individual even though the result is a team outcome.",
    },
  ],

  stages: [
    {
      stageNumber: 1,
      title: "Research & Evidence-Based Response",
      format: "On-site research using permitted books and devices, following the release of the official scenario",
      duration: "Approximately 3 hours",
      taskDescription: `Teams receive one organizer-approved scenario at the venue and move through a ten-step research sequence: understand the problem and its constraints, turn it into focused research questions, investigate using permitted sources, evaluate and verify evidence, analyse relationships and trade-offs, generate more than one plausible response, compare alternatives against relevant criteria, decide and justify the strongest option, test it against changed conditions and limitations, then prepare the presentation and summary from the same evidence trail.

Every team keeps a source log throughout — web references identify author/organisation, title, site and access date; book references identify author, title, publisher and year. AI tools are not permitted at any point for searching, generating, rewriting or substantially producing competition work, and teams may not communicate with other competing teams during the research window.`,
      progressionRule:
        "Scored against the Round 1 rubric out of 100. A published minimum qualifying score (recommended 60/100) or a fixed quota decides which teams advance to the live presentation, decided and published by the Director before the event and never changed after results are seen.",
    },
    {
      stageNumber: 2,
      title: "Presentation & Panel Questioning",
      format: "Live presentation to a three-person judging panel, followed by structured questioning",
      duration: "Approximately 15 minutes per team (recommended 8–10 minute presentation, 5 minutes of questions)",
      taskDescription: `Qualifying teams present their problem framing, evidence, analysis, alternatives, decision and limitations — this is not a speech contest; judges are assessing the reasoning behind what is shown. A recommended maximum of 8 content slides keeps the presentation about thinking rather than volume of research, and all three members are expected to hold a meaningful speaking role.

The panel then asks structured questions that probe reasoning rather than memorisation: why a piece of evidence is reliable, how the evidence led to the conclusion, what alternative was considered and rejected, what assumption could be wrong, and what the team would change if an important condition changed.`,
      progressionRule:
        "Scored against the Round 2 rubric out of 100. Final ranking combines Round 1 research, Round 2 presentation and questioning, and the two-page summary under the published weighting.",
    },
    {
      stageNumber: 3,
      title: "Two-Page Summary",
      format: "Written synthesis of the same research and decision process, submitted in advance of the live final",
      duration: "Maximum two A4 pages including references",
      taskDescription: `The two-page summary documents the evidence chain the team actually built on site: problem, research findings, analysis, alternatives, decision process, recommendation, limitations and references. It is due by the published work deadline — well ahead of the live presentation and defence — and no substantive edits are accepted after that point.

Formatting: A4, 2.0–2.5 cm margins, Arial/Aptos/Calibri, 11–12 pt body with 14–16 pt bold headings, one consistent citation style, PDF preferred, filed as TeamCode_School_ThinkMasters_Summary.`,
      progressionRule:
        "Scored against the Round 3 rubric and combined with Rounds 1 and 2 for the final ranking, ahead of the live final defence day.",
    },
  ],

  rubrics: [
    {
      stageNumber: 1,
      isPublic: true,
      criteria: [
        { name: "Problem understanding", weight: 15 },
        { name: "Research relevance", weight: 20 },
        { name: "Source quality & evidence", weight: 20 },
        { name: "Analysis & interpretation", weight: 20 },
        { name: "Problem-solving approach", weight: 15 },
        { name: "Integrity & clarity", weight: 10 },
      ],
      tieBreakRule: "Higher Analysis & interpretation score, then higher Research relevance score.",
    },
    {
      stageNumber: 2,
      isPublic: true,
      criteria: [
        { name: "Problem framing", weight: 15 },
        { name: "Evidence & interpretation", weight: 20 },
        { name: "Quality of reasoning", weight: 20 },
        { name: "Problem-solving strategy / solution", weight: 20 },
        { name: "Response to questions & challenges", weight: 15 },
        { name: "Team participation & clarity", weight: 10 },
      ],
      tieBreakRule:
        "Reasoning quality, then evidence use, then problem-solving strategy, then response to challenge, then summary quality; if still tied, a pre-announced additional reasoning task decides.",
    },
  ],

  resources: [
    {
      type: "article",
      title: "The ten-step research sequence",
      content: `Understand — read and restate the scenario. Define — identify the central problem and constraints. Investigate — collect relevant information from permitted sources only. Evaluate — compare reliability and relevance. Analyse — organise evidence and identify relationships. Generate — develop more than one possible response. Compare — weigh strengths, weaknesses and trade-offs. Decide — select and justify a response with evidence. Test — check whether it would still hold under changed conditions. Prepare — build the presentation and summary from the same trail, so every claim can be traced back to a source.`,
    },
    {
      type: "article",
      title: "Scenario categories teams should expect",
      content: `Scenarios are drawn from three families and released only at the venue: Social (for example, balancing study demands, recreation and responsible technology use, or responding to incomplete or conflicting information), Academic Science (for example, assessing a school water or energy issue from observations and data), and School / Everyday Life (for example, reducing wasted school time, school waste, or improving safety during arrival and departure). Each scenario states its context, central problem, guiding research questions, any organiser-supplied evidence, and relevant constraints — the response still has to be the team's own.`,
    },
    {
      type: "article",
      title: "Research authenticity rules",
      content: `Computers, mobile devices and permitted books or reference sources may be used for research. AI tools are not permitted for research, generating, writing or substantially modifying competition work. Every important factual statement, statistic or external idea used in the presentation or summary must be traceable to a logged source, and copied passages must never be presented as original work. Research notes and the source log may be requested for authenticity verification at any point.`,
    },
    {
      type: "sample_task",
      title: "Presentation self-check before the panel",
      content: `Is the problem clear in the first minute? Is each major claim supported by evidence? Does the presentation explain how the evidence led to the recommendation, not just what was found? Are alternatives and their trade-offs visible, not just the final choice? Can every one of the three members defend the work if questioned directly?`,
    },
  ],

  faqs: [
    {
      question: "Can we prepare an answer before the event?",
      answer:
        "No. The scenario is released at the venue at the start of the research period, so no team can arrive with a pre-selected response. The competition assesses how your team investigates and reasons through an unseen problem, not a rehearsed answer.",
    },
    {
      question: "Are AI tools allowed during research?",
      answer:
        "No. AI tools are not permitted at any stage — for research, drafting, rewriting or producing any part of the presentation or two-page summary. Everything submitted has to be the team's own work from sources it can show.",
    },
    {
      question: "How is the final result decided?",
      answer:
        "Three components are combined: the Round 1 research score, the Round 2 presentation and panel-questioning score, and the two-page summary. The published weighting and tie-break order decide the final ranking, and a published minimum score decides who advances from Round 1 to the live final.",
    },
    {
      question: "Does the whole team have to speak?",
      answer:
        "Yes. All three members are expected to hold a meaningful role in both the research and the presentation, and Team participation & clarity is its own scored criterion in Round 2. A result is recorded for the team, but each member's individual contribution is what the competency record is built on afterward.",
    },
    {
      question: "What happens to the two-page summary after we submit it?",
      answer:
        "It's assessed on its own rubric and combined with your Round 1 and Round 2 scores. No substantive edits are accepted after the submission deadline, so treat it as final once it's in.",
    },
  ],

  events: leagueDates("2026-12-06", "Live final defence — presentation and panel questioning", {
    workDeadline: true,
    activityNote:
      "Submit your two-page research summary by the work deadline; the live presentation, questioning and final ranking take place at the finale, weekend day two.",
  }),
};
