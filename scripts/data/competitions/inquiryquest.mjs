// Extracted from MANUALS/MANUALS/InquiryQuest_Complete_Operations_Manual_v1_0.docx
import { leagueDates } from "./_shared.mjs";

export default {
  slug: "inquiryquest",
  title: "InquiryQuest",
  shortDescription:
    "Scientific inquiry and research report challenge: turn an issued science problem into a disciplined, evidence-based investigation.",
  domain: "Academic & Intellectual Development",
  supportsIndividual: true,
  supportsTeam: false,
  status: "open",
  pathway: "independent_submission",
  image: null,
  manualVersion: "v1.0",
  manualFile: "InquiryQuest_Complete_Operations_Manual_v1_0.docx",

  overview: `InquiryQuest is a controlled research challenge in which students receive one organizer-issued science problem — from Chemistry, Physics, Biology or General Science — and convert it into a disciplined inquiry over a 7–10 day research window.

The competition rewards research quality, source judgement, method, evidence handling, analysis, scientific writing and reflective improvement rather than memorised scientific facts. It is research-first, not recall-first: students are not rewarded for producing the "expected answer", they are rewarded for the quality of the inquiry that leads to a justified conclusion.

One common problem brief creates a comparable research challenge while still allowing different research questions and approaches. Sources and evidence are judged for quality and relevance, not merely counted. Raw or summarised evidence must be traceable to the student's source log or data record. Revision is assessed positively when it is evidence-driven — changing a weak method is a sign of learning, not failure.

The primary submission is a structured scientific inquiry report (recommended 1,500–2,000 words, roughly 6–8 A4 pages of main content) with a source log, an evidence and data record, and a reflection and revision record.

Competency alignment — C03 Research & Inquiry and C04 Learning to Learn are the core competencies, supported by C05 Academic Communication. The final competition score records achievement; competency proficiency remains separately evidence-based.

If the issued problem can be answered adequately through secondary research, students are not required to perform an experiment simply to appear more scientific.`,

  eligibility: [
    {
      category: "secondary",
      minGrade: "8",
      maxGrade: "12",
      notes:
        "Individual participation — every submission must be attributable to one registered student. Recommended category for pilot delivery: Grade 8 to O Level or equivalent, though the organizer may publish narrower grade bands for a particular edition. Students may come from any recognised curriculum; the problem and rubric are common within a category. One entry per student per edition. A school coordinator may support registration and logistics but may not research, write, analyse or edit the student's report.",
    },
  ],

  stages: [
    {
      stageNumber: 1,
      title: "Problem Interpretation, Research Question & Hypothesis",
      format: "Problem deconstruction notes, one focused research question, a hypothesis where appropriate, and a defined scope",
      duration: "Days 1–2 of the research window — 15 marks",
      taskDescription: `Purpose: determine whether the student understands the issued scientific problem and can transform it into a clear, manageable and scientifically meaningful inquiry.

Guiding rules: restate the organizer's problem in your own words before narrowing it • your research question must be answerable with evidence available within the research window • avoid questions that are only definitions (such as "What is photosynthesis?") and ask instead a question that requires investigation, comparison or explanation • if using a hypothesis, state the expected relationship and the scientific reason for that prediction • identify the factor being changed or compared and the outcome being measured where the inquiry is experimental • do not choose a question that requires unsafe procedures or unavailable specialist equipment.

Common pitfalls: changing the official problem into a different topic • writing a question too broad for a short inquiry report • writing a hypothesis as a guess without scientific reasoning • confusing the research question with the final conclusion • choosing variables or evidence that cannot realistically be measured or verified.

Marks: problem understanding (4), research question (5), hypothesis or prediction (3), scope and variables (3).`,
      progressionRule:
        "Students must investigate the issued problem and may narrow it into a researchable question, but may not replace it with an unrelated topic. Cumulative total after Stage 1: 15 marks.",
    },
    {
      stageNumber: 2,
      title: "Research Plan & Source Evaluation",
      format: "Inquiry plan with steps and timing, a source strategy and source log, credibility evaluations, and a safety/feasibility check",
      duration: "Days 1–2 of the research window — 20 marks",
      taskDescription: `Purpose: assess whether the student can plan a coherent inquiry and select credible, relevant sources rather than collecting information randomly.

Guiding rules: plan before collecting evidence by identifying what information or data is needed to answer the question • use a mixture of credible source types where appropriate — school and college textbooks, recognised educational or scientific organizations, peer-reviewed or university material, and reliable datasets • avoid relying on anonymous blogs, copied notes, unsourced social posts or search-engine snippets • use general encyclopedias for orientation only, never as the sole evidence base • record author or organization, title, date, link or publisher and access date as you research rather than reconstructing references at the end • check authority, evidence, relevance, currency and purpose for each major source • plan a safe, realistic primary method only when it adds useful evidence.

Common pitfalls: collecting many weak sources instead of a few strong ones • using only one website or one textbook for the whole report • copying references from another article without reading the original • planning an experiment before clarifying what variable or outcome is needed • using methods that cannot be completed safely or repeated consistently.

Marks: inquiry plan (5), source strategy (5), source evaluation (5), feasibility and safety (5).`,
      progressionRule: "Cumulative total after Stage 2: 35 marks.",
    },
    {
      stageNumber: 3,
      title: "Evidence / Data Collection",
      format: "Completed source log, primary data or observation sheet where used, and secondary evidence notes",
      duration: "Days 2–6 of the research window — 20 marks",
      taskDescription: `Purpose: assess the quality, traceability and relevance of the evidence gathered to answer the research question.

Guiding rules: collect only evidence that helps answer the research question — do not fill the report with unrelated facts • for primary data, keep conditions as consistent as possible except for the factor deliberately changed • repeat measurements where appropriate and record all results, including inconvenient or unexpected values • use correct units and headings, and never erase results simply because they do not support the hypothesis • for secondary evidence, distinguish the source's findings from your own interpretation • keep original notes or data sufficiently complete for moderation • if the method changes, record what changed, why, and what effect that may have on comparability.

Common pitfalls: inventing "perfect" data or removing inconvenient results • collecting data without units, labels or source details • changing more than one important variable without acknowledging it • using screenshots of information without recording the original source • confusing opinion with scientific evidence • collecting large amounts of data that are not relevant to the question.

Safety rules: primary investigation must be low-risk and school-appropriate. Do not use flames, hazardous chemicals, high-voltage equipment, unknown biological samples, microorganisms, invasive procedures, or experiments on people or animals. Never climb, work at unsafe height, bypass laboratory rules or carry out unsupervised procedures that normally require teacher or lab supervision. Human personal data, health data and sensitive personal information must not be collected.

Marks: method alignment (5), evidence quality (5), traceability and records (5), reliability and repeatability (5).`,
      progressionRule: "Cumulative total after Stage 3: 55 marks.",
    },
    {
      stageNumber: 4,
      title: "Analysis, Synthesis & Scientific Conclusion",
      format: "Organised tables, graphs or a thematic evidence summary, plus analysis, conclusion and limitations",
      duration: "Days 5–8 of the research window — 20 marks",
      taskDescription: `Purpose: assess whether the student can interpret evidence, identify patterns, integrate sources and reach a conclusion proportional to what the evidence actually supports.

Guiding rules: organise data before interpreting it and calculate averages or simple comparisons where appropriate • use graphs and tables only when they make a pattern easier to see • explain what the pattern means rather than repeating numbers from a table • compare primary results with credible secondary evidence where relevant • distinguish correlation or association from proven causation • answer the research question directly in the conclusion and state whether the hypothesis was supported, partly supported or not supported • identify meaningful limitations and explain how they affect confidence • never make claims beyond the scale or quality of the evidence.

Common pitfalls: describing results without analysing them • claiming the hypothesis is "proved" — a short school inquiry supports or does not support a hypothesis, it rarely proves a general scientific law • ignoring evidence that conflicts with the preferred conclusion • using a graph with missing labels, units or an inappropriate scale • writing limitations as generic statements unconnected to the actual method • introducing new evidence for the first time in the conclusion.

Marks: data and evidence organization (4), pattern interpretation (5), evidence synthesis (4), conclusion (4), limitations (3).`,
      progressionRule: "Cumulative total after Stage 4: 75 marks.",
    },
    {
      stageNumber: 5,
      title: "Final Inquiry Report & Citation",
      format: "The complete structured report with integrated tables and figures, in-text citations and a reference list",
      duration: "Days 7–9, submitted by the published deadline — 15 marks",
      taskDescription: `Purpose: assess whether the student can communicate the complete inquiry as a concise, logically structured scientific report with transparent sourcing.

Recommended structure: Title and student code • Problem Context • Research Question / Hypothesis • Background Research • Method / Inquiry Design • Results / Evidence • Analysis & Discussion • Conclusion • Limitations & Improvements • Reflection / Revision • References • Appendix if needed. Recommended length 1,500–2,000 words excluding title page, references and appendices, in 11–12 pt body text with clear headings, normal margins and page numbers.

Guiding rules: keep the research question visible throughout • write in your own words, and cite even when paraphrasing • use quotations sparingly, since scientific reports mainly synthesise and paraphrase • number and title every table and figure, identify whether content is student-generated or externally sourced, and refer to them in the text • use one citation style consistently (Harvard or APA — completeness and consistency matter more than the exact style) so every in-text citation has a matching reference entry and vice versa • avoid decorative formatting that reduces readability • proofread scientific terms, units, figure labels and reference completeness before submission.

Common pitfalls: a long introduction but a very short analysis • copying source wording with only minor word changes • listing websites at the end without in-text citation • figures with no source or explanation • leaving raw notes in the main report instead of synthesising them • exceeding the word guidance without a scientific reason.

Marks: report structure (4), scientific writing (4), tables and figures (3), citation and references (4).`,
      progressionRule: "Cumulative total after Stage 5: 90 marks. Raw data, observation sheets and extended calculations may go in an appendix provided the main report is understandable without them.",
    },
    {
      stageNumber: 6,
      title: "Reflection, Revision & Research Integrity",
      format: "Revision and reflection log, a short reflection section, and the final integrity declaration",
      duration: "Submitted with the report — 10 marks",
      taskDescription: `Purpose: assess the student's ability to monitor the quality of the inquiry, make evidence-driven revisions and explain what was learned about the research process.

Guiding rules: identify at least one important decision that changed during the inquiry and explain why • distinguish between correcting an error, improving a method, and changing an interpretation after new evidence • explain what evidence increased or reduced confidence in the final conclusion • identify one realistic next inquiry or improvement that would strengthen the investigation • declare that data, sources and writing are authentic and that prohibited assistance was not used.

Reflection is not a diary of activities; it should analyse learning decisions.

Common pitfalls: writing "everything went well" without identifying learning or limitations • claiming no revisions were needed when the evidence record shows changes • listing mistakes without explaining what was learned • using reflection to introduce major new scientific evidence • failing to acknowledge assistance or tools that the rules require to be declared.

Integrity rules: no fabricated data, invented sources, altered results or copied report text — fabrication or plagiarism may invalidate the entry. Every external idea, data point, image, quotation or close paraphrase must be acknowledged. AI-generated research, analysis, references or report text are not permitted unless a future edition explicitly states otherwise; ordinary spelling and grammar checking may be allowed if it does not generate substantive content.

Marks: revision quality (4), research reflection (3), integrity and ownership (3).`,
      progressionRule: "Cumulative total after Stage 6: 100 marks. Judges award marks within each published criterion weight, record evidence for the judgement, and may use half-marks.",
    },
  ],

  rubrics: [
    {
      isPublic: true,
      criteria: [
        { name: "Problem Interpretation, Research Question & Hypothesis", weight: 15 },
        { name: "Research Plan & Source Evaluation", weight: 20 },
        { name: "Evidence / Data Collection", weight: 20 },
        { name: "Analysis, Synthesis & Scientific Conclusion", weight: 20 },
        { name: "Final Inquiry Report & Citation", weight: 15 },
        { name: "Reflection, Revision & Research Integrity", weight: 10 },
      ],
      tieBreakRule:
        "Four performance levels are applied throughout — Advanced, Proficient, Developing and Emerging — with judges recording evidence for each judgement and half-marks permitted where necessary.",
    },
  ],

  resources: [
    {
      type: "article",
      title: "Problem deconstruction sheet and the question / hypothesis builders",
      content: `Problem deconstruction prompts: what is the scientific problem asking me to understand? What scientific ideas are likely relevant? What is known from the problem brief? What is not yet known? What evidence would help answer the problem? What can realistically be investigated in 7–10 days?

Research-question pattern: How does [factor or condition] affect or relate to [measured or observed outcome] under [defined conditions]?

Hypothesis pattern: If [factor changes], then [outcome is expected to change] because [scientific reasoning].

Inquiry plan template fields: research question (exact final wording) • hypothesis or prediction (expected pattern plus scientific reason) • evidence needed • primary method if any (low-risk method, variables, repetitions, units) • secondary research to verify • timeline • quality checks • safety and ethics justification.`,
    },
    {
      type: "article",
      title: "Source credibility checklist and the source log",
      content: `Six checks for every major source — Authority: who produced it, and what expertise or institutional responsibility do they have? Evidence: does the source provide data, references, method or scientific explanation? Relevance: does it directly help answer this inquiry? Currency: is the date appropriate for the topic or data being used? Purpose: is the source educational, scientific, commercial, persuasive or opinion-based? Cross-check: can an important claim be confirmed by another credible source?

Source log columns to maintain as you research: ID • author or organization • title or source • date • key evidence used • credibility note.

Evidence and data record columns: trial or source ID • condition or variable • observation or measurement • unit • notes and anomalies.`,
    },
    {
      type: "practice_question",
      title: "Analysis and conclusion toolkit",
      content: `Seven questions to work through before writing the conclusion: What is the strongest pattern in the evidence? Are there anomalies or contradictory sources or results? Which evidence is most credible, and why? Does the evidence support, partly support or not support the hypothesis? What alternative explanation might account for the result? What limitation has the greatest effect on confidence? What exact sentence answers the research question without overclaiming?

Illustrative problem styles by track (practice only — these never predict the live problem): Chemistry — how do selected school-safe conditions affect the rate at which a common soluble solid dissolves? Physics — how does one design variable affect the motion or stability of a simple paper model? Biology — what pattern can be identified in a safe plant-growth or environmental observation under controlled conditions? General Science — which common material performs best for a defined school-level insulation, filtration or measurement problem using safe methods?`,
    },
    {
      type: "sample_task",
      title: "Worked sample report — paper-helicopter rotor length (Physics)",
      content: `Training resource only. The measurements below are fictional training data created to demonstrate report structure and analysis — never reuse the data, wording or conclusion as competition evidence.

Research question: how does paper-helicopter rotor length (6 cm, 8 cm and 10 cm) affect the time taken to descend 1.5 m when paper type, body dimensions and added mass are kept constant?

Hypothesis: if rotor length increases, the helicopter will take longer to descend, because the larger rotor area should interact more strongly with the air and increase the resistance opposing downward motion.

Variables — independent: rotor length (6, 8, 10 cm). Dependent: descent time over 1.5 m in seconds. Controlled: paper type, body dimensions, one identical paper clip, drop height, release method, indoor location, timing method.

Method: three models from the same paper with identical body dimensions, differing only in rotor length; one identical paper clip each; a 1.5 m descent marked in a still-air indoor location with no climbing or elevated platform; release from the same marked hand-height point without pushing downward; stopwatch timing from release to the lower mark; five trials per rotor length with all results retained.

Results (mean of five trials): 6 cm — 1.12 s. 8 cm — 1.30 s. 10 cm — 1.48 s.

Analysis: mean descent time increased with rotor length, rising about 0.36 s (roughly 32%) from 6 cm to 10 cm — a consistent positive relationship within the tested range. This is consistent with air resistance opposing motion, but the investigation does not directly measure drag force, so drag is described as an explanation consistent with the observations rather than something measured.

Conclusion: within these conditions, increasing rotor length from 6 cm to 10 cm increased descent time, supporting the hypothesis. The conclusion applies to the tested design and range and should not be generalised to every helicopter shape or material without further testing.

Limitations: stopwatch reaction time (video timing or two independent timers would improve precision) • small folding differences changing rotor shape or angle (a template would reduce this) • only three rotor lengths and five trials (more of both would improve confidence) • indoor air movement minimised but not measured.

Reflection: the original plan compared both rotor length and paper-clip mass. This was revised because changing two major factors would make it difficult to decide which caused the change. The final inquiry changed rotor length only and kept mass constant, improving clarity and making the conclusion easier to justify.

What this demonstrates: a strong report does not need advanced equipment. It needs a focused question, credible background research, a safe and controlled method, traceable evidence, honest analysis, a proportionate conclusion, specific limitations and clear research ownership.`,
    },
    {
      type: "article",
      title: "Research window timeline and final submission checklist",
      content: `Timeline — Day 0: problem release. Days 1–2: research question, hypothesis and inquiry plan. Days 2–6: source log and evidence or data record. Days 5–8: analysis notes and the revision/reflection log. Days 7–9: draft the complete report. By the published deadline, typically Day 10: submit the report plus supporting records.

Final submission checklist: the report answers the organizer-issued problem rather than a different topic • the research question is clear and unchanged unless a revision is transparently explained • every important scientific claim has evidence or a credible citation • tables and graphs have titles, labels and units • raw or working evidence is retained and traceable • the conclusion answers the question without claiming more than the evidence supports • limitations are specific to this inquiry • all in-text citations match the reference list • the spelling and grammar check has not changed scientific meaning • the integrity declaration is completed and the final file opens correctly before upload.`,
    },
  ],

  faqs: [
    {
      question: "Do I choose my own topic?",
      answer:
        "No. The organizer releases one common problem per category or science track, from Chemistry, Physics, Biology or General Science. You may narrow it into a researchable question, but you may not replace it with an unrelated topic — doing so is a listed pitfall that costs marks under Problem Understanding.",
    },
    {
      question: "Do I have to run an experiment?",
      answer:
        "No. If the issued problem can be answered adequately through secondary research, you are not required to perform an experiment simply to appear more scientific. Plan a primary method only when it adds useful evidence — and only when it is low-risk and school-appropriate.",
    },
    {
      question: "How long should the report be?",
      answer:
        "Around 1,500–2,000 words of main content for Grade 8 to O Level, roughly 6–8 A4 pages, excluding the title page, references and appendices. Exceeding the guidance without a scientific reason is a listed pitfall.",
    },
    {
      question: "Can I use AI to help write it?",
      answer:
        "No. AI-generated research, analysis, references or report text are not permitted unless a future edition explicitly states otherwise. Ordinary spelling and grammar checking may be allowed provided it does not generate substantive content, and any assistance the rules require you to declare must be declared.",
    },
    {
      question: "What if my results don't support my hypothesis?",
      answer:
        "Report them honestly. Never erase results because they do not support the hypothesis — the rubric rewards recording anomalies honestly, and a conclusion that states the hypothesis was partly supported or not supported scores better than one that overclaims. A short school inquiry supports or does not support a hypothesis; it rarely proves anything.",
    },
    {
      question: "What if I change my method partway through?",
      answer:
        "Record what changed, why, and what effect it may have on comparability. Revision is assessed positively when it is evidence-driven — changing a weak method is treated as a sign of learning, and Stage 6 awards 4 marks specifically for evidence-driven revisions that improve inquiry quality.",
    },
    {
      question: "What safety limits apply to primary investigation?",
      answer:
        "No flames, hazardous chemicals, high-voltage equipment, unknown biological samples, microorganisms, invasive procedures, or experiments on people or animals. No climbing, no unsafe heights, no bypassing lab rules, and no unsupervised procedures that normally require supervision. Human personal, health or sensitive data must not be collected.",
    },
    {
      question: "How many sources do I need?",
      answer:
        "There is no fixed count — sources are judged for quality and relevance, not counted. The rubric rewards a purposeful range of source types directly matched to your inquiry needs, with authority, evidence, relevance, currency and purpose critically checked. A few strong sources beat many weak ones.",
    },
  ],

  events: leagueDates(null, undefined, {
    workDeadline: true,
    activityNote: "Preceded by a proposed 13–22 November research window opening when the official problem brief is released.",
  }),
};
