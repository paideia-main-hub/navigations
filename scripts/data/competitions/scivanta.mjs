// Extracted from MANUALS/MANUALS/SciVanta_Environmental_Robotics_Competition_Manual.docx
import { leagueDates } from "./_shared.mjs";

export default {
  slug: "scivanta",
  title: "SciVanta",
  shortDescription:
    "Environmental robotics and working model challenge for teams: investigate, design, build, test, demonstrate and defend a real solution.",
  domain: "Engineering Design & Environmental Responsibility",
  supportsIndividual: false,
  supportsTeam: true,
  status: "open",
  pathway: "project_showcase",
  image: null,
  manualFile: "SciVanta_Environmental_Robotics_Competition_Manual.docx",

  overview: `SciVanta is a team environmental STEM innovation competition. Students identify a real environmental-pollution problem, investigate it scientifically, design and build a safe robotics- or technology-based working model, test its performance, improve it using evidence, and demonstrate and defend their solution before judges.

The design pathway is: Investigate → Analyse → Design → Build → Integrate → Test → Interpret → Improve → Demonstrate → Defend.

SciVanta does not ask only "Can students build a robot?" It asks "Can students use science and technology to investigate an environmental problem, engineer a working response, test it with evidence and defend why it works?" It is explicitly not a decorative science exhibition — a functioning prototype is mandatory.

Design principles — Problem before technology: identify the environmental problem before choosing the technology. Function before decoration: a working prototype matters more than an elaborate display. Evidence before claims: show how you know the model works. Understanding before complexity: a simple system you fully understand may outperform a sophisticated system you cannot explain. Improvement before perfection: testing, failure and redesign are legitimate engineering evidence. Student ownership: adults may guide and supervise but must not build the project.

Assessment prioritises functionality, reasoning and evidence rather than cost or sophistication, so expensive kits create no advantage. Teams choose one of five challenge families: a Pollution-Monitoring Robot, a Smart Waste-Segregation Model, an Air-Quality Alert Prototype, a Water-Pollution Detection Model, or a Litter-Collection Concept.

Competency promise: Critical Thinking, Problem-Solving, Scientific Inquiry, Engineering Design, Digital & Computational Fluency, Data Literacy, Innovation, Environmental Responsibility, Communication, Collaboration and Metacognition. A SciVanta score records how a team performed in the event; final competency proficiency is determined separately from the depth and independence of each student's evidence.`,

  eligibility: [
    {
      category: "middle",
      minGrade: "6",
      maxGrade: "8",
      teamMinSize: 2,
      teamMaxSize: 4,
      notes:
        "Junior category. Team-based, 2–4 students. Judges expect simpler sensors and mechanisms, a guided project record, a smaller data demand and greater documentation scaffolding. Schools may register multiple teams subject to organizer capacity.",
    },
    {
      category: "secondary",
      minGrade: "9",
      maxGrade: "12",
      teamMinSize: 2,
      teamMaxSize: 4,
      notes:
        "Senior category — Grades 9–10 / O Level. Team-based, 2–4 students. Judges expect greater system integration, more independent design, stronger data analysis, a deeper technical defense and less scaffolding. Both categories address the same challenge families at age-appropriate complexity.",
    },
  ],

  stages: [
    {
      stageNumber: 1,
      title: "Build the Project & Project Record",
      format: "Team engineering project against one of five challenge families, documented in the official project record",
      duration: "Recommended 8-week preparation cycle",
      taskDescription: `Choose one challenge family and build a safe, functional prototype.

Challenge 1 — Pollution-Monitoring Robot: combine environmental science, sensing and robotics to monitor a pollution-related condition and communicate useful information. Minimum function: an observable monitoring or detection function — a decorative vehicle carrying an inactive sensor is insufficient. Evidence: repeated readings, response comparisons, movement to monitoring locations, warning displays, logged data, threshold-triggered response.

Challenge 2 — Smart Waste-Segregation Model: demonstrate intelligent or automated separation of waste into meaningful categories (paper/plastic, wet/dry, metal/non-metal, recyclable/non-recyclable, or another scientifically justified classification). Minimum function: a decision or detection process followed by visible segregation. Evidence: multiple test items, correct and incorrect sorting records, repeated trials, adjustments made after testing.

Challenge 3 — Air-Quality Alert Prototype: detect or represent a selected air-quality condition and generate a meaningful alert — a warning light, sound, digital display, indicator scale, automated ventilation response or notification concept. Minimum function: the detection input must produce an observable output. Evidence: sensor readings, alert trigger records, comparison between controlled conditions, response time, repeated trials.

Challenge 4 — Water-Pollution Detection Model: apply safe scientific measurement or sensing to selected water-quality indicators. Minimum function: detect, compare or communicate at least one defined indicator. Safety requirement: hazardous, biologically contaminated or sewage water must never be brought to the competition — safe simulations only. Evidence: controlled sample comparisons, repeated readings, calibration or reference values, observations and data tables, and stated limitations.

Challenge 5 — Litter-Collection Concept: design a robotic or automated mechanism for collecting or moving simulated litter from a defined environment. Minimum function: the model must physically perform at least one meaningful litter-collection operation. Evidence: number of successful collections, collection time, missed items and failure cases, repeated trials, design improvements.

Every team submits a concise project record with 20 sections: project title • team members and responsibilities • environmental problem • research question / problem statement • scientific background • proposed solution • initial design or sketch • main components and materials • construction record • programming or control logic where applicable • testing procedure • test results, data and observations • failed trials and problems • modifications and improvements • final model performance • environmental impact • limitations • future improvement • references • student reflection. The record should show the development pathway, not simply describe the final model.

Safety is mandatory and forms part of the assessment. Prohibited: hazardous chemicals, biological material, sewage or unsafe contaminated water, toxic gases, open flames, explosive materials, high-voltage electricity, exposed hazardous wiring, dangerous blades, uncontrolled moving mechanisms and unsafe pressurised systems. Use low-voltage student-appropriate electronics and guard moving parts. Judges or the Safety Officer may stop operation of any unsafe model — no functionality mark is worth compromising safety.`,
      progressionRule:
        "Teams register through the portal with school, team and project information plus originality, ownership and safety declarations, then receive a Team Registration ID, the confirmed category, the project-record template, safety guidance, the rubric and the event schedule.",
    },
    {
      stageNumber: 2,
      title: "Competition Day — Demonstration & Judges' Defense",
      format: "Safety screening, live working demonstration and oral defense at the team's assigned display area",
      duration: "Approximately 15 minutes of assessment per team, excluding setup",
      taskDescription: `The day runs as a fixed sequence: check-in and team ID verification → model setup in the assigned area → safety screening by the Safety Officer before any operation → project introduction (approximately 2 minutes) → working demonstration (approximately 5 minutes) → evidence explanation (approximately 3 minutes) → judges' defense (approximately 5 minutes) → independent scoring → moderation of discrepancies → result lock.

Expect judges to probe from the question bank: What exact environmental problem does your project address? What scientific principle is central to your solution? Why did you choose this mechanism rather than another? What does this sensor, controller or component do? What happens from input to processing to output? How many times did you test the model? What result gives you the strongest evidence that it works? What failed during development? What change produced the biggest improvement? Which part of the project did you personally contribute to? What do your readings actually show? What does your prototype not prove or detect? How environmentally responsible is the model itself? Where could this solution realistically be used? What would have to change to turn the prototype into a real product? If you started again, what would you redesign and why?

Judges record brief evidence supporting high, low or unusual scores. Where two judges produce materially different assessments, the Head Judge reviews the model evidence and score sheets before results are locked.`,
      progressionRule:
        "Each team receives a total score out of 100 plus a criterion performance profile covering science, engineering, functionality, technology, testing, innovation, communication and safety.",
    },
  ],

  rubrics: [
    {
      stageNumber: 2,
      isPublic: true,
      criteria: [
        { name: "Environmental Problem & Scientific Understanding", weight: 15 },
        { name: "Engineering Design & Solution Quality", weight: 15 },
        { name: "Working Model Functionality & Reliability", weight: 20 },
        { name: "Robotics, Automation & Technical Application", weight: 15 },
        { name: "Testing, Data & Evidence", weight: 15 },
        { name: "Problem-Solving, Innovation & Improvement", weight: 10 },
        { name: "Communication, Teamwork & Defense", weight: 5 },
        { name: "Safety, Sustainability & Responsible Construction", weight: 5 },
      ],
      tieBreakRule:
        "In order: 1) Working Model Functionality, 2) Testing, Data & Evidence, 3) Engineering Design, 4) Environmental & Scientific Understanding, 5) Problem-Solving and Innovation.",
    },
  ],

  resources: [
    {
      type: "article",
      title: "Student Quick Guide — build the most appropriate model, not the most complicated",
      content: `Problem — solve a genuine environmental problem. Research — understand the science before building. Imagine — consider more than one solution. Design — plan before assembling components. Build — technology should serve a purpose. Test — one successful trial is not enough. Record — keep evidence of results and failures. Improve — use evidence to redesign. Demonstrate — show the model actually working. Defend — explain why you made each major decision. Reflect — identify limitations and future improvements.

Do not build the most complicated model you can. Build the most appropriate model you can understand, test and defend.`,
    },
    {
      type: "article",
      title: "Eight-week preparation roadmap",
      content: `Week 1 — identify the environmental problem. Week 2 — research the science and existing solutions. Week 3 — generate alternatives and select a design. Week 4 — prepare the system plan and an early prototype. Week 5 — build and integrate the technology. Week 6 — conduct repeated testing. Week 7 — analyse failures and improve. Week 8 — complete the evidence record and rehearse the demonstration.

Schools may adapt the duration, but the sequence should stay inquiry- and evidence-driven. The preparation principle is: learn the design process, not a ready-made project.`,
    },
    {
      type: "practice_question",
      title: "The judges' question bank",
      content: `Environmental problem — what exact environmental problem does your project address? Scientific basis — what scientific principle is central to your solution? Engineering decision — why did you choose this mechanism rather than another? Technology — what does this sensor, controller or component do? System logic — what happens from input to processing to output? Testing — how many times did you test the model? Evidence — what result gives you the strongest evidence that it works? Failure — what failed during development? Improvement — what change produced the biggest improvement? Ownership — which part of the project did you personally contribute to? Data — what do your readings or observations actually show? Limitation — what does your prototype not prove or detect? Sustainability — how environmentally responsible is the model itself? Real-world application — where could this solution realistically be used? Scaling — what would have to change to turn the prototype into a real product? Reflection — if you started again, what would you redesign and why?

Rehearse these with every team member answering, not just the presenter — Communication, Teamwork & Defense rewards balanced participation and each student explaining their own contribution.`,
    },
    {
      type: "article",
      title: "The project record — 20 required sections",
      content: `1. Project title. 2. Team members and responsibilities. 3. Environmental problem. 4. Research question / problem statement. 5. Scientific background. 6. Proposed solution. 7. Initial design / sketch. 8. Main components and materials. 9. Construction record. 10. Programming / control logic where applicable. 11. Testing procedure. 12. Test results / data / observations. 13. Failed trials / problems. 14. Modifications and improvements. 15. Final model performance. 16. Environmental impact. 17. Limitations. 18. Future improvement. 19. References. 20. Student reflection.

Retain for portfolio and moderation: the initial design, the final design, the testing record, photographs of development, selected data, final model evidence, the judge score and the student reflection.`,
    },
    {
      type: "article",
      title: "Safety and engineering rules",
      content: `Projects may not use hazardous chemicals, biological material, sewage or unsafe contaminated water, toxic gases, open flames, explosive materials, high-voltage electricity, exposed hazardous wiring, dangerous blades, uncontrolled moving mechanisms or unsafe pressurised systems.

Low-voltage student-appropriate electronics should normally be used, and moving parts should be guarded where necessary. A Safety Officer screens every model before it is operated, and judges or the Safety Officer may stop operation of any unsafe model at any point.

No functionality mark is worth compromising student or spectator safety — and Safety, Sustainability & Responsible Construction is itself a scored criterion.`,
    },
  ],

  faqs: [
    {
      question: "How big is a team?",
      answer:
        "2–4 students. Teams are registered by the school coordinator with a named team leader, and each member should be able to explain their own contribution during the judges' defense.",
    },
    {
      question: "Does an expensive robotics kit help?",
      answer:
        "No. Assessment prioritises functionality, reasoning and evidence rather than cost or sophistication, and technology that is largely decorative or pre-built without understanding scores in the Emerging band. A simple system you fully understand may outperform a sophisticated one you cannot explain.",
    },
    {
      question: "Does the model actually have to work on the day?",
      answer:
        "Yes. Working Model Functionality & Reliability is the single largest criterion at 20 marks, and a model that is mainly conceptual, decorative or unable to demonstrate its claimed function scores 0–8 there. Each challenge also publishes a minimum functional requirement.",
    },
    {
      question: "Can our teacher help build it?",
      answer:
        "Teachers and mentors provide conceptual coaching and safety supervision but must not take ownership of construction. Student ownership is a published design principle, and judges ask each student which part of the project they personally contributed to.",
    },
    {
      question: "Can we bring real polluted water to test our model?",
      answer:
        "No. Hazardous, biologically contaminated or sewage water must not be brought to the competition — safe simulations must be used. Prohibited materials also include hazardous chemicals, toxic gases, open flames, explosives and high-voltage electricity.",
    },
    {
      question: "What if our prototype failed during development?",
      answer:
        "Document it. Testing, failure and redesign are legitimate engineering evidence — the project record has dedicated sections for failed trials and for modifications, and Problem-Solving, Innovation & Improvement (10 marks) specifically rewards systematic troubleshooting and evidence-based improvements.",
    },
    {
      question: "How much testing is enough?",
      answer:
        "More than one trial. The top band of Testing, Data & Evidence requires repeated testing, meaningful observations or data, comparison, analysis and evidence-based conclusions — claims about performance that are largely unsupported score in the Emerging band.",
    },
  ],

  events: leagueDates("2026-12-05", "Displayed and demonstrated at the finale", {
    workDeadline: true,
    activityNote: "Submit your project record in advance; demonstrate your model across both finale days, 5–6 December.",
  }),
};
