// Extracted from MANUALS/MANUALS/Watch_Think_Explain_Manual.docx
import { leagueDates } from "./_shared.mjs";

export default {
  slug: "watch-think-explain",
  title: "Watch – Think – Explain",
  shortDescription: "Scientific video observation and explanation challenge for Grades 3–5: watch carefully, think from evidence, explain clearly.",
  domain: "Observation & Scientific Inquiry",
  supportsIndividual: true,
  supportsTeam: false,
  status: "open",
  manualFile: "Watch_Think_Explain_Manual.docx",

  overview: `Watch – Think – Explain is a live challenge in which students in Grades 3–5 watch a short, unseen video showing a scientific, mathematical or real-world phenomenon. After viewing, students independently explain what happened, what changed, what evidence they noticed and what might explain the event.

The competition assesses the transition from observation to reasoning. It rewards accurate watching, sequence understanding, evidence use and age-appropriate explanation rather than memorised terminology. The core question is simple: can the student move from "I saw it" to "I can explain what happened and support my thinking with evidence"?

Competency areas made observable: Observation & Scientific Inquiry (identifies relevant events, changes and visible evidence); Critical Thinking (interprets what evidence may mean and avoids unsupported claims); Cause-and-Effect Reasoning; Information Processing (selecting important details from a dynamic visual event); Communication; Prediction; and Metacognition (recognising uncertainty and distinguishing observation from explanation).

How this differs from Young Scientist Observation: that competition uses five physical stations and emphasises noticing — "What do you notice?" This one uses a single dynamic video stimulus and emphasises interpreting and explaining — "What happened and why?"

Assessment rule: understanding comes before terminology. A clear everyday-language explanation can score strongly when it is accurate and evidence-based.`,

  eligibility: [
    {
      category: "primary",
      minGrade: "3",
      maxGrade: "5",
      notes:
        "Open to Grades 3–5, individual participation only. The organizer may run separate grade categories or a combined category with age-sensitive performance expectations, announced before registration closes. This is a live competition — no video is uploaded by candidates.",
    },
  ],

  stages: [
    {
      stageNumber: 1,
      title: "Live Viewing & Structured Response",
      format: "Unseen short video under controlled viewing, followed by an independent written response sheet",
      duration: "Video normally 30 seconds to 2 minutes, shown twice, plus the announced response period",
      taskDescription: `Candidates are seated so all have a clear view of the same official display. A standard two-viewing mechanism applies: the first viewing is watched without writing, to understand the overall event; after a short pause with no discussion, the second viewing allows brief notes. Students then complete the official response sheet independently. For Grade 3 the organizer may announce a third viewing, applied consistently to the whole category.

The response sheet covers seven sections: A. Observation — what happened? B. Sequence — write or number the important events in order. C. Change — what changed from the beginning to the end? D. Evidence — what did you see that supports your answer? E. Explanation — why do you think this happened? F. Prediction — what might happen next if the process continued? G. Question — write one scientific or mathematical question about the video.

Typical stimulus contexts include objects rolling down different ramps, a shadow changing as light position changes, floating and sinking sequences, a plant or material responding over time, safe mixing or dissolving, a balance or lever demonstration, simple machine movement, a geometric transformation, a measurement comparison, or an everyday process with clear cause-and-effect cues.`,
      progressionRule:
        "Single-round competition scored out of 100. Results may include the total score plus a criterion profile showing observation, explanation, evidence, prediction and communication strengths.",
    },
  ],

  rubrics: [
    {
      stageNumber: 1,
      isPublic: true,
      criteria: [
        { name: "Accuracy of Observation", weight: 20 },
        { name: "Sequence & Event Understanding", weight: 15 },
        { name: "Scientific / Mathematical Explanation", weight: 25 },
        { name: "Evidence Use", weight: 15 },
        { name: "Prediction & Reasoning", weight: 10 },
        { name: "Communication", weight: 10 },
        { name: "Questioning", weight: 5 },
      ],
      tieBreakRule:
        "In order: 1) Scientific / Mathematical Explanation, 2) Accuracy of Observation, 3) Evidence Use, 4) Sequence & Event Understanding, 5) Prediction & Reasoning.",
    },
  ],

  resources: [
    {
      type: "article",
      title: "The preparation method — WATCH → NOTICE → SEQUENCE → EXPLAIN → SUPPORT → PREDICT → ASK",
      content: `Practise the method rather than memorising sample videos — live content stays confidential. Watch a short everyday event and retell only what actually happened. Practise putting events in the correct order. Ask yourself: what evidence supports my explanation? Practise saying "I observed…" and "I think…" separately. Make one prediction based on the event rather than imagination alone.`,
    },
    {
      type: "article",
      title: "Student Quick Guide",
      content: `WATCH — look at the whole event. NOTICE — find the important changes and details. SEQUENCE — put events in order. EXPLAIN — say why you think it happened. EVIDENCE — use something you actually saw. PREDICT — say what might happen next and why. QUESTION — ask something worth investigating.

League principle: a strong explanation grows from evidence, not from guessing.`,
    },
    {
      type: "sample_task",
      title: "Practice stimulus ideas",
      content: `Practise with everyday events that have clear cause-and-effect cues: objects rolling down ramps of different steepness; a shadow changing as a light source moves; items floating and sinking; a plant or material changing over time; safe mixing or dissolving; a balance or lever; a simple machine in motion; a geometric pattern developing; two measurements being compared.

For each one, complete all seven response sections before checking anything — observation, sequence, change, evidence, explanation, prediction and your own question.`,
    },
    {
      type: "article",
      title: "What judges reward",
      content: `Accuracy of Observation (20) — captures the important events and relevant details accurately. Sequence & Event Understanding (15) — organises events in a clear, accurate order and recognises key changes. Scientific/Mathematical Explanation (25) — a plausible, age-appropriate explanation connected clearly to the observed event, recognising limits where necessary. Evidence Use (15) — uses precise details from the video to support the explanation. Prediction & Reasoning (10) — a logical prediction clearly connected to the observed process. Communication (10) — organised, clear and easy to follow. Questioning (5) — a focused, investigable question arising directly from the video.`,
    },
  ],

  faqs: [
    {
      question: "How many times do we get to watch the video?",
      answer:
        "Twice as standard. The first viewing is watched without writing so you can understand the whole event; after a short pause with no discussion, you watch again and may take brief notes. For Grade 3 the organizer may announce a third viewing, applied to the whole category.",
    },
    {
      question: "Do I need to use scientific vocabulary to score well?",
      answer:
        "No. Understanding comes before terminology — a clear everyday-language explanation can score strongly when it is accurate and evidence-based. What matters is connecting your explanation to what you actually saw.",
    },
    {
      question: "What can I bring into the room?",
      answer:
        "Only the response materials provided. Phones, smartwatches, internet access and personal notes are not permitted, and no discussion, coaching or explanation is allowed between viewings or during the response time.",
    },
    {
      question: "How is this different from Young Scientist Observation?",
      answer:
        "Young Scientist Observation uses five physical or live stations and focuses on noticing — \"What do you notice?\" Watch – Think – Explain uses one common video stimulus and focuses on interpreting and explaining — \"What happened and why?\" One produces multiple short observation records; this produces a single integrated response.",
    },
    {
      question: "What happens if the video fails partway through?",
      answer:
        "The Head Invigilator applies the same documented restart or replay rule to the whole affected group, so every candidate in a category views the same stimulus under equivalent conditions.",
    },
    {
      question: "How are ties resolved?",
      answer:
        "By criterion, in this order: Scientific/Mathematical Explanation, then Accuracy of Observation, then Evidence Use, then Sequence & Event Understanding, then Prediction & Reasoning.",
    },
  ],

  events: leagueDates("2026-10-29", "Competition day — live viewing and response", {
    activityNote: "Week one of the League activity period.",
  }),
};
