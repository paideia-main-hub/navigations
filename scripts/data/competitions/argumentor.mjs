// Extracted from MANUALS/MANUALS/Argumentor_Complete_Operations_Manual_v2_1.docx
import { leagueDates } from "./_shared.mjs";

export default {
  slug: "argumentor",
  title: "Argumentor",
  shortDescription: "Role-reversal motion debate challenge: argue, listen, challenge, rebut, reverse and defend.",
  domain: "D2 – Communication & Public Expression",
  supportsIndividual: true,
  supportsTeam: false,
  status: "open",
  pathway: "applied_skills",
  image: "/competitions/argumentor.jpg",
  manualFile: "Argumentor_Complete_Operations_Manual_v2_1.docx",
  manualVersion: "v2.1",

  overview: `Argumentor is a live, one-day debate challenge that develops students who can construct reasoned positions, listen to opposing views, test claims with evidence, respond respectfully under pressure and communicate persuasively — even when required to argue a position different from the one they previously defended.

Preliminary speaking tests whether a student can build and deliver one side of a motion. The final debate tests a higher level of flexibility: finalists must compete from the opposite stance label, showing that they can reason from more than one perspective.

Key design rule: Argumentor does not reward a student for defending a personal belief. It assesses the ability to construct a reasoned case, use evidence, listen to an opposing position, respond respectfully, rebut logically and adapt when assigned a different side. A candidate may be required to argue a position they do not personally hold — the competition judges argumentative skill, evidence use and adaptability, not the student's personal beliefs.

Competencies developed — Core: C09 Debate & Argumentation. Supporting: C06 Verbal Communication, C08 Presentation & Public Speaking, C10 Interpersonal Communication.

What students gain: practice speaking within a strict three-minute limit; building arguments from evidence rather than emotion; stronger rebuttal, questioning and active listening; the experience of perspective reversal; and confidence in responding to challenge respectfully and concisely.`,

  eligibility: [
    {
      category: "middle",
      minGrade: "8",
      maxGrade: "8",
      notes: "Grade 8 is the lowest eligible grade. Grade 7 and below are not eligible for this edition. Individual entry only — one Argumentor entry per candidate per edition.",
    },
    {
      category: "secondary",
      minGrade: "9",
      maxGrade: "12",
      notes:
        "Open through O Level. A Level and college students are not eligible. Candidates must register through an invited or organizer-approved school. Recommended default language is English. Speech content and live responses must be the candidate's own work; coaching during live rounds is prohibited.",
    },
  ],

  stages: [
    {
      stageNumber: 1,
      title: "Round 1 — Individual Qualification Speech",
      format: "Individual 3-minute motion speech, with an organizer-assigned FOR or AGAINST stance",
      duration: "3 minutes maximum, after 10 minutes of supervised preparation",
      taskDescription: `Every candidate receives one organizer-assigned stance — FOR the motion or AGAINST it — and delivers a single speech of no more than three minutes. Recommended preparation on event day is 10 minutes, during which the candidate may prepare a one-page handwritten outline. No fully scripted speech may be read word-for-word unless the organizer explicitly permits it.

A strong speech states a clear position, develops 2–3 arguments, uses credible examples or evidence, recognises at least one opposing point, and closes with a concise conclusion. A warning signal is given at 2 minutes 30 seconds and the final signal at 3 minutes; the candidate must stop promptly.

Suggested shape — 0:00–0:20 position; 0:20–1:00 argument one with evidence; 1:00–1:40 argument two; 1:40–2:20 counterargument awareness and response; 2:20–3:00 synthesis and closing.`,
      progressionRule:
        "Recommended final field is 8 candidates: the top 4 from the FOR ranking and the top 4 from the AGAINST ranking, provided they meet a minimum qualifying standard of 60/100. Smaller editions may use Top 2 + Top 2. Qualification scores determine advancement only — they do not carry into the final ranking.",
    },
    {
      stageNumber: 2,
      title: "Round 2 — Role-Reversal Final Debate",
      format: "Paired live debate on a new motion, with every finalist's stance label reversed",
      duration: "Approximately 14–16 minutes per debate slot, after 10 minutes of preparation",
      taskDescription: `Every finalist changes stance label. A student who argued FOR in Round 1 must argue AGAINST in the final, and vice versa. The final motion is new, so the student must transfer the debate skill rather than repeat the qualifying speech.

Debate segments per candidate: opening case 3 minutes; cross-questioning 1 minute of questions and responses; rebuttal 2 minutes; closing statement 1 minute. Both finalists receive identical speaking opportunities and timing.

No external coaching, internet search or communication with non-participants is permitted during final preparation. Judges score each student individually — the pair's win or loss is not the sole basis of the final ranking.`,
      progressionRule:
        "The Round 2 individual debate score determines the final ranking. 1st, 2nd and 3rd positions are awarded after moderation of all finalist scores. Optional special recognitions (Best Rebuttal, Best Evidence Use, Best Role-Reversal Performance) must be announced before the competition begins.",
    },
  ],

  rubrics: [
    {
      stageNumber: 1,
      isPublic: true,
      criteria: [
        { name: "Position & relevance", weight: 15 },
        { name: "Argument quality & logic", weight: 25 },
        { name: "Evidence & examples", weight: 20 },
        { name: "Counterargument awareness", weight: 15 },
        { name: "Delivery & verbal clarity", weight: 15 },
        { name: "Structure, timing & conduct", weight: 10 },
      ],
      tieBreakRule: "Qualification scores decide advancement only. Where advancement is tied, the higher Argument quality & logic score advances.",
    },
    {
      stageNumber: 2,
      isPublic: true,
      criteria: [
        { name: "Role-switch adaptability", weight: 20 },
        { name: "Argument & evidence", weight: 20 },
        { name: "Counterargument & rebuttal", weight: 20 },
        { name: "Questioning & active listening", weight: 15 },
        { name: "Persuasion & delivery", weight: 15 },
        { name: "Closing synthesis & conduct", weight: 10 },
      ],
      tieBreakRule:
        "1) Higher Counterargument & Rebuttal score. 2) Higher Role-Switch Adaptability. 3) Higher Questioning & Active Listening. 4) A two-minute tie-break response to a fresh mini-motion, assessed by the Chief Judge.",
    },
  ],

  resources: [
    {
      type: "article",
      title: "Resource A — Motion Analysis Canvas",
      content: `Work through these prompts before writing a single line of your speech: What does the motion require us to support or oppose? Which key word(s) need a simple definition? Who are the main stakeholders? What is the strongest reason for my assigned side? What evidence or example could support it? What is the strongest likely argument from the other side? What is my response to that argument? What should the judge remember at the end?`,
    },
    {
      type: "article",
      title: "Resource B — CER Argument Builder",
      content: `Claim — the point you want the judge to accept ("Schools should…", "This policy would…"). Evidence — a fact, example, observation or credible source that supports the claim ("For example…", "Evidence from…"). Reasoning — explains why the evidence makes the claim more convincing ("This matters because…", "Therefore…"). Every argument you make should contain all three.`,
    },
    {
      type: "article",
      title: "Resource C — The Rebuttal Ladder",
      content: `1. LISTEN: identify the opponent's exact claim. 2. TEST: ask whether the claim is supported, relevant and logically connected. 3. CHALLENGE: identify the weakness, missing assumption, exception or consequence. 4. RESPOND: give your counter-reason or evidence. 5. WEIGH: explain why your response matters more to the motion.

Useful language: "The opposing side argues that ____. However, that assumes ____. A stronger interpretation is ____ because ____. Therefore, on this motion, ____."`,
    },
    {
      type: "article",
      title: "Resource D — Evidence Reliability Check",
      content: `Before you use a piece of evidence, check: Relevance — does it actually support my claim? Source — is it identifiable and appropriate? Recency — does the date matter for this claim? Context — am I using it in the same context in which it was produced? Balance — is there important contrary evidence I should acknowledge? Accuracy — can I state the fact accurately without exaggeration?`,
    },
    {
      type: "article",
      title: "Resource E — Three-Minute Speech Planner",
      content: `Opening + stance — 20 seconds: define the issue and state your side. Argument 1 — 40 seconds: claim, evidence/example, reasoning. Argument 2 — 40 seconds: a second distinct reason. Argument 3 or impact — 40 seconds: add depth, consequence or stakeholder impact. Counterargument + rebuttal — 25 seconds: address the strongest expected objection. Closing — 15 seconds: weigh the case and finish decisively.`,
    },
    {
      type: "sample_task",
      title: "Resource F — Role-Reversal Practice Drill",
      content: `1. Choose one motion. 2. Prepare and deliver a two-minute FOR case. 3. Take three minutes to prepare the AGAINST side. 4. Produce at least two arguments that are not simply copied from the first speech. 5. Have a partner ask one challenge question. 6. Give a 30-second rebuttal and identify which side was harder to defend, and why.`,
    },
    {
      type: "article",
      title: "Four-Week Preparation Plan",
      content: `Week 1 — Argument foundations: Claim–Evidence–Reasoning, identifying assumptions, building two-sided issue maps. Week 2 — Three-minute speaking: timed speeches, openings and closings, explaining evidence, reducing reading. Week 3 — Listening & rebuttal: partner debates, question drills, the rebuttal ladder, respectful disagreement. Week 4 — Role reversal & mock final: random side assignment, a new motion, role switch and a full timed final-debate simulation.`,
    },
    {
      type: "practice_question",
      title: "Practice Motion Bank — School Life",
      content: `Schools should limit weekend tests. • School uniforms should remain compulsory. • Student diaries should be replaced by digital planners. • Schools should introduce one homework-free day each week. • Students should have a formal voice in selected school rules.`,
    },
    {
      type: "practice_question",
      title: "Practice Motion Bank — Technology",
      content: `Smartphones should be prohibited during the school day. • AI tools should be permitted for selected school assignments with disclosure. • Printed textbooks should remain the main learning resource in school. • Schools should prioritize digital literacy over learning additional software tools.`,
    },
    {
      type: "practice_question",
      title: "Practice Motion Bank — Environment, Learning, Community & Youth",
      content: `Environment: Schools should make waste segregation compulsory. • Single-use plastic should be removed from school canteens. • Every school should have a student-led environmental action target. Learning: Homework is more useful than additional supervised practice at school. • Group projects should contribute more to school assessment. • Schools should give students more choice in project topics. Community: Community service should be part of school life. • Schools should organize more inter-school activities than internal competitions. Youth: Students should have scheduled time in school for independent reading. • Extracurricular participation should be considered in school recognition systems. • Schools should prioritize collaboration over individual competition in selected activities.`,
    },
    {
      type: "sample_task",
      title: "Worked Example — \"Schools should prohibit smartphones during the school day\"",
      content: `FOR — possible case: Focus, limiting access during lessons can reduce avoidable distraction and make classroom routines easier to manage. Fairness, a common rule reduces disputes about when personal devices may be used. Safety and responsibility, a controlled rule can reduce unsupervised recording or inappropriate use. Response to opposition: educational uses can be provided through school-controlled devices or teacher-authorized exceptions.

AGAINST — possible case: Learning utility, phones support research, calculators, dictionaries, accessibility tools and rapid classroom tasks when supervised. Digital responsibility, schools can teach appropriate use rather than avoiding the technology. Practical communication, controlled access may be useful for approved school communication and emergencies. Response to proposition: the problem may be misuse rather than the device itself.

Learning point: a strong finalist understands both sets of arguments without treating either side as a personal identity.`,
    },
    {
      type: "article",
      title: "Candidate Readiness Checklist",
      content: `I can explain the exact meaning of the motion before building arguments. • I can build a claim, support it with evidence, and explain the reasoning link. • I can deliver a complete case within three minutes. • I can listen and summarize an opponent's argument fairly before rebutting it. • I can ask a short question that tests logic or evidence rather than attacking the speaker. • I have practised both FOR and AGAINST sides of motions. • I can switch sides without presenting the assigned role as my personal belief. • I can acknowledge uncertainty instead of inventing a fact. • I know that respectful language and conduct are part of the assessment.`,
    },
  ],

  faqs: [
    {
      question: "Do I get to choose whether I argue for or against the motion?",
      answer:
        "No. The organizer assigns your stance, and the organizer balances FOR and AGAINST allocations as evenly as possible. Personal agreement with the motion is irrelevant to judging — refusing to accept the assigned side means you cannot continue in that round.",
    },
    {
      question: "What happens in the final that is different from the qualifying round?",
      answer:
        "Your stance label is reversed. If you argued FOR in Round 1 you must argue AGAINST in the final, and vice versa — on a brand new motion. That reversal is scored directly: Role-switch adaptability is worth 20 of the final round's 100 marks.",
    },
    {
      question: "How much preparation time do I get, and what can I bring?",
      answer:
        "Ten minutes is recommended in both rounds. In Round 1 you may prepare a one-page handwritten outline during the permitted preparation period. Only materials specifically permitted for each round may be used, and no external coaching, internet search or communication with non-participants is allowed during final preparation.",
    },
    {
      question: "Can I read my speech from a script?",
      answer:
        "No full scripted speech may be read word-for-word unless the organizer explicitly permits it. Judges are instructed to reward direct audience communication over reading, and delivery and verbal clarity carry 15 marks in Round 1.",
    },
    {
      question: "What happens if I run over three minutes?",
      answer:
        "The timekeeper stops the speech and any material after the stop signal is not scored. A warning signal is given at 2 minutes 30 seconds. Repeated refusal to stop may trigger a conduct penalty.",
    },
    {
      question: "What counts as a serious rule breach?",
      answer:
        "Personal attacks or disrespectful language bring a conduct deduction and may lead to disqualification. Fabricating a statistic, quotation or source reduces your evidence score and deliberate fabrication may trigger an integrity review. External coaching during live preparation is an integrity breach and may remove you from the round.",
    },
    {
      question: "Who is eligible to enter?",
      answer:
        "Grade 8 through O Level only. Grade 7 and below, and A Level or college students, are not eligible for this edition. Entry is individual — there is no team registration — and one candidate may hold only one Argumentor entry per edition.",
    },
  ],

  events: leagueDates("2026-11-25", "Competition day — qualifying speeches and role-reversal final", {
    activityNote: "Applied Skills Challenges, week one. Qualifying rooms run first; selected finalists debate the same day.",
  }),
};
