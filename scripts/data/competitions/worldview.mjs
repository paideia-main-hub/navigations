// Extracted from MANUALS/MANUALS/WorldView_Global_Change_Pakistan_Impact_Challenge_Manual_v2_0.docx
import { leagueDates } from "./_shared.mjs";

export default {
  slug: "worldview",
  title: "WorldView",
  shortDescription:
    "Global Change → Pakistan Impact → Future Response: teams of three research, analyse, localise, adapt, present and defend.",
  domain: "Global & Intercultural Competence",
  competencies: ["C45"],
  supportsIndividual: false,
  supportsTeam: true,
  status: "open",
  pathway: "applied_skills",
  image: null,
  manualVersion: "v2.0",
  manualFile: "WorldView_Global_Change_Pakistan_Impact_Challenge_Manual_v2_0.docx",

  overview: `WorldView is a team research and presentation competition. Each team of exactly three students investigates one major global change, explains what is changing internationally, analyses how that change may affect Pakistan, identifies opportunities and risks for Pakistani society or institutions, and proposes a practical adaptation response.

The strongest teams move beyond describing a trend: they show evidence, compare perspectives, localise the issue to Pakistan, and defend a realistic solution.

Core design rule: WorldView does not assess how dramatic or fashionable a topic sounds. It assesses whether students can understand a real global change, research it responsibly, interpret its implications for Pakistan, consider more than one perspective, and recommend a feasible response.

Research falls within three published streams — Technology, Environment and Education — over a recommended 7–10 day research window, culminating in a one-day final: a 10-minute team presentation followed by 5 minutes of panel questioning.

Competency alignment — C45 Global & Intercultural Competence is the core competency, supported by C44 Ethical & Responsible Decision Making (trade-offs, winners and losers, access, fairness, sustainability, unintended consequences), C03 Research & Inquiry, C05 Academic Communication and C28 Collaboration & Teamwork.

On sensitive topics: WorldView may include difficult global issues, but the competition is framed around evidence, impact and adaptation rather than partisan advocacy. Topics requiring students to disclose sensitive personal information or argue inflammatory identity-based positions are not used.`,

  eligibility: [
    {
      category: "middle",
      minGrade: "8",
      maxGrade: "8",
      teamMinSize: 3,
      teamMaxSize: 3,
      notes:
        "Senior category only — Grade 8 through O Level or equivalent. Junior and primary categories are not included in this edition. Teams are exactly 3 students, all registered through the same invited school unless the organizer publishes otherwise. A student may join only one WorldView team per edition, and all three registered students must attend the live presentation and panel defense. Recommended default language: English.",
    },
    {
      category: "secondary",
      minGrade: "9",
      maxGrade: "10",
      teamMinSize: 3,
      teamMaxSize: 3,
      notes:
        "Senior category only — Grade 8 through O Level or equivalent. Junior and primary categories are not included in this edition. Teams are exactly 3 students, all registered through the same invited school unless the organizer publishes otherwise. A student may join only one WorldView team per edition, and all three registered students must attend the live presentation and panel defense. Recommended default language: English.",
    },
  ],

  stages: [
    {
      stageNumber: 1,
      title: "Define the Global Change",
      format: "Global Change Brief plus one central research question",
      duration: "Part of the 7–10 day research window — 10 marks",
      taskDescription: `Define the change precisely and avoid broad labels such as "technology is changing the world." State the time horizon — a current shift, an emerging trend or a medium-term development. Identify the sector or sectors most affected. Write one central research question that explicitly links the global change to Pakistan. Do not begin with a predetermined solution.

Marks break down as clarity of the global change (4 — specific, understandable and accurately scoped), significance (3 — why the change matters internationally) and the research question (3 — focused, explicitly connecting the change to Pakistan).

Topics are drawn from the Technology, Environment or Education streams, or another organizer-approved global-change theme. Depending on the edition rule, the organizer either assigns the official topic or approves a team proposal — but all teams follow the same research window, output requirements and rubric.`,
      progressionRule: "The approved topic code unlocks the rest of the research chain; all six stages accumulate to the 100-mark total.",
    },
    {
      stageNumber: 2,
      title: "Research & Verify",
      format: "Source log plus evidence notes",
      duration: "Part of the research window — 15 marks",
      taskDescription: `Use at least 5 credible sources; Senior teams are encouraged to use 6–8 where appropriate. Include more than one source type where possible — official data, reputable institutional reports, credible research, recognised news analysis or sector reports. Check publication date, author or institution, purpose and context. Distinguish current evidence from forecasts or scenarios. Keep a source log showing what each source contributed.

Marks: source quality (5 — credible, identifiable and relevant), evidence selection (4 — evidence directly supports the analysis), verification and balance (3 — key claims cross-checked and contrary or uncertain evidence acknowledged), source documentation (3 — the log is complete and traceable).

Integrity rules: research must be produced by the registered team; sources must be identifiable and listed; fabricated statistics, quotations or references are prohibited; teams must not rely on a single social-media post, anonymous blog or unsupported claim; where projections differ, acknowledge uncertainty rather than presenting one forecast as certain. Adults may explain rules and provide access to resources but may not research, write, analyse or design the team's case.`,
      progressionRule: "Untraceable or apparently fabricated evidence is referred for verification before results are locked.",
    },
    {
      stageNumber: 3,
      title: "Analyse Pakistan Impact",
      format: "Pakistan Impact Matrix",
      duration: "Part of the research window — 25 marks (the core analytical stage)",
      taskDescription: `Explain at least two direct effects and two indirect effects where the evidence supports them. Identify which Pakistani sectors or stakeholder groups could be most affected. Consider both opportunities and risks. Use Pakistan-specific conditions — infrastructure, skills, institutions, resources, demographics, access, affordability or policy capacity. Distinguish short-term effects from longer-term implications. Never claim that a global change will affect Pakistan exactly as it affects another country.

Marks: Pakistan-specific reasoning (8 — localised rather than copied from international examples), direct and indirect effects (5 — clear causal pathways and second-order effects), stakeholder analysis (4 — who may gain, lose, adapt or require support), opportunity and risk balance (4), evidence linkage (4 — impact claims supported by relevant data or credible reasoning).

The Impact Matrix covers eight dimensions: People & Skills, Economy & Industry, Education, Technology & Infrastructure, Environment & Resources, Equity & Access, Institutions & Policy, and Culture & Society.`,
      progressionRule: "This stage is the first tie-break criterion — a higher Pakistan Impact Analysis score breaks a tied total.",
    },
    {
      stageNumber: 4,
      title: "Compare Responses & Perspectives",
      format: "Comparison and perspective note",
      duration: "Part of the research window — 10 marks",
      taskDescription: `Compare at least two relevant international or regional responses. Explain what can and cannot be transferred to Pakistan. Consider different perspectives — student/teacher, government/business, urban/rural, consumer/worker, or present/future generations, depending on the topic. Never present another country's policy as automatically suitable for Pakistan.

Marks: comparative insight (4 — uses relevant examples to generate learning rather than imitation), perspective taking (3 — recognises different stakeholder or cultural perspectives), transfer judgement (3 — explains what is adaptable to Pakistan and what requires modification).`,
      progressionRule: "Feeds the adaptation design in Stage 5 — judges will ask what you decided was not transferable, and why.",
    },
    {
      stageNumber: 5,
      title: "Design the Pakistan Adaptation Response",
      format: "Pakistan Adaptation Action Plan",
      duration: "Part of the research window — 20 marks",
      taskDescription: `Generate at least two response options before recommending one or an integrated package. State who should act — government, schools, universities, industry, communities, families or individuals. Make recommendations feasible within Pakistan's constraints. Include a simple implementation timeline or sequence. Identify the resources and capabilities required. State 2–3 indicators that would show whether the response is working. Consider ethical, access and sustainability implications.

Marks: evidence-based fit (6 — the recommendation directly responds to your Pakistan impact analysis), feasibility (5 — responsibilities, resources and constraints are realistic), innovation and adaptation (3 — tailored to Pakistan rather than copied), ethical and inclusive judgement (3 — fairness, access and unintended effects), measurement (3 — success indicators allow future review).

The Action Plan records: priority problem or opportunity, recommended response, who should lead, supporting stakeholders, the first 3 implementation steps, resources and capabilities required, the main risk or barrier, how to reduce that risk, and three success indicators.`,
      progressionRule: "Second tie-break criterion. The plan and the source list are uploaded by the published deadline, locking the presentation record.",
    },
    {
      stageNumber: 6,
      title: "Present & Defend",
      format: "10-minute team presentation followed by 5 minutes of panel questioning",
      duration: "15 minutes on event day — 20 marks",
      taskDescription: `All three students must speak. The presentation should explain the change, evidence, Pakistan effects and recommended response as one coherent story. Slides support speaking rather than acting as a script, and every important statistic or chart carries a visible source reference. Judges may challenge assumptions, ask for evidence, test feasibility or introduce a change in conditions. Acknowledge uncertainty when evidence is incomplete.

Marks: structure and clarity (5 — logical flow from global change to Pakistan response), evidence communication (4 — data and sources explained accurately and concisely), delivery and teamwork (4 — balanced participation, clear delivery, professional coordination), panel response (5 — answers use evidence, reasoning and adaptability), time and conduct (2).

Recommended 10-slide structure: title, team and central question (0:30) • what is changing globally (1:00) • evidence and major drivers (1:00) • global examples and comparison (1:00) • Pakistan direct effects (1:15) • Pakistan indirect effects, opportunities and risks (1:15) • stakeholders and key constraints (1:00) • response options considered (1:00) • recommended adaptation plan (1:15) • success indicators and conclusion (0:45).

Judge protocol: judge the evidence and reasoning, not the popularity of the topic; never assume a global example automatically applies to Pakistan; reward teams that distinguish evidence from forecast and acknowledge uncertainty; challenge solutions for feasibility, equity, timing, resources and unintended consequences; do not reward excessive slide design at the expense of analysis; and ensure all three students demonstrate ownership.`,
      progressionRule:
        "Judges score individually with evidence notes; scores go to moderation and teams receive no unofficial rankings from judges. The Chief Judge resolves missing scores, large variance, integrity flags and ties before results are locked.",
    },
  ],

  rubrics: [
    {
      isPublic: true,
      criteria: [
        { name: "Define the Global Change", weight: 10 },
        { name: "Research & Verify", weight: 15 },
        { name: "Pakistan Impact Analysis", weight: 25 },
        { name: "Compare Responses & Perspectives", weight: 10 },
        { name: "Pakistan Adaptation Response", weight: 20 },
        { name: "Presentation & Panel Defense", weight: 20 },
      ],
      tieBreakRule:
        "In order: 1) Pakistan Impact Analysis, 2) Pakistan Adaptation Response, 3) Panel Response. If still tied, a short fresh response to an organizer-issued global-change mini-scenario is assessed by the Chief Judge.",
    },
  ],

  resources: [
    {
      type: "article",
      title: "The WorldView research chain — nine steps from global signal to measurement",
      content: `1. Global signal — what exactly is changing? → a one-sentence trend statement. 2. Drivers — why is it changing? → 2–4 key drivers. 3. Evidence — what facts or data show the change is real? → a verified evidence set. 4. International effects — what effects are already visible or reasonably projected? → global impact notes. 5. Pakistan exposure — where does Pakistan connect to this change? → affected sectors and stakeholders. 6. Pakistan impact — what direct and indirect effects could follow? → the impact matrix. 7. Response options — what could Pakistan do? → an option comparison. 8. Recommendation — what should be prioritised and why? → the adaptation action plan. 9. Measurement — how would we know adaptation is working? → success indicators.

Direct vs indirect: a direct effect is an immediate connection between the global change and a Pakistani sector or stakeholder (a new technology changes how a task is performed). An indirect effect is secondary, produced through jobs, costs, skills, behaviour, environment, policy or access (the technology changes which skills employers demand).`,
    },
    {
      type: "article",
      title: "The Pakistan Impact Matrix — eight dimensions to interrogate",
      content: `People & Skills — which skills, jobs, learning habits or behaviours may change, and who needs reskilling or support? Economy & Industry — could costs, productivity, exports, services, entrepreneurship or employment change? Education — what should schools, universities, teachers or curricula prepare for? Technology & Infrastructure — does adaptation require connectivity, equipment, data systems, energy or technical capacity? Environment & Resources — could water, energy, waste, pollution, biodiversity or climate exposure change? Equity & Access — could urban/rural, income, gender, regional or disability access gaps widen or narrow? Institutions & Policy — what rules, standards, planning or coordination might be required? Culture & Society — could the change alter communication, values, identity, language, trust or social behaviour?

For each row, record the possible impact, your evidence or reasoning, and whether it is an opportunity or a risk.`,
    },
    {
      type: "article",
      title: "The source reliability test, and which sources to use",
      content: `Seven checks — Authority: who produced this, and are they credible in this field? Evidence: does the source show data, methodology, references or verifiable examples? Recency: is the information current enough for this topic? Context: does the evidence apply to the same country, population or sector being discussed? Purpose: is the source informing, researching, selling, campaigning or persuading? Balance: what contrary evidence or alternative interpretation exists? Pakistan relevance: what additional local evidence is needed before applying this claim to Pakistan?

Source types — Pakistan official sources (federal and provincial reports, the Pakistan Bureau of Statistics, regulatory or ministry publications) to establish the local baseline. International organizations (UN agencies, World Bank, UNESCO, OECD, ITU, UNEP) for global trends, comparisons and definitions. Universities and research (peer-reviewed studies, credible think-tank research with transparent methodology) to deepen evidence and explain mechanisms. Industry and technology reports for emerging technologies and market shifts — check for commercial bias. Reputable journalism with named reporting to track recent developments, verified against stronger primary sources where possible. Data portals with defined indicators and dates, used responsibly for charts and comparisons.`,
    },
    {
      type: "practice_question",
      title: "Topic bank — Technology, Environment and Education streams",
      content: `Technology — AI and automation: how could increasing use change the skills Pakistan needs in education and employment? • Digital payments and cashless systems: how could this affect inclusion, small businesses and financial literacy? • Remote and hybrid work: what opportunities and skill demands could this create? • Cybersecurity and digital trust: how should Pakistan strengthen awareness and institutional readiness as services move online? • Low-cost satellite connectivity: how could this affect education and services in underserved areas? • Smart agriculture: how could sensors, data and automation change productivity and skills?

Environment — climate adaptation as a global planning priority: how should Pakistani cities and schools adapt to heat, water and weather risks? • The renewable-energy transition: what opportunities and challenges follow? • Water scarcity and water-efficiency technologies • Circular economy and waste reduction • Electric mobility and its effect on energy, infrastructure, skills and the urban environment • Climate-resilient agriculture and food security.

Education — AI-assisted learning while protecting integrity, teacher roles and equitable access • Competency-based education and its effect on curriculum and assessment • Micro-credentials and alternative qualifications • Personalised and adaptive learning • The global emphasis on future skills • Hybrid learning models adapted realistically for different school contexts.`,
    },
    {
      type: "sample_task",
      title: "Worked example — AI-driven change in education",
      content: `A hypothetical training example, not a factual forecast — teams must conduct their own current research.

Global change statement: education systems are increasingly experimenting with AI-supported tools for tutoring, content generation, feedback, administration and personalised learning. Central research question: how could the growing international use of AI-assisted learning affect Pakistani schools, and what adaptation strategy could help schools gain educational value while managing risks?

Impact matrix (opportunity vs risk) — Learning: faster feedback and differentiated practice vs over-reliance, inaccurate outputs or reduced independent thinking. Teachers: planning and administrative support vs the need for training, changed roles and quality-control responsibilities. Access: low-cost digital support where infrastructure exists vs connectivity and device gaps widening inequality. Assessment: new ways to support formative learning vs difficulty confirming authorship. Skills: AI literacy and verification skills become more important vs students using tools without understanding reliability. Policy: an opportunity to set responsible-use standards vs schools adopting inconsistent rules.

Response options — ban AI tools completely (simple, but ignores useful applications and future skill needs) • allow unrestricted use (maximum access, high integrity and dependency risks) • controlled educational use with disclosure, teacher training and verification rules (balances value, responsibility and future readiness, but requires training and monitoring).

Example recommendation: a phased responsible-use model — define permitted classroom uses, require disclosure when AI materially supports work, teach students how to verify outputs, train teachers in instructional use and assessment redesign, and pilot before wider adoption — with indicators such as teacher training completion, student AI-literacy performance, integrity incidents, access equity and learning-feedback quality.

What judges would challenge: what evidence shows AI use is increasing in education? Which parts are global evidence and which are Pakistan-specific inference? How would this work in schools with limited connectivity? How would you protect students without equal device access? What would teachers need to learn first? How would you know AI is improving learning rather than only increasing convenience?`,
    },
    {
      type: "practice_question",
      title: "Panel defense practice questions",
      content: `Which source is most important to your conclusion, and why? What evidence would make you change your recommendation? Why would this global change affect Pakistan differently from another country? Who could be disadvantaged by your proposal? Which part of your solution should happen first? What is the biggest implementation barrier? If funding were reduced by half, what would you keep? What is uncertain in your forecast? What would happen if Pakistan did nothing? How would you measure success after one year?

Rehearse with all three members answering — judges are required to ensure every student demonstrates ownership of the whole case, not just their assigned role.`,
    },
    {
      type: "article",
      title: "Team roles, four-week plan and readiness checklist",
      content: `Roles support organisation but do not divide ownership — all three students must understand and defend the complete case. Global Research Lead: defines the global change, collects international evidence, verifies major claims. Pakistan Impact Lead: analyses direct and indirect effects, stakeholders, opportunities, risks and local constraints. Response & Presentation Lead: coordinates adaptation options, recommendations, slide flow and rehearsal.

Four-week plan — Week 1: global-change literacy, practising trends, drivers, evidence and uncertainty from short articles and reports. Week 2: Pakistan impact analysis using the matrix on technology, environmental and education examples. Week 3: adaptation and solution design, comparing options on feasibility, equity, cost, timing and measurable outcomes. Week 4: timed 10-minute presentations, panel questioning and evidence-source drills.

Readiness checklist: we can explain the global change in one clear sentence • we can identify which claims are current facts, which are projections and which are our interpretation • we have at least five credible, traceable sources • we have Pakistan-specific evidence rather than only international examples • we can explain direct and indirect effects • we have identified both opportunities and risks • we compared more than one response option • our recommendation identifies responsible actors, resources, constraints and success indicators • all three members can answer questions about the whole project • our slides are concise and our data and images are attributed • we can finish within 10 minutes • we can acknowledge uncertainty instead of inventing an answer.

Required outputs before event day: the approved topic and research question, a one-page Global Change Brief, a source log with at least five credible sources, the Pakistan Impact Matrix, a response-option comparison, the Adaptation Action Plan, the final presentation deck, and the team role and contribution record.`,
    },
  ],

  faqs: [
    {
      question: "How many students per team, and which grades?",
      answer:
        "Exactly 3 students, Senior category only — Grade 8 through O Level or equivalent. All three must be registered through the same invited school, a student may join only one WorldView team per edition, and all three must attend the live presentation and panel defense.",
    },
    {
      question: "Do we choose our own topic?",
      answer:
        "It depends on the edition rule — the organizer either assigns a stream and topic or approves a team proposal. Either way, the topic must fall within the Technology, Environment or Education streams (or another approved global-change theme), and all teams follow the same research window, outputs and rubric.",
    },
    {
      question: "How many sources do we need?",
      answer:
        "At least 5 credible sources, with 6–8 encouraged where appropriate, and more than one source type where possible. Each is recorded in a source log showing what it contributed, why it is credible and how it relates to Pakistan. Fabricated statistics, quotations or references are prohibited and flagged for verification.",
    },
    {
      question: "Which stage carries the most marks?",
      answer:
        "Pakistan Impact Analysis, at 25 marks — it is the core analytical stage and the first tie-break criterion. The Adaptation Response and the Presentation & Panel Defense follow at 20 each.",
    },
    {
      question: "Can we just recommend what another country did?",
      answer:
        "No. Judges are told never to assume a global example automatically applies to Pakistan, and Transfer Judgement specifically rewards explaining what is adaptable and what requires modification. Innovation & Adaptation credits a response tailored to Pakistan rather than copied.",
    },
    {
      question: "What if the evidence is uncertain?",
      answer:
        "Say so. Where projections differ, acknowledge uncertainty instead of presenting one forecast as certain — judges are instructed to reward teams that distinguish evidence from forecast, and the readiness checklist ends with 'we can acknowledge uncertainty instead of inventing an answer.'",
    },
    {
      question: "Do all three of us have to speak?",
      answer:
        "Yes. All three students must speak during the 10-minute presentation, and Delivery & Teamwork rewards balanced participation. Judges also ensure every student demonstrates ownership of the whole case during the 5-minute panel questioning.",
    },
    {
      question: "Will impressive slides help?",
      answer:
        "Not on their own — judges are explicitly told not to reward excessive slide design at the expense of analysis. Slides should support speaking rather than act as a script, and every important statistic or chart needs a visible source reference.",
    },
  ],

  events: leagueDates("2026-11-30", "Final presentation day — 10-minute presentation and panel Q&A", {
    activityNote: "Applied Skills Challenges, week two. Preceded by a 7–10 day team research window with outputs uploaded before the deadline.",
  }),
};
