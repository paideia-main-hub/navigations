// Extracted from MANUALS/MANUALS/Quantiva_Competition_Manual_and_Solved_Resources_v1_0.docx
//
// Like LexiQuest, the manual is a reusable Version 1.0 specification with no
// fixed event dates ("The city edition notice supplies dates, fees, venues
// and contact details"), so no activity date is scheduled until the organiser
// publishes one. Route 1 category and competencies follow the published
// catalogue (Live Performances).
import { leagueDates } from "./_shared.mjs";

export default {
  slug: "quantiva",
  title: "Quantiva",
  shortDescription:
    "The Mathematical Thinking Challenge: contextual word problems for juniors, mental calculation plus analytical problems for seniors — no calculators, reasoning rewarded.",
  domain: "D3 – STEM, Research & Innovation",
  competencies: ["C12", "C14", "Calculation"],
  supportsIndividual: true,
  supportsTeam: false,
  status: "open",
  pathway: "live_response",
  image: null,
  manualVersion: "v1.0",
  manualFile: "Quantiva_Competition_Manual_and_Solved_Resources_v1_0.docx",

  overview: `Quantiva is an individual mathematics competition delivered at registered school centres. It asks students to make sense of a situation, select a mathematical approach and check whether the answer works.

Junior candidates (Problem Explorers) solve contextual word problems throughout their paper — money, time, sharing, measurement and practical decisions. Senior candidates (Analytical Minds) complete a mental calculation section followed by analytical problems requiring visible reasoning about relationships, data, constraints and competing options.

Core design commitments: every junior item is a word problem, including any number pattern or data task — no standalone arithmetic drill appears in a junior paper. Every candidate works independently and completes both parts of their category paper. No calculator is permitted. Working is expected for junior and senior analytical questions; senior mental questions require final answers only. Mathematical reasoning earns credit independently of arithmetic accuracy where the rubric permits, and speed alone never decides the winner.

School as centre — a school is a supervised delivery centre, not an independent awarding body. It registers candidates, provides suitable rooms and follows the common timetable and security procedures. Navigations or its designated FRL assessment team controls the papers, marking keys, moderation and final published results. Candidates from non-centre schools may be allocated to a nearby registered centre where space and safeguarding arrangements permit.

Vision: confident, reasoned use of mathematics in everyday and unfamiliar situations. Mission: accessible school-centre assessment that recognises understanding, strategy and interpretation alongside accurate calculation.

Competency alignment — C12 Analytical Problem Solving and C14 Quantitative & Data Reasoning are the primary competencies, supported by C01 Critical Thinking and C05 Academic Communication when the task produces the relevant evidence. Results describe this event; awards do not automatically establish a framework proficiency level.`,

  eligibility: [
    {
      category: "primary",
      minGrade: "3",
      maxGrade: "5",
      notes:
        "Quantiva Junior — Problem Explorers, individual. Two separately ranked bands: J1 (Grades 3–4) — whole numbers, familiar units, simple fractions and short multi-step situations; J2 (Grade 5) — longer multi-step situations, decimals, fractions and practical comparisons. Paper: Part A 10 short word problems × 4 = 40 marks, Part B 6 extended word problems × 10 = 60 marks, 60 minutes for the full paper (suggested 20 + 40) after a 10-minute briefing.",
    },
    {
      category: "middle",
      minGrade: "6",
      maxGrade: "8",
      notes:
        "Quantiva Senior — Analytical Minds, band S1, individual, with its own paper and ranking. Mental number skills, ratios, percentages, simple equations, data and logical constraints. Paper: Part A 20 mental items × 2 = 40 marks in 10 minutes; Part B 6 analytical problems × 10 = 60 marks in 50 minutes, with a 5-minute controlled changeover.",
    },
    {
      category: "secondary",
      minGrade: "9",
      maxGrade: "10",
      notes:
        "Quantiva Senior — Analytical Minds, band S2 (Grades 9–10 and O Level equivalent), individual, ranked separately from S1. More complex proportional, algebraic, geometric and statistical reasoning. Same paper structure and timings as S1.",
    },
  ],

  stages: [
    {
      stageNumber: 1,
      title: "Part A — Short Word Problems (Junior) / Mental Maths (Senior)",
      format:
        "Junior: 10 short contextual word problems with a method and an answer in context. Senior: 20 written mental items, final answers only",
      duration: "40 marks — Junior within the 60-minute paper (suggested 20 minutes) / Senior 10 minutes",
      taskDescription: `Junior Part A — ten items carry 4 marks each. Each item asks candidates to show a method and state the answer in context. A labelled drawing, grouping, number line, arithmetic expression or brief explanation is all valid — a formal equation is not required.
Marking per item: model/method 0–2, accurate execution 0–1, answer in context including unit 0–1.
Solved model: a class has 6 boxes with 8 pencils in each; the teacher gives out 15. Method: 6 × 8 = 48; 48 − 15 = 33. Answer: 33 pencils remain. Check: 33 + 15 = 48.

Senior Part A (mental maths) — candidates solve 20 written items in 10 minutes and write final answers only. No calculator, rough working, written algorithms or external aids. All items are visible throughout; there is no oral rapid-fire round and no mark for finishing early. Correct final answer = 2 marks; incorrect or blank = 0; no partial or negative marks.
Solved model: 25 × 48. Mental route: one quarter of 100 × 48 is 4,800 ÷ 4 = 1,200. Write only 1,200 on the live sheet.`,
      progressionRule:
        "No elimination — every candidate completes both parts. Seniors submit the mental sheet before the analytical booklet is issued and cannot return to Part A.",
    },
    {
      stageNumber: 2,
      title: "Part B — Extended Word Problems (Junior) / Analytical Maths (Senior)",
      format: "6 problems × 10 marks requiring a model, a valid strategy, an answer and a check, with full working",
      duration: "60 marks — Junior within the 60-minute paper (suggested 40 minutes) / Senior 50 minutes",
      taskDescription: `Six problems carry 10 marks each. Questions require candidates to organise information, carry out linked steps, interpret the result and provide a check or justification. All necessary data are supplied.

Marking per 10-mark item: understanding/model 0–2 (relevant quantities, unknown and constraints), strategy/reasoning 0–4 (coherent valid steps linked to the question), accuracy and answer 0–2 (correct result with required interpretation), check/evaluation 0–2 (valid independent check or justified comparison).

Follow-through: after an arithmetic slip, later method marks are still awarded when the candidate follows a valid process using their earlier value. A correct answer with no working earns only the applicable accuracy/conclusion marks.

Solved junior model: a club has Rs 1,000 and buys 12 notebooks at Rs 45 and 8 pens at Rs 25. Notebooks = Rs 540, pens = Rs 200, total Rs 740 < 1,000 so it has enough; Rs 260 left. Check: 540 + 200 + 260 = 1,000.

Solved senior model: Service A charges Rs 120 plus Rs 18/km; Service B Rs 60 plus Rs 24/km. 120 + 18d = 60 + 24d gives d = 10 km. At 15 km A = Rs 390 and B = Rs 420, so A is cheaper by Rs 30. Check at 10 km: both Rs 300.`,
      progressionRule: "Final part. Total = Part A + Part B, out of 100. Scores from different categories are not directly comparable.",
    },
  ],

  rubrics: [
    {
      isPublic: true,
      criteria: [
        { name: "Part A — short word problems (Junior) or mental maths (Senior)", weight: 40 },
        { name: "Part B — understanding / model", weight: 12 },
        { name: "Part B — strategy / reasoning", weight: 24 },
        { name: "Part B — accuracy and answer", weight: 12 },
        { name: "Part B — check / evaluation", weight: 12 },
      ],
      tieBreakRule:
        "Rank separately by category and approved paper/session: total score, then Part B score, then the sum of Part B strategy marks. If still tied, award a joint rank. Speed, school reputation and age within a band are never used. A missed section is recorded as incomplete and excluded from full-paper ranking.",
    },
  ],

  resources: [
    {
      type: "practice_question",
      title: "Junior solved word problems — J1 (Grades 3–4)",
      content: `Show a method, state the answer and use the check to test the result. Worked learning examples, not a timed mock.

1. 6 boxes of 8 pencils; 15 are used. How many remain? — 6 × 8 = 48; 48 − 15 = 33 pencils.
2. Aisha has Rs 200 and buys 3 notebooks at Rs 45. Change? — 3 × 45 = 135; 200 − 135 = Rs 65.
3. 48 children sit equally at 6 tables. How many per table? — 48 ÷ 6 = 8.
4. A lesson starts at 9:20 am and lasts 45 minutes. When does it finish? — 10:05 am.
5. A 2 m ribbon; 75 cm is cut off. How much remains? — 200 − 75 = 125 cm.
6. A basket of 24 oranges; one quarter are used. How many remain? — 24 ÷ 4 = 6 used; 18 remain.
7. Classes collect 18, 25 and 17 bottles. Total? — 60 bottles.
8. A garden 8 m by 5 m. Length of fence around it? — 2 × (8 + 5) = 26 m.
9. Minibuses hold at most 8. Fewest for 35 children? — 35 ÷ 8 = 4 r 3, so 5 minibuses.
10. Rs 500; crayon packs cost Rs 75. Most packs? — 6 packs (Rs 450), Rs 50 left.
11. Row 1 has 4 stars, each next row adds 3. Stars in row 4? — 4, 7, 10, 13 → 13.
12. Hamza says 3 bags of 7 marbles is 10. Correct? — No, he added 3 + 7; it is 21.`,
    },
    {
      type: "practice_question",
      title: "Junior solved word problems — J2 (Grade 5)",
      content: `13. 12 notebooks at Rs 45 and 8 pens at Rs 25 from Rs 1,000 — Rs 740 spent, Rs 260 remains.
14. Three quarters of 32 students choose art — 24 choose art, 8 do not.
15. A 2.5 litre jug pours 8 cups of 250 ml — 2,500 − 2,000 = 500 ml left.
16. Trip starts 8:35 am; 1 h 45 min travel plus a 20-minute stop — arrive 10:40 am.
17. Floor 9 m by 6 m; each mat covers 3 m² — 54 ÷ 3 = 18 mats.
18. 4 pencils for Rs 100 or 6 for Rs 138 — Rs 25 vs Rs 23 each; the 6-pack is Rs 2 cheaper per pencil.
19. 95 badges needed, packs of 12 — buy 8 packs (96), 1 left over.
20. Sales of 18, 24, 21, 17 against a target of 100 — 80 sold, 20 more needed.
21. An 18 m rope cut into 8 equal pieces — 2.25 m each.
22. 240 library books, 3/8 lent — 90 lent, 150 remain.
23. Garden 12 m by 8 m with a 2 m gate — 40 − 2 = 38 m of fence.
24. Seat 42 children at exactly 8 tables of 4 or 6 with no empty seats — five 6-seat and three 4-seat tables.`,
    },
    {
      type: "practice_question",
      title: "Senior solved mental maths",
      content: `In the live mental section write answers only — the routes are shown for preparation.

S1 (Grades 6–8): 48 + 37 = 85 • 99 × 6 = 594 (600 − 6) • 25 × 48 = 1,200 (4,800 ÷ 4) • 3/4 of 80 = 60 • 15% of 200 = 30 (10% + 5%) • ratio 2:3 totalling 45, smaller part = 18.

S2 (Grades 9–10): 12.5% of 640 = 80 (one eighth) • 1.25 × 48 = 60 • 7.2 ÷ 0.09 = 80 (720 ÷ 9) • 3x + 7 = 34 gives x = 9 • Rs 800 after a 15% reduction = Rs 680 • 90 km in 1.5 hours = 60 km/h.`,
    },
    {
      type: "sample_task",
      title: "Senior solved analytical problems",
      content: `Worked solutions show the model, strategy, conclusion and check expected.

S1 — 84 members in a 3:4 ratio of boys to girls: 36 and 48; if 6 girls join the ratio becomes 36:54 = 2:3.
S1 — 60 notebooks: Shop A (10 for Rs 450) costs Rs 2,700; Shop B (12 for Rs 516) costs Rs 2,580, saving Rs 120.
S1 — Rectangle with perimeter 50 m, length 5 m more than width: 10 m by 15 m, area 150 m².
S1 — Scores 12, 16, 14, 18: a fifth score of 20 gives a mean of 16; 18 would give only 15.6.
S1 — 40 participants paying Rs 50 or Rs 80 with receipts of Rs 2,600: 20 pay each fee.
S1 — Tables in a row seat 2n + 2: 8 tables seat 18; 14 tables are the least for 30 students.
S2 — Service A (Rs 120 + 18/km) vs B (Rs 60 + 24/km): equal at 10 km; A is Rs 30 cheaper at 15 km.
S2 — A 20% rise then a 20% fall: Rs 1,000 → 1,200 → 960, an overall 4% decrease; the claim that it returns to the original is false.
S2 — An 8 m by 6 m garden with a 1 m path around it: path area = 80 − 48 = 32 m²; the perimeter-strip method misses the four corners.
S2 — 20 students averaging 60 and 30 averaging 70: combined mean 3,300 ÷ 50 = 66, not 65.
S2 — 5 red and 3 blue counters, two drawn without replacement: P(both red) = 5/8 × 4/7 = 5/14.
S2 — 90 seats with at most 8 tables (large 12 seats Rs 500, small 8 seats Rs 300): seven large and one small at Rs 3,800 is cheapest.`,
    },
    {
      type: "article",
      title: "How to prepare",
      content: `Use the solved examples to learn a process, then cover the solution and attempt it independently. For word problems, identify quantities, sketch the situation, choose operations and check units — do not choose an operation only because a familiar keyword appears. For mental maths, practise decomposition, compensation, doubling/halving and familiar fraction-percentage relationships. For analytical tasks, compare representations and test the result against every condition.

Feedback bands — 85–100: highly successful on this paper; 70–84: generally secure with specific gaps; 50–69: developing task performance; below 50: targeted foundational practice needed. These are event bands, not competency proficiency levels.`,
    },
  ],

  faqs: [
    {
      question: "Can I use a calculator?",
      answer: "No. No calculator is permitted in any part of the paper, for any category.",
    },
    {
      question: "Where does the competition take place?",
      answer:
        "At registered school centres. Your school may apply to be a centre; candidates from non-centre schools may be allocated to a nearby registered centre where space and safeguarding arrangements permit.",
    },
    {
      question: "Do I lose all the marks for an arithmetic mistake?",
      answer:
        "No. In junior and analytical questions, reasoning earns credit independently of arithmetic accuracy. After an arithmetic slip, later method marks are still awarded when you follow a valid process using your earlier value.",
    },
    {
      question: "Do I need to show working?",
      answer:
        "Yes for junior questions and the senior analytical section — method and check marks depend on it, and a correct answer with no working earns only the accuracy marks. In the senior mental section, write final answers only.",
    },
    {
      question: "Does finishing first help?",
      answer: "No. There is no speed bonus, and speed is never used to break a tie.",
    },
    {
      question: "Are the practice questions on the live paper?",
      answer:
        "No. The 48 solved examples are practice resources only; live and reserve papers are written separately to the assessment blueprint and practice questions are never reused unchanged.",
    },
    {
      question: "How are results reviewed?",
      answer:
        "Provisional scores are published privately, with two working days to raise a marking query before final results. Each category is ranked separately.",
    },
  ],

  events: leagueDates(null),
};
