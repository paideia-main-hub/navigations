// Extracted from MANUALS/MANUALS/EthosQuest_Values_Tree_Ethical_Decision_Challenge_Manual_v1_0.docx
import { leagueDates } from "./_shared.mjs";

export default {
  slug: "ethosquest",
  title: "EthosQuest",
  shortDescription:
    "Values Tree and ethical decision challenge: know your values, recognise conflict, consider consequences, decide, reflect, defend.",
  domain: "Character, Personal Growth & Global Citizenship",
  supportsIndividual: true,
  supportsTeam: false,
  status: "open",
  pathway: "live_response",
  image: "/competitions/ethosquest.jpg",
  manualVersion: "v1.0",
  manualFile: "EthosQuest_Values_Tree_Ethical_Decision_Challenge_Manual_v1_0.docx",

  overview: `EthosQuest is a one-day live individual competition built around a personal Values Tree and an unseen ethical dilemma.

It does not test whether a student can name "good values." It tests whether the student can identify values that genuinely guide them, translate those values into observable choices, recognise when values conflict, evaluate consequences, make a responsible decision, and reconsider that decision when conditions change.

The flow is: Values Tree → Ethical Dilemma → Value Conflict & Consequence Analysis → Decision & Reflection → Brief Oral Defense. A 65-minute controlled written session produces the evidence pack, followed by a 5–7 minute oral defense before a verification panel.

Core integrity rule: EthosQuest must never require a student to disclose private family, religious, medical, mental-health, political, financial or other sensitive personal information. Values may be explained through general, school-safe examples. Students are judged on reasoning and ownership, not on which values they choose — no mark is awarded for selecting a particular value.

Competency alignment — C41 Self-Awareness and C44 Ethical & Responsible Decision Making are the core competencies; C43 Resilience & Adaptability is recorded only where the candidate genuinely responds constructively to a changed condition and revises reasoning where justified.

The Values Tree is a thinking map, not an art contest — artistic drawing skill, handwriting style and decoration earn no marks beyond basic legibility. The ethical dilemma is the main application test: the student must use the tree to reason through a difficult choice, not merely describe values.

A Values Bank is published in advance as an official preparation resource, and the same bank is supplied on event day. The competition is not a memory test. Students may select values from the bank and may add up to two additional values if they write a short neutral definition for each.`,

  eligibility: [
    {
      category: "middle",
      minGrade: "6",
      maxGrade: "8",
      notes:
        "Junior category, individual participation, ranked separately. Same Values Tree structure with more guided prompts; the dilemma is set in a familiar school or youth context. 65-minute written session plus a 5–7 minute oral defense. Registration through an approved school coordinator, or by organizer-approved individual registration with parent/guardian consent.",
    },
    {
      category: "secondary",
      minGrade: "9",
      maxGrade: "12",
      notes:
        "Senior category — Grades 9 to O Level / Matric equivalent — individual participation, ranked separately. Same structure with greater independence and depth; the dilemma involves more complex competing interests and consequences. 65-minute written session plus a 5–7 minute oral defense.",
    },
  ],

  stages: [
    {
      stageNumber: 1,
      title: "Build the Values Tree",
      format: "Controlled written session on the official blank tree template, with the printed Values Bank supplied",
      duration: "25 minutes — 25 marks",
      taskDescription: `ROOTS — record 3–5 broad influences or principles that have shaped how you think about right action (no names or private detail required). TRUNK — select exactly THREE core values that most strongly guide your choices. BRANCHES — for each core value, write at least TWO observable behaviours or actions that would show the value in practice (6 total). FRUITS — write 3–5 desired outcomes or impacts that should result when the values are lived consistently. SELF-AWARENESS BOX — one personal strength that helps you live by these values, and one growth area that can make consistency difficult.

The tree must show logic from influence → value → behaviour → impact.

Quality rules: the tree is assessed for meaning, not visual beauty. Each branch must describe a behaviour that could actually be observed, not a slogan. A fruit should be an outcome, not another value word copied from the trunk. You must be able to explain the connection between root, trunk, branch and fruit. Core values may conflict with each other in the dilemma — that is intentional and forms the basis of ethical reasoning. Avoid absolute claims such as "I always do the right thing"; reflection should allow for growth and difficulty.

Good roots look like "School experiences taught me to take responsibility", "Seeing fair treatment modelled by adults", "Learning from mistakes in teamwork", "Community service experiences" — never names of family members or teachers, religious disclosure, private conflict details, health history or political identity.`,
      progressionRule:
        "The tree must be your own work created during the controlled session — no pre-completed tree or prepared dilemma answer may be copied in, and only organizer-issued materials may be used. The dilemma card is released at the configured time.",
    },
    {
      stageNumber: 2,
      title: "Decode the Ethical Dilemma",
      format: "Stakeholder, issue and competing-values map from a sealed, category-coded dilemma card",
      duration: "15 minutes — 15 marks",
      taskDescription: `Read the complete dilemma before deciding. Identify the central ethical issue. Identify the main stakeholders directly affected. Identify at least TWO values or responsibilities that may compete. Separate facts given in the dilemma from assumptions you should avoid making.

Junior candidates may receive structured prompts; Senior candidates are expected to explain the conflict more independently.

The assigned dilemma must be answered as written — you may not replace it with a preferred scenario.`,
      progressionRule: "The decode feeds directly into Stage 3; the same dilemma runs through Stages 2–4 in one continuous written session.",
    },
    {
      stageNumber: 3,
      title: "Value Conflict, Consequences & Decision",
      format: "Options and consequences analysis leading to one chosen action",
      duration: "15 minutes — 35 marks",
      taskDescription: `Generate at least TWO realistic options before selecting a decision. For each option, consider short-term and longer-term consequences for more than one stakeholder. Use your Values Tree — explain which core value or values support or challenge each option. Choose one action and justify why it is the most responsible option, not merely the easiest option. State what responsibility you would accept if the decision has an uncomfortable consequence.

A strong answer may acknowledge that no option is perfect.

Use the consequence matrix structure: for each option, who benefits, who may be harmed, the short-term effect, the long-term effect, and which value is supported or challenged.`,
      progressionRule:
        "This is the highest-weighted written stage. Ethical Reasoning (30 marks) and Consistency Between Values & Decision (20 marks) are both largely evidenced here.",
    },
    {
      stageNumber: 4,
      title: "Reflection & Adaptation",
      format: "Written reflection plus a changed-condition analysis",
      duration: "10 minutes — 15 marks",
      taskDescription: `Identify the hardest value conflict in the dilemma. Explain what you learned about your own decision-making. State one condition or piece of new information that could reasonably change your decision. Explain how the decision could be improved or adapted without abandoning integrity and accountability.

Supporting C43 Resilience & Adaptability evidence is recorded only when adaptation is actually demonstrated — it is not awarded for simply mentioning flexibility.`,
      progressionRule: "Written evidence is collected and coded, then the candidate reports to an assigned oral-defense panel.",
    },
    {
      stageNumber: 5,
      title: "Oral Defense",
      format: "Individual defense before a verification panel, with judge questions and one changed-condition question",
      duration: "5–7 minutes per candidate — 10 marks",
      taskDescription: `Briefly explain your core values, your decision and the strongest consequence you considered. Judges then ask 2–3 questions about reasoning and consistency, and one question introduces a safe changed condition ("What if…?") to test adaptability.

Judges assess reasoning, not confidence, accent or performance style — and they are instructed not to equate fluent English with ethical sophistication. You may revise your position if the new condition genuinely changes the ethical balance; thoughtful revision is not treated as weakness.

The defense must be completed by the candidate without coaching.`,
      progressionRule:
        "Scores go to moderation. Ties, missing marks and integrity flags are resolved before the result is locked, and final results are published through the League system.",
    },
  ],

  rubrics: [
    {
      isPublic: true,
      criteria: [
        { name: "Self-Awareness & Values Clarity", weight: 25 },
        { name: "Ethical Reasoning", weight: 30 },
        { name: "Consistency Between Values & Decision", weight: 20 },
        { name: "Reflection & Adaptability", weight: 15 },
        { name: "Oral Defense", weight: 10 },
      ],
      tieBreakRule:
        "In order: 1) Ethical Reasoning, 2) Consistency Between Values & Decision, 3) Self-Awareness & Values Clarity, 4) Reflection & Adaptability, 5) Chief Judge blind comparative review using the same evidence and rubric.",
    },
  ],

  resources: [
    {
      type: "article",
      title: "The official Values Bank",
      content: `Accountability — owning your actions and their outcomes. Courage — doing what you believe is right even when it is difficult. Empathy — trying to understand another person's feelings or perspective. Fairness — applying reasonable and consistent standards to people. Honesty — communicating truthfully and avoiding deception. Humility — recognising that you can be mistaken and can learn from others. Inclusion — making space for others to participate and belong. Integrity — acting consistently with responsible principles, including when no one is watching. Kindness — choosing considerate and helpful behaviour. Loyalty — standing by people or commitments while still considering what is right. Open-mindedness — considering relevant viewpoints and evidence before deciding. Patience — managing delay or frustration without reacting carelessly. Perseverance — continuing responsible effort when something is difficult. Privacy — respecting appropriate personal boundaries and information. Respect — treating people and reasonable rules with consideration. Responsibility — fulfilling duties and considering the effect of your choices. Self-discipline — controlling impulses and following through on responsible choices. Service — using time or effort to contribute to others or the community. Trustworthiness — being dependable and worthy of confidence. Cooperation — working constructively with others toward a shared goal. Compassion — responding to difficulty with care and concern. Justice — seeking fair treatment and reasonable correction of unfairness. Curiosity — wanting to understand before making a judgement. Reliability — doing what you said you would do consistently.

The bank provides choices; it does not tell students which values are "best." You may add up to two values of your own if you write a short neutral definition for each.`,
    },
    {
      type: "article",
      title: "The Ethical Decision Ladder — STOP, IDENTIFY, CONNECT, COMPARE, CONSIDER, CHOOSE, OWN, REFLECT",
      content: `STOP — do not decide immediately. IDENTIFY — what is the ethical issue and who is affected? CONNECT — which values from my tree are relevant? COMPARE — what realistic options exist? CONSIDER — what are the likely short- and long-term consequences? CHOOSE — which action is most responsible and why? OWN — what consequence or responsibility will I accept? REFLECT — what could change my decision, and what did I learn?

Consequence matrix to complete for each option: Who benefits? Who may be harmed? Short-term effect. Long-term effect. Value supported or challenged.`,
    },
    {
      type: "practice_question",
      title: "Practice dilemma bank",
      content: `A close friend copied part of an assignment and asks you to keep it secret — loyalty vs integrity, fairness and accountability.

You find an expensive item at school when nobody is nearby — personal benefit vs honesty and responsibility.

Your group receives praise, but one member did most of the work and is not being recognised — group loyalty vs fairness and accountability.

A student is being excluded from a group because others think including them will make the task slower — efficiency and loyalty vs inclusion and fairness.

You promised to support a friend, but later discover their plan may unfairly disadvantage another student — loyalty vs fairness and responsibility.

You make a mistake that causes a team problem, and another person is being blamed — self-protection vs honesty and accountability.`,
    },
    {
      type: "sample_task",
      title: "Worked example — a complete Values Tree through to the decision",
      content: `For training only — do not copy this as a prepared competition response.

ROOTS: School experiences taught me to own my work • Seeing fair treatment modelled by adults • Learning from mistakes in teamwork • Community and service experiences taught me that choices affect other people. TRUNK: Integrity, Fairness, Responsibility. BRANCHES — Integrity: tell the truth when difficult; admit mistakes. Fairness: hear both sides; avoid unfair advantage. Responsibility: complete duties; correct problems I cause. FRUITS: trust, fair treatment, dependability. SELF-AWARENESS: Strength — I usually admit errors once I recognise them. Growth area — I can hesitate when a friend may be disappointed.

Dilemma: a close friend tells you they copied part of an assignment and asks you not to tell anyone. Later, the teacher asks whether you know what happened.

Decision: "I would first encourage my friend to admit what happened themselves. This allows me to respect the friendship without supporting dishonesty. If the teacher directly asks me, I would not lie. My decision is mainly guided by integrity, fairness and responsibility, while empathy affects how I approach the friend."

Changed condition: if the copied work involved a broader pattern affecting several students, I would act more quickly because the fairness impact is larger.

Why this example is strong: the candidate does not say loyalty is "bad." The response recognises competing values, chooses a responsible action, explains consequences, accepts discomfort, and shows how new information could change the urgency of the response.`,
    },
    {
      type: "article",
      title: "Four-week preparation plan",
      content: `Week 1 — Values vocabulary and self-awareness: use the Values Bank, define values in your own words, and build 2–3 practice trees. Week 2 — Ethical issue and stakeholder analysis: practise identifying competing values, facts, assumptions and stakeholders. Week 3 — Consequences and responsible decisions: use the consequence matrix and compare at least two options before deciding. Week 4 — Full simulation and defense: complete a tree plus an unseen dilemma plus reflection, then answer changed-condition questions aloud.

Readiness checklist: I understand the Values Bank is a resource, not a list of "correct" answers • I can explain the difference between a value, a behaviour and an outcome • I can build a tree without sharing private or sensitive information • I can identify competing values instead of assuming one value solves every dilemma • I compare at least two options before choosing • I consider consequences for more than one stakeholder • I can explain what responsibility I would accept • I can change or refine my view when new information genuinely matters • I can defend my reasoning respectfully even if a judge challenges it.`,
    },
  ],

  faqs: [
    {
      question: "Will I have to share private things about my family or beliefs?",
      answer:
        "No — that is an explicit integrity rule. EthosQuest must never require disclosure of private family, religious, medical, mental-health, political, financial or other sensitive personal information. Values are explained through general, school-safe examples, and judges must not require private disclosures to 'prove' authenticity.",
    },
    {
      question: "Are some values worth more marks than others?",
      answer:
        "No. No mark is awarded for selecting a particular value, and judges are instructed not to judge whether they personally agree with your value choices. You are rewarded for clarity, consistency, reasoning and application — including when you choose values that can conflict, such as loyalty and fairness.",
    },
    {
      question: "Do I get the Values Bank in advance?",
      answer:
        "Yes. The Values Bank is published before the event as an official preparation resource, and the same printed bank is supplied to every candidate on event day. You may also add up to two of your own values if you write a short neutral definition for each.",
    },
    {
      question: "Does my Values Tree need to look good?",
      answer:
        "No. The tree is a thinking map, not an art contest — it is assessed for meaning, not visual beauty, and judges are told not to reward decorative tree design. Artistic skill, handwriting style and decoration earn nothing beyond basic legibility.",
    },
    {
      question: "Can I change my mind during the oral defense?",
      answer:
        "Yes, if the changed condition genuinely alters the ethical balance and you explain why. Thoughtful revision is explicitly not treated as weakness — it is how Reflection & Adaptability and the supporting C43 competency are evidenced.",
    },
    {
      question: "Can I prepare my tree beforehand and copy it in?",
      answer:
        "No. The Values Tree must be your own work created during the controlled session, and no pre-completed tree or prepared dilemma answer may be copied into the competition sheet. Only organizer-issued materials may be used during the written session.",
    },
    {
      question: "What if I don't think any option in the dilemma is good?",
      answer:
        "Say so. A strong answer may acknowledge that no option is perfect. What matters is generating at least two realistic options, weighing consequences for more than one stakeholder, choosing the most responsible action rather than the easiest, and stating what responsibility you would accept.",
    },
  ],

  events: leagueDates("2026-12-05", "Competition day — written session and oral defense", {
    activityNote: "Finale weekend, day one. Arena / one-day live format.",
  }),
};
