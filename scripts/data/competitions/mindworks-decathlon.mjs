// Extracted from MANUALS/MANUALS/MindWorks Decathlon Implementation Manual 25-08-26.pdf
import { leagueDates } from "./_shared.mjs";

export default {
  slug: "mindworks-decathlon",
  title: "MindWorks Decathlon",
  shortDescription:
    "A ten-station intellectual performance circuit: interpret, reason, evaluate, solve, connect, audit, synthesise and reflect.",
  domain: "Academic Excellence & Intellectual Development",
  competencies: ["C01", "C05"],
  supportsIndividual: true,
  supportsTeam: false,
  status: "open",
  pathway: "applied_skills",
  image: "/competitions/mindworks-decathlon.webp",
  manualFile: "MindWorks Decathlon Implementation Manual 25-08-26.pdf",

  overview: `MindWorks Decathlon is a ten-station intellectual performance competition in which students demonstrate how they interpret information, reason logically, evaluate evidence, solve constrained problems, connect concepts, audit flawed reasoning, synthesise research and reflect on their own thinking.

Students move through ten short, carefully structured stations and leave a visible trail of intellectual evidence: data analysis, reasoning records, annotated text, evidence matrices, solution canvases, concept maps, corrected reasoning, academic abstracts, source syntheses and reflective defense. Every station requires a response artifact that shows how the student reached a conclusion.

The pitch statement says it plainly: MindWorks does not ask only "What does the student know?" It asks "What can the student do with information, evidence, ideas and uncertainty?"

Ten timed stations total 100 marks. Stations 1–8 are 10 minutes and 8 marks each, Station 9 is 20 minutes and 16 marks, and Station 10 is 20 minutes and 20 marks. Each station is scored on four criteria at levels 1–4 (Station 10 uses five), and each candidate finishes with a total score plus a ten-stage performance profile showing where they are strongest — data reasoning, logic, evidence judgement, transfer, synthesis or metacognition.

Competency promise — C01 Critical Thinking (interpret patterns, test logic, evaluate evidence, diagnose problems, detect reasoning errors, compare alternatives, justify conclusions) and C05 Academic Communication & Integrated Intellectual Performance (annotate, structure, summarise, synthesise, explain connections, produce academic abstracts, defend reasoning). The final station adds metacognitive evidence.

Question philosophy: unfamiliar but accessible stimuli, where reasoning matters more than prior specialised content knowledge. No specialist subject syllabus is required, and students know the station purpose, preparation method, task formats and rubric before the event — only the live stimulus stays unseen.

A MindWorks rank or total mark is not automatically a competency proficiency level; competition performance and proficiency remain separate.`,

  eligibility: [
    {
      category: "middle",
      minGrade: "6",
      maxGrade: "8",
      notes:
        "Junior category. Individual competition, so every portfolio contains attributable evidence of the student's own thinking. Task adjustment: shorter texts, simpler datasets, fewer variables and guided response templates. Schools may register multiple students, with entries capped per category by venue capacity. Reasonable access arrangements preserve the competency being assessed while reducing irrelevant barriers.",
    },
    {
      category: "secondary",
      minGrade: "9",
      maxGrade: "10",
      notes:
        "Senior category — Grades 9–10 / O Level equivalent. Individual competition. Task adjustment: more ambiguous evidence, multi-variable datasets, higher synthesis demand and less scaffolding. Same ten-station architecture as Junior; only the stimulus complexity changes.",
    },
  ],

  stages: [
    {
      stageNumber: 1,
      title: "Data Decode",
      format: "Graph, table or data display plus a task sheet → a Data Analysis Sheet",
      duration: "10 minutes — 8 marks",
      taskDescription: `Purpose: assess whether a student can move from reading data to interpreting patterns, making cautious inferences and justifying conclusions with quantitative evidence.

Preparation: practise reading bar charts, line graphs, tables, percentages and simple multi-variable displays • always separate what the data directly shows from what you are only inferring • when asked for evidence, quote a value, comparison, trend or calculated difference • practise identifying when a claim cannot be proven because a required variable is missing.

Task formats: A) trend interpretation — a line graph across time with one missing or changing variable. B) comparison — a table comparing two schools, regions or groups. C) claim test — data supplied with a statement that may be only partly supported.

Sample: a school's monthly electricity use runs January 8,200 kWh, February 7,900, March 8,600, April 10,400, May 12,100, June 13,500. Identify the highest month; calculate the increase from March to June; describe the overall pattern; give two possible explanations; then decide whether the table alone is sufficient evidence for the claim "Electricity use is increasing because student numbers are increasing."

No calculator unless the published category rules allow one — calculations stay simple enough to test reasoning rather than computation load.

Criteria: Accuracy, Pattern Interpretation, Inference, Justification.`,
      progressionRule: "Four criteria × 1–4 = 16 raw points; raw total ÷ 2 = the 8-mark station score. Stations 1 + 4 combined form the third tie-break comparison.",
    },
    {
      stageNumber: 2,
      title: "Logic Lab",
      format: "Logic problem card plus a reasoning grid → a Reasoning Record",
      duration: "10 minutes — 8 marks",
      taskDescription: `Purpose: assess deductive reasoning, sequencing, elimination, consistency checking and the ability to show a transparent reasoning pathway rather than only a final answer.

Preparation: practise ordering, matching, conditional logic, number and shape rules and "if-then" constraints • write each deduction as a short reason rather than guessing mentally • use elimination tables or diagrams when several possibilities exist • after solving, check that every original rule is satisfied.

Marks reward the recorded pathway, so a correct answer with no reasoning cannot receive the highest level.

Task formats: A) ordering puzzle — people or tasks placed in sequence under constraints. B) matching puzzle — match people, subjects, times or locations. C) rule pattern — determine which conclusion must be true from a set of statements.

Sample: Amina, Bilal, Hamza and Sara present 1st to 4th. Bilal presents after Amina; Sara is not first; Hamza presents immediately before Sara; Amina is not third. Complete the order, show at least three reasoning steps, say which rule was most useful and why, then check the final order against all four rules.

Criteria: Correctness, Reasoning Sequence, Transparency, Verification.`,
      progressionRule: "Four criteria × 1–4 = 16 raw points ÷ 2 = 8 marks. Both the working and the final response are collected.",
    },
    {
      stageNumber: 3,
      title: "Text Lens",
      format: "Unseen passage (120–220 words) plus a question card → an annotated passage and Critical Response",
      duration: "10 minutes — 8 marks",
      taskDescription: `Purpose: assess close reading, interpretation, inference, use of textual evidence and evaluation of an author's idea or implication in a short unfamiliar passage.

Preparation: underline words signalling contrast, uncertainty, cause, consequence or judgement • answer "what does the text suggest?" with an inference plus a phrase from the text • distinguish summary from analysis by explaining why a detail matters • practise with short passages from science, society, history and literature so the task is not tied to one subject.

Judges accept alternative interpretations when they are supported by the passage.

Sample passage: "The school introduced tablets into every classroom believing that greater access to technology would automatically improve learning. Six months later, teachers reported faster access to information, but several also noticed that students were spending less time discussing difficult questions with one another. The technology had changed the classroom, but whether it had improved learning remained uncertain." Questions then ask what assumption the school made, one positive outcome and one unintended consequence, what "remained uncertain" suggests about the evidence, and a 70–100 word response to "Technology improves learning only when it improves the way students think."

Criteria: Comprehension, Textual Evidence, Inference, Evaluation.`,
      progressionRule: "Four criteria × 1–4 = 16 raw points ÷ 2 = 8 marks. The annotated passage is retained as part of the evidence artifact.",
    },
    {
      stageNumber: 4,
      title: "Evidence Check",
      format: "A claim card plus 3–5 evidence cards → a completed Evidence Matrix and final judgement",
      duration: "10 minutes — 8 marks",
      taskDescription: `Purpose: assess whether students can distinguish a claim from evidence and judge relevance, credibility, strength, bias, correlation and the limits of causal conclusions.

Preparation: ask four questions about any evidence — Is it relevant? Is the source credible? Is the sample or method strong enough? Does it prove the claim or only support part of it? • practise comparing an anecdote, a survey, expert opinion and a controlled study • watch for absolute words such as "always", "never" or "proves", which usually require stronger evidence • never reject a source simply because you disagree with it, and evaluate the evidence quality instead.

The evidence set always includes at least one apparently persuasive but methodologically weak item.

Sample claim: "Students who complete homework every day always achieve higher examination grades." Evidence A: a teacher says regular-homework students appear more confident. B: a survey of 500 students finds a positive association between homework completion and exam scores. C: one student says "I never do homework and I still get good grades." D: a controlled study reports that homework benefits varied by age, task quality and feedback. Complete the matrix, identify the strongest and weakest evidence, then choose Strongly support / Partially support / Insufficient evidence / Reject and justify in 60–80 words.

Judges score the reasoning, not whether the student selects a predetermined opinion where the evidence allows more than one qualified position.

Criteria: Relevance, Credibility, Evidence Comparison, Conclusion.`,
      progressionRule: "Four criteria × 1–4 = 16 raw points ÷ 2 = 8 marks.",
    },
    {
      stageNumber: 5,
      title: "Problem Solver",
      format: "Scenario brief with constraint cards, plus a Change Card revealed mid-station → a Solution Canvas",
      duration: "10 minutes — 8 marks",
      taskDescription: `Purpose: assess problem diagnosis, feasibility, constraint management, option comparison and adaptive decision-making when conditions change.

Preparation: start by defining the real problem before suggesting a solution • list constraints separately — money, time, people, rules, safety, environment, stakeholder needs • generate at least two options before choosing one • always state how success will be measured • practise changing a plan when a new constraint appears.

At approximately minute 6 the invigilator reveals the Change Card. You must visibly revise the plan rather than erase the original reasoning — both the original diagnosis and the quality of the adaptation are scored.

Sample: the school produces about 40 kg of food waste each day and wants to cut it by at least 40% within three months. Constraints: an initial budget of PKR 60,000, no additional permanent staff, students must be involved, food-safety rules cannot be compromised, and results must be measurable. Change Card at minute 6: the budget is reduced to PKR 30,000. The canvas asks for the real problem, who is affected, two options, the chosen option and why, the main risk, how success will be measured, and what changes after the new budget.

Criteria: Problem Diagnosis, Feasibility, Constraint Handling, Adaptation.`,
      progressionRule: "Four criteria × 1–4 = 16 raw points ÷ 2 = 8 marks. The original canvas, the visible revision and the success measure are all retained.",
    },
    {
      stageNumber: 6,
      title: "Concept Builder",
      format: "Three concept cards from different disciplines plus a central issue card → a Concept Map",
      duration: "10 minutes — 8 marks",
      taskDescription: `Purpose: assess transfer of learning by requiring students to connect concepts from different disciplines and apply the relationships to one real-world issue.

Preparation: learn to explain a concept in your own words before connecting it to another • use arrows with relationship words such as causes, limits, increases, depends on, optimizes or affects • avoid simply listing subjects side by side and instead show how one concept changes or influences another • finish with an integrated conclusion that could not be produced from only one discipline.

Mapping must include labelled relationships, not decorative arrows.

Task formats: A) Biology + Economics + Mathematics applied to resource management. B) History + Geography + Statistics applied to migration or urban growth. C) Science + Design + Business applied to sustainable product choices.

Sample: Concept A — Ecosystem (Biology). Concept B — Scarcity (Economics). Concept C — Optimization (Mathematics). Central issue: managing water resources in a growing city. Explain each concept in that context, draw at least three labelled connections, identify one trade-off created by their interaction, and write a 60–80 word integrated conclusion explaining why one discipline alone is insufficient.

Criteria: Concept Accuracy, Connections, Integration, Application.`,
      progressionRule: "Four criteria × 1–4 = 16 raw points ÷ 2 = 8 marks.",
    },
    {
      stageNumber: 7,
      title: "Reasoning Audit",
      format: "A worked response containing 3–5 embedded errors → an Audit Sheet",
      duration: "10 minutes — 8 marks",
      taskDescription: `Purpose: assess intellectual quality control — students inspect a worked answer, explanation or solution, locate reasoning errors, classify them, correct them and explain why the correction matters.

Preparation: practise reviewing other people's worked solutions rather than only solving from scratch • look for unsupported assumptions, calculation mistakes, wrong generalizations, missing variables and conclusions stronger than the evidence • when you identify an error, write a correction and explain the consequence • do not assume every unusual step is wrong — verify it against the information given.

You must not rewrite the entire task; at least one embedded error is subtle, such as a causal conclusion drawn from correlational evidence. Judges score the quality of diagnosis and correction, not the number of highlighted lines.

Sample flawed response: "A survey of 30 students found that 21 students who used educational videos reported high marks. Therefore, educational videos cause students to get high marks. Because 70% of the sample reported high marks, the same result will apply to every student in the school. The school should replace textbooks with videos." Identify at least three reasoning problems, classify each using the audit codes (factual, logical, calculation, evidence, assumption, conclusion), write a corrected version of each statement, and say which error most seriously weakens the final recommendation.

Criteria: Error Detection, Classification, Correction, Explanation.`,
      progressionRule: "Four criteria × 1–4 = 16 raw points ÷ 2 = 8 marks.",
    },
    {
      stageNumber: 8,
      title: "Abstract Sprint",
      format: "A 150–250 word mini-research brief → a 100–120 word academic abstract",
      duration: "10 minutes — 8 marks",
      taskDescription: `Purpose: assess academic compression — identifying purpose, method, key result and conclusion, then synthesising them into concise original academic language.

Preparation: practise finding four elements in any mini-study — purpose, method, result, conclusion • do not copy full sentences, combine information in your own wording • remove examples and minor detail unless essential to the finding • check the word limit and ensure the result is not exaggerated beyond what the study supports.

Direct copying beyond short unavoidable terms reduces the synthesis score, and judges check factual fidelity before style.

Sample mini-study: 120 students took part in a six-week comparison. Half used their normal revision method; half used short retrieval-practice quizzes three times per week. Both groups studied the same syllabus. The retrieval-practice group scored an average of 8 percentage points higher on a common test. The study lasted only six weeks and did not measure long-term retention. Researchers concluded that regular retrieval practice may improve short-term test performance under these conditions. Write a 100–120 word abstract including purpose, method, key result and conclusion — without copying full sentences, and without claiming the study proves long-term improvement.

Criteria: Coverage, Synthesis, Concision, Academic Communication.`,
      progressionRule: "Four criteria × 1–4 = 16 raw points ÷ 2 = 8 marks.",
    },
    {
      stageNumber: 9,
      title: "Rapid Synthesis",
      format: "3–4 short sources with differing perspectives plus a synthesis matrix → a 150–180 word integrated response",
      duration: "20 minutes — 16 marks",
      taskDescription: `Purpose: assess whether students can integrate several short sources, compare perspectives, identify tensions and produce one independent, evidence-based conclusion rather than separate summaries.

Preparation: create a source comparison table before writing • look for agreement, disagreement, different priorities and missing evidence • use all sources but do not automatically give each its own paragraph • make your final recommendation your own conclusion after comparing the evidence, not a copied source opinion.

The response must visibly use all required sources, and judges reward source integration rather than a predetermined policy position.

Sample — "Should schools restrict smartphones?" Source A (Research): frequent non-academic phone checking can interrupt attention during lessons. Source B (Student): phones support family contact, research and timetable access, and complete bans may create practical problems. Source C (School Leadership): consistent rules reduce classroom disputes, but emergency access and learning activities require controlled exceptions. Complete the matrix across Learning, Communication, Distraction and Safety/Access; identify one point of agreement and one tension; write a 150–180 word policy recommendation using all three perspectives; and state one limitation of the available evidence.

Criteria: Source Integration, Comparison, Evidence Use, Independent Conclusion.`,
      progressionRule: "Four criteria × 1–4 = 16 marks with no halving. This is the first tie-break criterion for the overall result.",
    },
    {
      stageNumber: 10,
      title: "Reflection & Defense",
      format: "Written reflection followed by a panel oral defense with randomised question cards",
      duration: "20 minutes — 8–10 minutes writing plus 5–7 minutes of panel questions — 20 marks",
      taskDescription: `Purpose: assess metacognition and academic self-awareness — students identify how they reasoned, where assumptions or limitations occurred, how their strategy changed, and what thinking can transfer to future learning.

Preparation: keep track of where you changed your mind during the competition • be ready to name evidence, not only say "I found it difficult" • practise explaining one strength, one limitation and one improvement strategy • a strong reflection discusses thinking decisions, not personality labels such as "I am smart" or "I am weak."

Written prompts: the station in which I performed strongest was ___ because ___ • the most difficult reasoning decision I made was ___ • one assumption I initially made was ___ • evidence caused me to change or retain my view because ___ • if I repeated one station, I would change ___ • one thinking strategy I can transfer to another subject is ___.

Panel cards then probe your own decisions rather than re-testing content: What evidence most influenced one of your decisions? Where could your reasoning have been stronger? Which two stations required similar thinking, and how? What would stronger evidence have looked like in one station? The judge may refer to one of your earlier artifacts.

No marks are awarded for confidence alone — reasoning quality is central, and the reflection is assessed on evidence of thinking rather than on claiming that every stage went well.

Criteria: Evidence Awareness, Metacognition, Limitations, Transfer, Oral Defense.`,
      progressionRule: "Five criteria × 1–4 = 20 marks. This is the second tie-break criterion.",
    },
  ],

  rubrics: [
    {
      isPublic: true,
      criteria: [
        { name: "Stage 1 — Data Decode", weight: 8 },
        { name: "Stage 2 — Logic Lab", weight: 8 },
        { name: "Stage 3 — Text Lens", weight: 8 },
        { name: "Stage 4 — Evidence Check", weight: 8 },
        { name: "Stage 5 — Problem Solver", weight: 8 },
        { name: "Stage 6 — Concept Builder", weight: 8 },
        { name: "Stage 7 — Reasoning Audit", weight: 8 },
        { name: "Stage 8 — Abstract Sprint", weight: 8 },
        { name: "Stage 9 — Rapid Synthesis", weight: 16 },
        { name: "Stage 10 — Reflection & Defense", weight: 20 },
      ],
      tieBreakRule:
        "In order: 1) Rapid Synthesis, 2) Reflection & Defense, 3) combined Data Decode plus Evidence Check. If still tied, equal rank is declared or organizer policy published before the event applies.",
    },
  ],

  resources: [
    {
      type: "article",
      title: "Student Quick Guide — one line per station",
      content: `Data Decode — quote data; separate evidence from inference. Logic Lab — show the chain of reasoning, then check every rule. Text Lens — interpret, support with text, then explain significance. Evidence Check — judge relevance, credibility and strength before deciding. Problem Solver — define the problem, respect constraints, adapt when conditions change. Concept Builder — explain concepts accurately and show labelled relationships. Reasoning Audit — find the error, correct it, explain why it changes the conclusion. Abstract Sprint — purpose + method + result + qualified conclusion, in your own words. Rapid Synthesis — compare sources, integrate them, then form your own conclusion. Reflection & Defense — use evidence from your own performance; explain thinking, limitations and transfer.`,
    },
    {
      type: "article",
      title: "Six-week preparation roadmap",
      content: `Week 1 — Understand the competition: read all station purposes and rubric language, and complete one diagnostic task from each station. Week 2 — Data and logic: practise Data Decode and Logic Lab, requiring visible working and justification. Week 3 — Text and evidence: practise Text Lens and Evidence Check using short unfamiliar materials. Week 4 — Problem and concepts: practise constrained solutions and interdisciplinary concept maps. Week 5 — Reasoning quality and abstract: audit flawed responses and write 100–120 word abstracts. Week 6 — Synthesis and reflection: complete multi-source synthesis and oral reflection drills. Final practice — run a timed mini-MindWorks with shortened versions of all ten stations.

The preparation rule: learn the method, not the live question. Students know the station structure, response template and rubric before competition day. Practice resources may use similar formats but never disclose live data, passages, claims, scenarios or source sets. Teachers may coach reasoning habits and response structure but must not provide model answers to live tasks. Practice should be timed, because intellectual organisation under time pressure is part of the design.`,
    },
    {
      type: "article",
      title: "How the marks work",
      content: `Stations 1–8 each use four rubric criteria scored 1–4, giving 16 raw rubric points; the raw total is divided by two to produce the 8-mark station score. Station 9 uses four criteria × 1–4 = 16 marks directly. Station 10 uses five criteria × 1–4 = 20 marks. Total: 100.

The four levels — 4 Advanced: accurate, independent, integrated and well-justified performance that handles complexity or ambiguity. 3 Proficient: mostly accurate and logically supported, handling the central demand independently. 2 Developing: partial success with some correct reasoning but gaps, weak integration or incomplete justification. 1 Emerging: limited evidence of the target behaviour; the response is mainly unsupported, inaccurate, copied or descriptive.

The website shows the total score plus a ten-stage performance profile, so schools can see where a student performed strongly or needs development. Schools are advised to use the stage profile for development conversations, not only the final rank.`,
    },
    {
      type: "article",
      title: "Competition-day operations",
      content: `Arrival 30–45 minutes before the start with your admit card and candidate code, then to the holding area. A 10-minute briefing covers rotation, timing signals, prohibited materials, evidence labelling and emergency procedure. Candidates are divided into balanced rotation groups to avoid congestion.

Each station uses sealed or screen-released resource packs, and materials are not reused until all relevant groups finish. A central clock or synchronised station timers control timing — standard short stations are 10 minutes. Transitions are 2 minutes, and no discussion of station content is allowed during a transition.

Paper responses are candidate-coded and digital responses are auto-associated with the candidate ID. The final defense is conducted individually or in small scheduled panels after the written stations. Markers use stage-specific rubric criteria and all raw criteria scores are retained; at least a sample of high, boundary and unusual scripts is double-reviewed, and final scores are locked only after missing marks and moderation flags are resolved.`,
    },
    {
      type: "article",
      title: "What the resource packs guarantee",
      content: `Clarity — every student resource begins with Purpose, Time, What you receive, What you must submit, and Marks. Reading load — stimulus length suits the category and leaves enough time for thinking, not just reading. Neutrality — tasks never depend on a student sharing a particular political, religious or personal opinion; scoring focuses on reasoning quality. Prior knowledge — essential facts are included in the stimulus unless they are normal age-level academic knowledge. Accessibility — readable fonts, clear numbering, adequate spacing and unambiguous diagrams. Security — live packs are version-controlled and never released with preparation materials. Answer flexibility — judge guides distinguish fixed-answer components from open but defensible reasoning. Evidence capture — every sheet carries the candidate code, category, stage code and page count.`,
    },
  ],

  faqs: [
    {
      question: "Is this a subject quiz?",
      answer:
        "No. MindWorks is a structured intellectual-performance circuit. No specialist subject syllabus is required, and stimuli rely on general academic literacy, numeracy and reasoning appropriate to the age category — reasoning matters more than prior specialised content knowledge.",
    },
    {
      question: "Do I know the questions in advance?",
      answer:
        "You know the station purposes, task formats, response templates and rubrics before the event — only the live stimulus stays confidential. Practice resources may use similar formats but never disclose live data, passages, claims, scenarios or source sets.",
    },
    {
      question: "Does a correct answer with no working score full marks?",
      answer:
        "No. In Logic Lab the marks reward the recorded pathway, so a correct answer with no reasoning cannot reach the highest level — and across the circuit, every station requires an artifact that shows how you reached your conclusion.",
    },
    {
      question: "How long is each station?",
      answer:
        "Stations 1–8 are 10 minutes each and worth 8 marks. Rapid Synthesis is 20 minutes for 16 marks, and Reflection & Defense is 20 minutes for 20 marks. Transitions between stations are 2 minutes, with no discussion of content allowed.",
    },
    {
      question: "What happens in the Problem Solver Change Card?",
      answer:
        "At around minute 6 the invigilator reveals new information — in the sample, a budget cut from PKR 60,000 to PKR 30,000. You must visibly revise your plan rather than erase the original reasoning, because both the original diagnosis and the quality of your adaptation are scored.",
    },
    {
      question: "Can one weak station ruin my result?",
      answer:
        "Much less than in a single-task competition. Repeated short stations give multiple opportunities to demonstrate competence instead of allowing one weak task to define the whole result — and you receive a stage profile, not just a rank.",
    },
    {
      question: "Is the final reflection about saying everything went well?",
      answer:
        "The opposite. The reflection is assessed on evidence of thinking, not on claiming every stage went well — the top band requires identifying genuine assumptions, errors or limitations and their impact. No marks are awarded for confidence alone.",
    },
    {
      question: "Does winning establish a competency level?",
      answer:
        "No. A MindWorks rank or total mark is not automatically a competency proficiency level. Competition performance and competency proficiency stay separate, with proficiency assessed from the quality, depth and independence of the submitted evidence.",
    },
  ],

  events: leagueDates("2026-11-23", "Competition day — the ten-station circuit and panel defense", {
    activityNote: "Applied Skills Challenges, week one, opening day. Full-day station rotation; arrive 30–45 minutes before the published start time.",
  }),
};
