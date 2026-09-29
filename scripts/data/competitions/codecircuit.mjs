// Extracted from MANUALS/MANUALS/CodeCircuit_Web_Based_Progressive_Coding_Challenge_Manual_v2_0.docx
import { leagueDates } from "./_shared.mjs";

export default {
  slug: "codecircuit",
  title: "CodeCircuit",
  shortDescription:
    "Web-based progressive coding challenge: understand, decompose, design an algorithm, code, test, debug, improve and submit live.",
  domain: "Digital, Computing & Media Literacy",
  competencies: ["C17", "C18"],
  supportsIndividual: true,
  supportsTeam: false,
  status: "open",
  pathway: "applied_skills",
  image: "/competitions/codecircuit.webp",
  manualVersion: "v2.0",
  manualFile: "CodeCircuit_Web_Based_Progressive_Coding_Challenge_Manual_v2_0.docx",

  overview: `CodeCircuit is a fully website-operated live coding competition run in four progressive stages.

It is not an ordinary programming examination. It assesses the full computational problem-solving process: a student must understand the problem, decompose it, design an algorithm, build a working program, test it, debug it, improve it, and submit the final code live through the competition website.

Website-first rule: the CodeCircuit website is the official competition environment. Challenge release, stage timing, responses, code execution, autosave, test records, final submission and the audit timestamp are all captured through the platform. Work not submitted through the official website is not the official entry unless a documented contingency procedure is activated.

Competency alignment — C17 Computational Thinking and C18 Programming & Technology are the core competencies, supported by C02 Problem Solving. Competition marks and rank record event performance; they do not automatically establish competency proficiency.

Recommended environment: one browser-based programming environment controlled by the organizer, with Python recommended for a unified text-based first edition because it supports both beginner and advanced difficulty through task design. The permitted language and environment are published before registration closes, and the execution-day environment matches the practice environment as closely as possible.

Fairness principle: no specialist libraries, hardware, databases or internet APIs are required unless declared in advance and provided equally. CodeCircuit assesses reasoning and programming rather than access to a particular school's advanced computing resources. External AI coding assistants and code-generation tools are not permitted during the live competition.`,

  eligibility: [
    {
      category: "middle",
      minGrade: "6",
      maxGrade: "8",
      notes:
        "Junior category, individual. Recommended duration 90 minutes across the same four progressive stages. Coding complexity: introductory logic, sequence, selection, repetition and simple data use — variables, input/output, arithmetic, comparison, if/elif/else, for and while loops, simple strings and lists, and simple functions where appropriate. Stage 1 provides structured input-output-condition prompts, and 3–4 organizer tests are used. Junior and Senior results are ranked separately.",
    },
    {
      category: "secondary",
      minGrade: "9",
      maxGrade: "10",
      notes:
        "Senior category — Grades 9 to O Level / equivalent — individual. Recommended duration 120 minutes. Coding complexity: stronger control structures, functions, data collections, validation and multi-test logic, including nested logic, list and dictionary processing, aggregation and modular structure. Decomposition is more open with fewer prompts, and 5–7 tests are used including edge and invalid cases.",
    },
  ],

  stages: [
    {
      stageNumber: 1,
      title: "Problem Decomposition",
      format: "Structured decomposition form completed in the website",
      duration: "15 marks — 15 minutes Junior / 20 minutes Senior",
      taskDescription: `Purpose: assess whether the student understands the problem before writing code.

Read the complete challenge and identify the required result. List the required inputs and outputs. Identify the rules, conditions and constraints. Break the task into smaller computational steps. Identify at least one edge case or special case. Junior candidates may receive structured prompts; Senior candidates receive less scaffolding.

Marks: requirement understanding (4 — accurately identifies what the program must accomplish), inputs / outputs / constraints (4 — identifies necessary data, expected outputs and important limits), decomposition (5 — breaks the problem into logical, manageable sub-problems), edge-case awareness (2 — recognises at least one non-obvious case the solution must handle).

Decomposition canvas to work through: what must the program do? What inputs are provided? What outputs are required? What rules or conditions control the result? What can be broken into smaller steps? What repeated pattern exists? What edge or special case should be tested?`,
      progressionRule:
        "The website releases the competition in stages; the organizer may require Stage 1 and Stage 2 to be submitted before Stage 3 coding becomes available. Earlier-stage records stay visible to judges even if the candidate later changes approach, creating a traceable reasoning-to-code pathway.",
    },
    {
      stageNumber: 2,
      title: "Algorithm Builder",
      format: "Pseudocode, flow logic or another approved algorithm representation",
      duration: "20 marks — 20 minutes Junior / 25 minutes Senior",
      taskDescription: `Purpose: assess the logic of the proposed solution independently of programming syntax.

Write pseudocode, structured steps or another organizer-approved algorithm representation. Show decision points clearly. Show repetition and loops where appropriate. Identify how outputs will be produced. For Senior challenges, include functions, modules or data-structure logic where relevant. The algorithm should be complete enough that another programmer could follow it.

Marks: algorithm correctness (8 — the sequence can solve the stated problem and handles key conditions), logical structure (5 — decisions, repetition and data flow organised appropriately), completeness (4 — important steps and edge cases included), clarity and efficiency (3 — readable and avoids unnecessary complexity).

Use the algorithm planner format: for each step, record the logic or pseudocode alongside why that step is needed.`,
      progressionRule: "Third tie-break criterion. The Stage 2 record remains visible to judges even if the coding approach changes later.",
    },
    {
      stageNumber: 3,
      title: "Live Coding",
      format: "Browser code editor with Run/Test, autosave and version history",
      duration: "40 marks — 35 minutes Junior / 50 minutes Senior",
      taskDescription: `Purpose: convert the planned solution into functioning code within the official website environment.

Use the website code editor only. You may run your code multiple times during the stage. The platform may provide visible sample tests, and hidden validation tests may be used after final submission — hidden tests are identical for every candidate in the same category and challenge version. Follow your Stage 2 algorithm, but revise it if coding reveals a logical problem. Code should produce the required output accurately and handle the specified input format. Readable names and reasonable structure are rewarded, but functionality remains the largest component.

Marks: functional correctness (24 — the program correctly performs the required core functions and passes the major test cases), logic implementation (7 — code faithfully implements a sound computational approach), input and edge handling (5 — handles specified boundary, validation or exceptional cases), code clarity (4 — readable, structured and avoids unnecessary repetition).

Conduct rules: work individually with no communication between candidates; use only the official website and explicitly permitted local tools; never copy code from another candidate, external storage, a messaging service or an online source; no AI code-generation or autocomplete assistance; never attempt to access hidden test cases, another candidate's account, administrator functions or website infrastructure; follow invigilator instructions and stop when the website closes the session; report any genuine platform or computer fault immediately rather than attempting unauthorised workarounds.`,
      progressionRule: "Functional correctness here is the first tie-break criterion, and may combine automated test results with judge and technical review.",
    },
    {
      stageNumber: 4,
      title: "Test, Debug, Improve & LIVE Submit",
      format: "Test and debug log, then the mandatory FINAL SUBMIT through the website",
      duration: "25 marks — 20 minutes Junior / 25 minutes Senior",
      taskDescription: `Purpose: assess whether the candidate can verify the program, diagnose faults, improve the solution and complete the official final submission correctly.

The website releases the required test cases or testing checklist. Run and record tests for normal, boundary and invalid or special cases. If a test fails, identify the likely cause and correct the program. Make at least one justified improvement where the task permits — clarity, validation, efficiency, output quality or removal of duplicated logic. Before the timer expires, review the final code and click FINAL SUBMIT. The website then displays a confirmation containing your Candidate ID, submission time and version or hash audit reference.

After FINAL SUBMIT you cannot edit the official code unless the organizer unlocks the entry for a documented technical incident. Failing to click FINAL SUBMIT before session closure means the most recent autosaved state may only be accepted under a published contingency rule.

Marks: test design and coverage (7 — relevant normal, boundary and special cases rather than one successful example), debugging (7 — identifies the cause of errors and corrects them effectively), improvement (5 — a meaningful improvement you can explain), final verification (4 — checks final behaviour, inputs, outputs and required conditions before submission), submission discipline (2).

Clicking FINAL SUBMIT is mandatory for a valid entry, but submission itself does not replace programming quality — Stage 4 marks are awarded mainly for testing, debugging, improvement and verification. The website timestamp establishes which code version is official.`,
      progressionRule:
        "Second tie-break criterion (Testing & Debugging). A verified technical failure never reduces a candidate's score — any time restoration, account reset, machine change or final-submission override is logged so the same principle applies consistently.",
    },
  ],

  rubrics: [
    {
      isPublic: true,
      criteria: [
        { name: "Stage 1 — Problem Decomposition", weight: 15 },
        { name: "Stage 2 — Algorithm Builder", weight: 20 },
        { name: "Stage 3 — Live Coding", weight: 40 },
        { name: "Stage 4 — Test, Debug, Improve & Final Submit", weight: 25 },
      ],
      tieBreakRule:
        "In order: 1) Stage 3 Functional Correctness, 2) Stage 4 Testing & Debugging, 3) Stage 2 Algorithm, 4) greater number of hidden or verification tests passed, 5) a short organizer-issued debugging mini-task completed live under Chief Judge supervision.",
    },
  ],

  resources: [
    {
      type: "article",
      title: "The Debugging Ladder — REPRODUCE, LOCATE, EXPLAIN, FIX, RETEST, IMPROVE",
      content: `1. REPRODUCE — run the failing test again and confirm the error. 2. LOCATE — identify the line, condition or step where behaviour diverges. 3. EXPLAIN — state what the code is doing versus what it should do. 4. FIX — change the smallest relevant part of the program. 5. RETEST — run the failed test and at least one previously passing test. 6. IMPROVE — after correctness, consider clarity, validation or efficiency.

Test case planner columns to fill for each test: test type (normal / boundary / alternative / invalid or special), input, expected output, actual output, pass or fail, and what you changed.`,
    },
    {
      type: "practice_question",
      title: "Junior challenge themes (Grades 6–8)",
      content: `Attendance Checker — calculate attendance percentage and classify whether follow-up is required. House Score Tracker — add points from several events and identify the leading house. Recycling Sorter Logic — classify common school waste items into organizer-defined categories. Library Fine Helper — calculate a simple late-return fine using published rules. Water Use Checker — compare daily water use with a target and display an appropriate message. Traffic-Light Sequence — simulate a safe simple traffic-light cycle using conditions and timing values. Quiz Score Analyzer — calculate score and percentage and display category feedback. School Event Capacity — check whether a room can safely accommodate a given number under a supplied capacity rule.`,
    },
    {
      type: "practice_question",
      title: "Senior challenge themes (Grades 9 – O Level)",
      content: `Attendance Analytics — process multiple attendance records and flag patterns using defined rules. Timetable Conflict Checker — identify simple clashes from a structured set of sessions. Energy Consumption Analyzer — aggregate usage, compare targets and generate alerts or recommendations. School Queue Simulator — model basic queue and service data and identify bottleneck indicators. Survey Result Analyzer — process responses, calculate percentages and identify the strongest option. Sustainability Calculator — combine several resource-use values into a simple school sustainability score. Library Inventory Logic — track borrowing and returns and detect unavailable or overdue items under supplied rules. Event Registration Validator — validate candidate data against category, capacity and duplicate-entry rules.`,
    },
    {
      type: "sample_task",
      title: "Worked examples — Attendance Checker (Junior) and School Energy Analyzer (Senior)",
      content: `Junior — Attendance Checker. Scenario: a program takes the number of days present and total school days, calculates attendance percentage and prints one of three messages according to organizer thresholds. Stage 1 decompose: inputs are days present and total days; output is percentage plus status; conditions are that total days must exceed zero and thresholds determine status. Stage 2 algorithm: read values → validate total days → calculate percentage → compare with thresholds → print percentage and status. Stage 3: implement in the official editor and run sample cases. Stage 4: test the normal case, the exact threshold and total_days = 0; correct the division-by-zero behaviour; improve output formatting; click FINAL SUBMIT.

Senior — School Energy Analyzer. Scenario: the program receives energy-use values for several school areas, calculates total and average use, identifies areas exceeding a supplied target and produces a summary. Stage 1 decompose: inputs are area names, usage values and the target; outputs are total, average and the list of areas over target; edge cases are an empty list and invalid or negative values per the published rule. Stage 2 algorithm: validate data → aggregate total → calculate average → loop through areas → compare each value with target → collect flagged areas → print summary. Stage 3: use a suitable collection and loop or function structure. Stage 4: run multiple records, the exact-target case and the empty or special case; fix one logic error; improve repeated logic through a function; submit final code live.`,
    },
    {
      type: "article",
      title: "Five-week preparation plan and practice mode",
      content: `Week 1 — Problem decomposition: translate everyday problems into inputs, outputs, conditions and sub-problems. Week 2 — Algorithms: write pseudocode and flow logic before coding; practise decisions and loops. Week 3 — Coding: build small working solutions from algorithms under timed conditions. Week 4 — Testing and debugging: use normal and boundary tests; debug prepared faulty programs. Week 5 — Full simulation: complete all four stages in the website practice environment and submit before the timer closes.

Practice mode: every candidate should receive at least one practice login before execution day. The practice dashboard demonstrates the timer, editor, Run/Test button, autosave, stage submission and the FINAL SUBMIT process. Practice problems resemble the structure without revealing live tasks, and students should specifically practise recovering from a failed test and resubmitting. A technical-readiness check verifies browser, keyboard, code editor and login before the event.`,
    },
    {
      type: "article",
      title: "Pre-event credential checklist and the FINAL SUBMIT checklist",
      content: `Before the event: I have my Candidate ID • I have created or confirmed my private login password • I can log into the practice portal • I know whether I am registered in Junior or Senior • I have tested the editor and Run/Test button • I understand the four-stage flow • I know that FINAL SUBMIT creates my official code entry • I know how to report a technical fault immediately.

Before clicking FINAL SUBMIT: my code runs in the official editor • I have checked the required input format • I have checked the required output format • I have run the organizer's required tests • I have checked at least one edge or special case • I have corrected known errors • I have reviewed the code version visible in the editor • I am ready for this version to become my official submission • I click FINAL SUBMIT before the session timer closes • I wait for the website confirmation screen and do not close the browser early.

Credentials are personal and must never be shared. Using another candidate's account, copying code, using external AI code generation, or attempting to access hidden tests, admin functions or other accounts all trigger integrity review and may lead to disqualification.`,
    },
    {
      type: "article",
      title: "Optional code ownership verification",
      content: `The organizer may conduct a short 2–3 minute verification with shortlisted or top-scoring candidates. This is not a separate presentation round — it confirms ownership and understanding of the submitted code, and normally functions as an integrity control rather than adding a large new mark component.

Be ready to: explain what one selected condition or loop does • explain why a particular function or data structure was used • describe one failed test and the fix you made • predict what the program would do with a changed input • identify one improvement you could make with more time.`,
    },
  ],

  faqs: [
    {
      question: "Do I code the whole time?",
      answer:
        "No. Live coding is 40 of the 100 marks and roughly a third of the session. Before it you complete a decomposition form (15 marks) and an algorithm (20 marks), and afterwards a testing, debugging and improvement stage (25 marks) ending in the live submission.",
    },
    {
      question: "What happens if I don't click FINAL SUBMIT?",
      answer:
        "Your entry may not be valid. Clicking FINAL SUBMIT is mandatory — it locks and timestamps the official code version. If you miss it before session closure, the most recent autosaved state may only be accepted under the published contingency rule.",
    },
    {
      question: "Can I use AI, autocomplete or look things up online?",
      answer:
        "No. External AI coding assistants, code-generation tools and unapproved websites are all prohibited during the live competition, and use of them is an integrity breach that may lead to disqualification.",
    },
    {
      question: "Which language will we use?",
      answer:
        "One organizer-controlled browser environment, with Python recommended for a unified text-based first edition. The permitted language and environment are published before registration closes, and the execution-day environment matches the practice environment as closely as possible.",
    },
    {
      question: "What if my computer or the website fails during the session?",
      answer:
        "Report it immediately rather than attempting a workaround. A verified technical failure never reduces your score — the incident protocol covers login failures, single-machine failure, connectivity loss, widespread outage, Run/Test failure and even FINAL SUBMIT button failure, each with a documented time-restoration or acceptance rule.",
    },
    {
      question: "Can I change my algorithm once I start coding?",
      answer:
        "Yes. You should follow your Stage 2 algorithm, but you may revise it if coding reveals a logical problem. Your earlier-stage records stay visible to judges either way, which is what creates the traceable reasoning-to-code pathway.",
    },
    {
      question: "Is one passing test enough for Stage 4?",
      answer:
        "No. The top band of Test Design & Coverage requires relevant normal, boundary and special cases rather than one successful example, and you must also make at least one justified improvement you can explain.",
    },
  ],

  events: leagueDates("2026-11-26", "Competition day — live website session and final code submission", {
    activityNote: "Applied Skills Challenges, week one. Delivered in supervised computer labs; Junior 90 minutes, Senior 120 minutes.",
  }),
};
