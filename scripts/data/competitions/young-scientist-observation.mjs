// Extracted from MANUALS/MANUALS/Young_Scientist_Observation_Manual.docx
import { leagueDates } from "./_shared.mjs";

export default {
  slug: "young-scientist-observation",
  title: "Young Scientist Observation",
  shortDescription: "Science and mathematics observation challenge for Grades 3–5: observe carefully, record evidence, discover patterns.",
  domain: "Scientific Inquiry & Observation",
  supportsIndividual: true,
  supportsTeam: false,
  status: "open",
  pathway: "applied_skills",
  image: "/competitions/young-scientist-observation.jpg",
  manualFile: "Young_Scientist_Observation_Manual.docx",

  overview: `Young Scientist Observation is a live challenge for Grades 3–5. Students rotate through five carefully designed stations where a scientific or mathematical phenomenon, object, process, pattern or data display is taking place. At each station, students independently record what they notice on an official response sheet.

The competition assesses the quality of observation rather than memorised content. A student does not need to know the formal scientific explanation to score well if the observations are accurate, detailed, evidence-based and clearly communicated. The core question: how carefully can a student observe something unfamiliar, identify what matters and record evidence without guessing?

What it is not: a textbook science quiz, a speed-based memory test, a laboratory practical requiring prior experiment practice, or a competition for advanced scientific vocabulary.

Design principles — Observation before explanation: students first record what is visible before proposing reasons. Evidence before vocabulary: accurate noticing matters more than technical terminology. Same competency, varied content: stations may vary, but the observation demands stay comparable. Age-appropriate challenge and safe curiosity throughout.

Competencies made observable: Scientific Inquiry & Observation, Critical Thinking (distinguishing evidence from assumption), Numeracy & Mathematical Reasoning (quantities, patterns, symmetry, sequence, measurement), Communication, Curiosity & Questioning, and Metacognitive Awareness — knowing the difference between what you saw and what you think explains it.`,

  eligibility: [
    {
      category: "primary",
      minGrade: "3",
      maxGrade: "5",
      notes:
        "Open to Grades 3–5. Participation is individual so every response sheet can be attributed to one student. The organizer may run separate Grade 3, 4 and 5 categories or one combined category with age-sensitive judging — announced before registration closes. No project upload is required for this live competition.",
    },
  ],

  stages: [
    {
      stageNumber: 1,
      title: "Five-Station Observation Rotation",
      format: "Five live observation stations with a written, drawn or labelled evidence record at each",
      duration: "6–8 minutes per station, approximately 30–40 minutes of active task time",
      taskDescription: `Candidates check in with their candidate code and are placed into balanced rotation groups, each starting at a different station. At each station the supervisor starts the demonstration or display according to the official script, the student observes from the assigned position, then completes the official station sheet independently before a standard stop signal and a quiet transition — with no discussion of content between stations.

The five stations cover a balanced spread of observation demands: 1) Physical Science — motion, magnetism, light, sound, force or material properties. 2) Life Science — plant structures, seeds, leaves, adaptation or a classification display. 3) Mathematics — pattern, symmetry, shape, sequence, measurement or estimation. 4) Change & Process — a safe visible change such as dissolving, mixing, floating or movement. 5) Data & Comparison — objects, quantities, simple graphs, tables or comparative displays.

Each station sheet prompts: What did you notice? What changed from beginning to end? What was different between the two objects or events? Did you notice a pattern — describe it. Write one detail that supports your answer. Write one question you would like to investigate further. Students may draw, label, measure or complete a simple table where appropriate.

Key distinction students must learn — Observation: "The red ball travelled farther." Inference: "I think it travelled farther because it was heavier."`,
      progressionRule:
        "Single-round competition. Each of the five stations contributes 20 marks for a 100-mark total, using the same four criteria at every station to build a consistent performance profile.",
    },
  ],

  rubrics: [
    {
      stageNumber: 1,
      isPublic: true,
      criteria: [
        { name: "Accuracy of Observation", weight: 30 },
        { name: "Detail & Evidence", weight: 25 },
        { name: "Pattern / Comparison Recognition", weight: 25 },
        { name: "Communication & Questioning", weight: 20 },
      ],
      tieBreakRule:
        "In order: 1) Accuracy of Observation, 2) Detail & Evidence, 3) Pattern / Comparison Recognition, 4) Communication & Questioning. Scored per station (6/5/5/4 marks) and totalled across all five.",
    },
  ],

  resources: [
    {
      type: "article",
      title: "The preparation method — LOOK CAREFULLY → NOTICE CHANGE → COMPARE → RECORD EVIDENCE → ASK",
      content: `Prepare by practising the observation method, not by memorising experiments — live station content stays unseen. Observe everyday objects and write three precise details. Compare two leaves, containers, shapes or graphs. Practise describing a change without first explaining why it happened. Use rulers, simple scales and counting where age appropriate. Practise asking a question that could actually be investigated, rather than a general curiosity question.`,
    },
    {
      type: "sample_task",
      title: "Practice station ideas",
      content: `Magnets interacting with selected materials • transparent, translucent and opaque materials under light • objects rolling down ramps • a safe floating and sinking display • a simple balance comparison • symmetry and geometric pattern sequences • leaf or seed structure comparison • gear movement or a simple machine • measurement and estimation objects • a simple graph or visual data comparison.

Set up any of these at home or in class, then complete a full observation record against the official prompts before discussing the answer with anyone.`,
    },
    {
      type: "article",
      title: "Student Quick Guide — at every station",
      content: `1. Look before writing. 2. Record what you actually see. 3. Compare carefully. 4. Use evidence, numbers or labels where possible. 5. If you explain why, make clear that it is your idea or inference. 6. Ask one useful question. 7. Stop when time is called and move quietly.

League principle: good scientists do not begin by knowing every answer. They begin by noticing carefully.`,
    },
    {
      type: "article",
      title: "What judges reward at each station",
      content: `Accuracy of Observation (6 marks) — records several important features or changes accurately, with little or no unsupported guessing. Detail & Evidence (5) — uses precise visible details, labels, measurements or other evidence. Pattern / Comparison Recognition (5) — identifies a meaningful pattern, relationship, sequence or comparison and expresses it clearly. Communication & Questioning (4) — records ideas clearly and asks a thoughtful question arising directly from the evidence.`,
    },
  ],

  faqs: [
    {
      question: "Do I need to know the science behind each station to score well?",
      answer:
        "No. The competition assesses the quality of your observation, not memorised content. You can score strongly without knowing the formal explanation as long as your observations are accurate, detailed, evidence-based and clearly communicated.",
    },
    {
      question: "Can I touch the equipment at a station?",
      answer: "Only if the station card explicitly permits it. Otherwise observe from your assigned position. Unsafe behaviour may result in removal from a station or the event.",
    },
    {
      question: "How long do I get at each station?",
      answer:
        "6–8 minutes per station is recommended, with a short controlled transition between them — roughly 30–40 minutes of active task time in total. All groups receive the same timing and equivalent viewing conditions.",
    },
    {
      question: "What's the difference between an observation and an inference?",
      answer:
        "An observation is what you actually saw — \"the red ball travelled farther.\" An inference is your explanation — \"I think it travelled farther because it was heavier.\" You can include both, but make clear which is which; marks are lost for unsupported guessing presented as observation.",
    },
    {
      question: "Can I bring a calculator or phone?",
      answer: "No mobile phones, calculators or personal reference materials are allowed unless specifically published for a particular station.",
    },
    {
      question: "How is this different from Watch – Think – Explain?",
      answer:
        "This competition uses five physical or live stations and emphasises noticing — \"What do you notice?\" — producing multiple short observation records. Watch – Think – Explain uses one common video stimulus and emphasises interpreting and explaining — \"What happened and why?\" — producing a single integrated response.",
    },
  ],

  events: leagueDates("2026-10-29", "Competition day — five-station observation rotation", {
    activityNote: "Week one of the League activity period.",
  }),
};
