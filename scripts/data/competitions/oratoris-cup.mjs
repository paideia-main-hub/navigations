// Extracted from MANUALS/MANUALS/Oratoris_Orator_Cup_School_Pitch_Implementation_Manual_v1_0.docx
import { leagueDates } from "./_shared.mjs";

export default {
  slug: "oratoris-cup",
  title: "Oratoris — Orator Cup",
  shortDescription:
    "Two-stage speaking competition: a prepared response from a fresh scenario, then adaptive speaking through a live audience shift.",
  domain: "Communication, Languages & Public Speaking",
  supportsIndividual: true,
  supportsTeam: false,
  status: "open",
  pathway: "live_response",
  image: "/competitions/oratoris-cup.jpg",
  manualVersion: "v1.0",
  manualFile: "Oratoris_Orator_Cup_School_Pitch_Implementation_Manual_v1_0.docx",

  overview: `Orator Cup is a live speaking competition designed to measure what traditional prepared-speech events often miss: whether a student can build a clear message from a fresh brief and then reshape that message for a different audience.

Students are not rewarded for memorising a pre-written speech. They are assessed on how quickly they can organise ideas from an unfamiliar prompt, speak with purpose, read an audience, and deliberately adapt tone, vocabulary, examples, emphasis and delivery when the audience changes.

Stage 1 — Prepared Scenario Speech: 20 minutes of preparation from a fresh brief, then an approximately 4-minute speech (45 marks). Stage 2 — Adaptive Audience Speaking: 5 minutes of preparation with an Initial Audience Card, then an approximately 4-minute speech during which an Audience Shift Card is revealed at about the halfway point and the student must adapt without restarting (55 marks).

Stage 2 carries more weight because audience adaptation is the distinctive feature of Orator Cup. The core principle: same message purpose, different communication choices.

What changes when the audience changes — vocabulary (technical vs simple, formal vs conversational), tone (reassuring, persuasive, urgent, respectful, inspiring, explanatory), evidence and examples (statistics for experts, relatable examples for younger students, implementation concerns for leaders), level of detail, delivery (pace, pauses, emphasis, energy, eye contact) and the call-to-action.

Competency promise — C06 Verbal Communication (organises ideas, speaks coherently, uses suitable language, controls voice, communicates a clear purpose) and C08 Public Speaking & Audience Adaptation (reads audience characteristics, changes tone, formality and examples, maintains engagement, adjusts message without losing purpose).

In one sentence: Orator Cup shows whether a student can think, structure, speak and adapt — not merely recite.`,

  eligibility: [
    {
      category: "middle",
      minGrade: "6",
      maxGrade: "8",
      notes:
        "Junior category (approximately ages 11–14). Individual participation so the evidence is attributable to that student. Design expectation: accessible scenarios, familiar school and community contexts, moderate vocabulary demands. Prompts never require specialist subject knowledge beyond what the brief supplies. Reasonable access arrangements reduce irrelevant barriers without changing the competency assessed.",
    },
    {
      category: "secondary",
      minGrade: "9",
      maxGrade: "12",
      notes:
        "Senior category (approximately ages 14–18). Individual participation. Design expectation: more complex stakeholder tensions, more abstract issues, stronger evidence and adaptation expectations. The same stage architecture is used across categories — complexity changes, not the competency construct. Schools may nominate multiple students subject to organizer capacity.",
    },
  ],

  stages: [
    {
      stageNumber: 1,
      title: "Prepared Scenario Speech",
      format: "Fresh scenario brief plus speaking prompt, one-page outline sheet, then a live speech",
      duration: "20 minutes preparation + approximately 4 minutes delivery — 45 marks",
      taskDescription: `Purpose: measure whether a student can turn an unfamiliar scenario and prompt into a purposeful, logically structured speech within a short preparation window. The emphasis is on independent organisation, relevance, clarity and live verbal delivery — not memorisation.

How it runs: the invigilator seats you at an individual preparation desk. At the start signal you receive the Scenario Brief, the Speaking Prompt and the official Speech Outline Sheet. Exactly 20 minutes of preparation begins — no phone, internet, outside notes or coaching is permitted unless the published rules explicitly allow a controlled source card. You may write only on the official outline sheet and supplied scratch space; full scripted speeches carry no scoring advantage. At 20 minutes preparation stops and you carry the outline sheet to the speaking room. The timekeeper announces your candidate code and starts timing when your substantive speech begins. After the speech, the outline sheet is collected and attached to your score record.

Use a simple speech architecture: Opening → Position/Purpose → 2–3 Key Points → Example/Evidence → Closing / Call-to-Action. Write keywords and short phrases on the outline sheet, not a full script, and practise speaking from the outline while maintaining eye contact. Use examples that directly support the prompt rather than adding unrelated general knowledge, control pace and pauses (clarity beats speed), and finish within the published time without rushing the final sentence.

Scenario formats to practise: A) persuasive school issue — recommend or oppose a proposed change. B) informative leadership brief — explain a problem and propose a practical response. C) values or civic prompt — speak on a community issue from an assigned role. D) future-facing prompt — respond to a new technology, environmental or educational situation.

Stage 1 marks: Outline & Organization (10), Content Relevance & Reasoning (10), Verbal Clarity & Language (10), Vocal & Physical Delivery (10), Purpose & Closing Impact (5).

A warning signal may be given 30 seconds before the end. Judges do not reward excessive length, and the recommended penalty is 1 mark for each completed 30 seconds beyond the published maximum.`,
      progressionRule:
        "Both stages are completed by every candidate; Stage 1 contributes 45 of the 100 marks. The outline sheet, judge rubric, candidate code, prompt set and timing record are retained for moderation and portfolio evidence.",
    },
    {
      stageNumber: 2,
      title: "Adaptive Audience Speaking",
      format: "Adaptive Scenario Card plus Initial Audience Card, 5-minute planning sheet, then a live speech with a mid-speech audience shift",
      duration: "5 minutes preparation + approximately 4 minutes delivery — 55 marks",
      taskDescription: `Purpose: measure whether a student can keep the core communication purpose intact while changing how the message is delivered for different audiences.

How it runs: you receive the Adaptive Scenario Card and the Initial Audience Card at the start of the 5-minute preparation period and complete the official quick-planning sheet. You enter the speaking room with the planning sheet, and the initial audience profile remains known. You begin the approximately 4-minute speech for Audience A. At about 2 minutes the stage manager silently reveals Audience Shift Card B — the timer continues and you do not restart. You adapt the remaining message to Audience B while maintaining the core purpose and coherence.

What Stage 2 is not: you are not expected to change the facts because the audience changed. You change the communication strategy — tone, vocabulary, explanation, examples, emphasis, pace and call-to-action.

The 6-part audience check: 1. WHO — who is this audience? (formality, vocabulary, examples). 2. KNOW — what do they already know? (amount of explanation and technical detail). 3. CARE — what matters to them? (benefits, risks, values, priorities). 4. FEEL — what is their likely attitude or concern? (tone: reassure, challenge, inspire, explain). 5. PURPOSE — what do I want them to think or do? (call-to-action and emphasis). 6. DELIVERY — how should I sound? (pace, energy, pauses, eye contact, wording).

When the shift appears, do not stop and announce that you are changing — transition naturally, using a bridging phrase if useful ("For those of you responsible for implementing this…" or "If I were explaining this to younger students…"). Adapt to the profile provided, never to stereotypes about real people.

Stage 2 marks: Initial Audience Analysis (10), Audience Shift Adaptation (15), Message Continuity & Coherence (10), Verbal & Vocal Control (10), Engagement & Call-to-Action (10).

A top-band adaptation makes clear, purposeful changes in tone, language, examples, detail and call-to-action while preserving the message; the lowest band shows a speech that could be delivered unchanged to almost any audience.`,
      progressionRule:
        "Stage 2 is the first tie-break criterion. The planning sheet, audience card set ID, judge rubric and timing record are retained for moderation and portfolio evidence.",
    },
  ],

  rubrics: [
    {
      stageNumber: 1,
      isPublic: true,
      criteria: [
        { name: "Outline & Organization", weight: 10 },
        { name: "Content Relevance & Reasoning", weight: 10 },
        { name: "Verbal Clarity & Language", weight: 10 },
        { name: "Vocal & Physical Delivery", weight: 10 },
        { name: "Purpose & Closing Impact", weight: 5 },
      ],
      tieBreakRule:
        "Stage 1 total is 45 marks (10 for the submitted speech outline, 35 for the prepared speech delivery). Overall ties are broken by Stage 2 first — see the Stage 2 rubric.",
    },
    {
      stageNumber: 2,
      isPublic: true,
      criteria: [
        { name: "Initial Audience Analysis", weight: 10 },
        { name: "Audience Shift Adaptation", weight: 15 },
        { name: "Message Continuity & Coherence", weight: 10 },
        { name: "Verbal & Vocal Control", weight: 10 },
        { name: "Engagement & Call-to-Action", weight: 10 },
      ],
      tieBreakRule:
        "In order: 1) higher Stage 2 Adaptive Speech score, 2) higher Audience Adaptation criterion score, 3) higher Message Clarity / Structure score across both stages, 4) Chief Judge comparison of evidence using the published rubric.",
    },
  ],

  resources: [
    {
      type: "sample_task",
      title: "Sample Stage 1 scenario — school phone policy",
      content: `Scenario: your school is reviewing smartphone use during the school day. Some teachers believe phones should be completely restricted. Some students argue that phones can support learning and safety when used responsibly.

Prompt: you are speaking at a student-school consultation. Recommend a balanced smartphone policy and persuade the school community that your approach is practical.

Official outline sheet to complete in the 20 minutes: my purpose / position • opening hook or first-line idea • Key Point 1 • example or evidence for Point 1 • Key Point 2 • example or evidence for Point 2 • Key Point 3 (optional) • closing / call-to-action.`,
    },
    {
      type: "practice_question",
      title: "Additional Stage 1 practice prompts",
      content: `Your school has PKR 200,000 for one student-development project. Recommend where it should be spent and justify your choice.

A community library is losing young visitors. Speak to a school council about how students could help make it relevant again.

Your school wants to reduce food waste. Explain the problem and persuade students to support a practical three-step plan.

Artificial intelligence tools are becoming common in education. Speak about one responsible way students should use them in learning.

Practise within the real 20-minute window and produce a keyword-only outline — not a script.`,
    },
    {
      type: "sample_task",
      title: "Sample Stage 2 adaptive scenario with a full audience shift",
      content: `Scenario: the school is considering a balanced smartphone policy that allows limited learning and safety use but restricts unnecessary classroom distraction. Your task is to explain and build support for the proposed policy.

Initial Audience Card A — Audience: Grade 6 students. Knowledge: basic understanding. Main concern: fairness, freedom and practical rules. Attitude: curious but resistant. Your communication priority: simple language, relatable examples and a direct explanation of what changes for them.

Audience Shift Card B (revealed during the speech) — New audience: Parent Council. Knowledge: general understanding. Main concern: safety, distraction and accountability. Attitude: cautious. Expected adaptation: increase formality, explain safeguards, monitoring and practical implementation, and use less peer-focused language.

Your 5-minute planning sheet: the core message that must remain stable • what Audience A knows and cares about • tone for Audience A • example and language choice for Audience A • my intended call-to-action • if the audience changes, what can I change quickly (vocabulary / tone / explanation / example / emphasis / call-to-action).`,
    },
    {
      type: "sample_task",
      title: "More audience-shift pairings and what strong adaptation looks like",
      content: `Community recycling programme — persuade people to separate recyclable waste correctly. Primary school students → local business owners: move from simple visual examples and an enthusiastic tone to practical cost, collection process and operational responsibility. Community volunteers → municipal officials: move from motivation and community pride to measurable outcomes, feasibility and accountability. Parents → teenage students: move from household responsibility and safety to peer influence, convenience and student-led action.

School reading initiative — explain why the initiative matters and encourage participation. Younger students → teachers: from excitement and story examples to classroom support and practical integration. Teachers → school leadership: from instructional strategies to measurable outcomes, time and resource needs, and school-wide implementation. School leadership → students: from policy and impact language to relatable benefits, choice and motivation.`,
    },
    {
      type: "article",
      title: "The audience card bank — how each audience needs to be addressed",
      content: `Younger students — need simple, concrete, engaging communication: short sentences, familiar examples, energetic tone. Peer students — need relevance and authenticity: conversational language, realistic examples, direct benefits. Parents — need trust, safety and practicality: respectful tone, safeguards, impact on children, clear implementation. Teachers — need learning impact and feasibility: educational reasoning, classroom realities, workable detail. School leadership — need evidence, implementation and risk: a concise formal tone, outcomes, resources, accountability. Community members — need local relevance and inclusion: accessible context, shared benefit, practical action. Technical or expert panel — need accuracy and evidence: precise terminology, data, stated limitations, less basic explanation. Skeptical audience — need credibility and concern handling: acknowledge the concern, avoid exaggeration, use evidence and a balanced tone.

Audience cards describe communication-relevant characteristics, never stereotypes or protected identities.`,
    },
    {
      type: "article",
      title: "Six-week preparation roadmap and the practice routine",
      content: `Week 1 — speech structure: 60–90 second mini-speeches using opening → 2 points → closing. Week 2 — outline under time pressure: 10–15 minute planning from fresh school and community prompts, keyword-only outlines. Week 3 — delivery control: record short speeches and review pace, pauses, eye contact, filler words and closing. Week 4 — audience awareness: deliver the same message to two different audience profiles and compare the choices. Week 5 — audience-shift drills: begin for Audience A, have a teacher reveal Audience B halfway through, and continue without restarting. Week 6 — full simulation: 20-minute Stage 1 plus Stage 2's 5-minute prep and live shift, scored with the official rubrics.

Practice routine: 1. Read the scenario twice. 2. Write your purpose in one sentence. 3. Identify the audience and what matters to them. 4. Select only 2–3 main points. 5. Choose one useful example for each main point. 6. Decide your tone and first sentence. 7. Speak from keywords, not full sentences. 8. Score yourself with the stage rubric and improve one criterion at a time.

Preparation rule: practise the method, not the live prompt. Rubrics are published in advance; live prompts and audience-shift combinations stay confidential.`,
    },
    {
      type: "article",
      title: "Student Quick Guide",
      content: `Stage 1 — you receive a fresh scenario and prompt, get 20 minutes to create an outline, then deliver an approximately 4-minute speech. Best strategy: choose one clear purpose, 2–3 strong points, supporting examples, speak from keywords, and finish clearly.

Stage 2 — you receive a scenario and Audience A, get 5 minutes to prepare, and during your speech Audience B is revealed and you must adapt. Best strategy: keep the core message and change tone, vocabulary, explanation, examples, emphasis and call-to-action for the new audience.

Remember: do not ask "What speech should I memorise?" Ask "How should I communicate this message to this audience?"`,
    },
  ],

  faqs: [
    {
      question: "Can I prepare a speech in advance?",
      answer:
        "No. Both stages use fresh material issued on the day under timed preparation — 20 minutes for Stage 1 and 5 minutes for Stage 2. Rubrics are published beforehand, but live prompts and audience-shift combinations stay confidential, and memorised speeches carry no advantage.",
    },
    {
      question: "What is the audience shift, exactly?",
      answer:
        "About two minutes into your Stage 2 speech, the stage manager silently reveals a new audience profile. The timer keeps running and you do not restart — you adapt the rest of the message to the new audience while keeping the same core purpose and coherence.",
    },
    {
      question: "Do I change my facts when the audience changes?",
      answer:
        "No. You change the communication strategy, not the facts: tone, vocabulary, explanation, examples, emphasis, pace and call-to-action. Judges specifically assess whether the message survives the shift intact.",
    },
    {
      question: "Can I write a full script during preparation?",
      answer:
        "You may write only on the official outline or planning sheet, and a full scripted speech carries no scoring advantage. Delivery that is heavily dependent on notes falls into the lowest band of the Vocal & Physical Delivery criterion.",
    },
    {
      question: "How long should each speech be?",
      answer:
        "Approximately 4 minutes per stage. A warning signal may be given 30 seconds before the end, judges do not reward excessive length, and the recommended penalty is 1 mark for each completed 30 seconds beyond the published maximum.",
    },
    {
      question: "Which stage matters more?",
      answer:
        "Stage 2, deliberately — it carries 55 of the 100 marks because audience adaptation is the distinctive feature of Orator Cup, and it is also the first tie-break criterion.",
    },
    {
      question: "Will my accent affect my score?",
      answer:
        "No. Judging focuses on effective communication in the approved competition language, not imitation of a particular accent. What is assessed is clarity, structure, audience fit, adaptation and purpose.",
    },
    {
      question: "Do I need specialist knowledge of the topic?",
      answer:
        "No. Scenario briefs must be understandable without specialist background knowledge, and every set within a category is designed to require comparable complexity, preparation load and speaking demand.",
    },
  ],

  events: leagueDates("2026-10-30", "Competition day — Stage 1 prepared speech and Stage 2 adaptive speaking", {
    activityNote: "Week one of the League activity period. Both stages are completed on the same day.",
  }),
};
