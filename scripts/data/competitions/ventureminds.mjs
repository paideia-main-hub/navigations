// Extracted from MANUALS/MANUALS/VentureMinds Manual.docx
import { leagueDates } from "./_shared.mjs";

export default {
  slug: "ventureminds",
  title: "VentureMinds",
  shortDescription:
    "Microbusiness challenge for teams of three: business model submission, a 10-minute pitch and a panel defense.",
  domain: "Enterprise, Financial & Civic Development",
  supportsIndividual: false,
  supportsTeam: true,
  status: "open",
  manualVersion: "v1.0",
  manualFile: "VentureMinds Manual.docx",

  overview: `VentureMinds is a team entrepreneurship competition. Three students work as one enterprise team to identify a genuine market need, design an original microbusiness model, test its market logic, plan finances and timeline, present the model in ten minutes, and defend it before a judging panel.

Stages 1–4 are evidenced through a Microbusiness Model Pack submitted before the live event; Stages 5–6 are assessed live. The final rank is based on a collective total out of 100.

Collective assessment rule: all stage marks are awarded to the team collectively, and the same final score and rank apply to all three members. Individual competency evidence for later portfolio use must still reflect each student's actual contribution and should not be inferred only from the team result.

Creativity and innovation are rewarded only when the idea also has customer, operational and financial logic. Creativity here means a meaningful new combination, feature, delivery method, customer experience or solution — not novelty for its own sake.

Financial contribution clarification: "financial contribution" means the team's proposed startup capital requirement and the planned source of that capital within the model. Students are never required to invest or risk personal money, and judges assess the quality and realism of the financial plan, not the amount of money available to a team. A model may be conceptual or pilot-ready.

Competency alignment — C28 Collaboration & Teamwork and C29 Entrepreneurship are the core competencies, supported by C27 Planning & Organization. Competition marks record event performance; they do not automatically establish a competency proficiency level.

Recommended registration: PKR 1,500 per team, subject to organizer approval.`,

  eligibility: [
    {
      category: "secondary",
      minGrade: "8",
      maxGrade: "12",
      teamMinSize: 3,
      teamMaxSize: 3,
      notes:
        "Grade 8 through O Level or equivalent secondary grades; the organizer may create Junior and Senior subcategories if entry numbers justify them. Teams are exactly 3 candidates, all normally representing the same registered school. Business scope must be age-appropriate, lawful and safe — restricted, hazardous or age-restricted products and services are not permitted. English by default. The submitted microbusiness model must be the team's own competition work.",
    },
  ],

  stages: [
    {
      stageNumber: 1,
      title: "Market Need & Opportunity Identification",
      format: "Need & Opportunity Statement plus an evidence note, in the submitted Model Pack",
      duration: "15 marks — cumulative 15%",
      taskDescription: `Purpose: test whether the team begins with a genuine customer or community need rather than an unsupported product idea.

Guiding rules: state the need or problem in one clear sentence before naming the proposed product or service • identify who experiences the problem and in what context • use at least one simple form of validation such as a small survey, observation, interview notes, a price or availability check, or approved secondary evidence • distinguish a real need from a personal preference, because a strong opportunity solves a meaningful inconvenience, cost, access, quality or experience problem • keep the opportunity narrow enough for a student microbusiness to address realistically • explain why the timing or context makes the opportunity relevant now.

Common pitfalls: starting with "we want to sell…" and inventing a problem afterward • using only the team's own opinion as proof of demand • choosing a problem too broad for a microbusiness to influence • confusing popularity with need • claiming every student or customer has the same need.

Marks: Need Definition (4), Opportunity Evidence (4), Target Customer (3), Opportunity Fit (2), Team Reasoning (2).`,
      progressionRule: "Assessed from the submitted Microbusiness Model Pack before the live pitch. Cumulative total after Stage 1: 15 marks.",
    },
    {
      stageNumber: 2,
      title: "Creative & Innovative Microbusiness Model",
      format: "Microbusiness Model Canvas / Business Model Summary",
      duration: "25 marks — cumulative 40% (the highest-weighted stage)",
      taskDescription: `Purpose: assess whether the team converts the validated need into an original, coherent and workable business model that creates clear customer value.

Guiding rules: describe the product or service and its value proposition in plain language — what value does the customer receive? • show how the business will create, deliver and capture value, so customer, offer, channel, operations, resources and revenue logic all connect • explain what makes the model different from existing alternatives • keep operations feasible for the age group and school or community context • show team role allocation and how the three candidates will coordinate key tasks • keep it a microbusiness with focused scope, simple operations and understandable economics.

Common pitfalls: calling an idea "innovative" without explaining what is actually different • a creative product with no customer value or delivery plan • copying a famous company model with only a new name • too many products, customer groups or features for a small student venture • no clear revenue logic or unclear responsibility for operations • unequal team ownership where only one student understands the business.

Marks: Creativity & Innovation (6), Value Proposition (5), Business Model Coherence (5), Operations & Resource Logic (4), Team Collaboration & Roles (5).`,
      progressionRule: "Second tie-break criterion. Cumulative total after Stage 2: 40 marks.",
    },
    {
      stageNumber: 3,
      title: "Market Analysis & Customer Validation",
      format: "Market Analysis Sheet",
      duration: "15 marks — cumulative 55%",
      taskDescription: `Purpose: assess whether the team understands its target market, alternatives and likely customer response rather than assuming the idea will sell.

Guiding rules: define the target customer using relevant characteristics such as grade or age group, location, use case, purchasing situation or need • estimate market size at a simple level appropriate to the competition, avoiding unsupported national-level projections • identify at least two competitors or alternatives, including "do nothing" or existing substitutes • compare price, convenience, quality, features or customer experience on a consistent basis • use simple validation evidence to test likely demand or willingness to pay • translate the evidence into a realistic market conclusion about who is most likely to buy, why, and at what approximate price level.

Common pitfalls: claiming there is "no competition" • using a huge market-size number unconnected to the team's actual reachable customers • surveying only close friends and treating the result as universal demand • asking leading questions such as "Would you buy this amazing product?" • setting a price by guessing or copying a competitor • ignoring why customers might stay with an existing alternative.

Marks: Market Evidence (4), Customer Definition (3), Competitor / Alternative Analysis (3), Demand & Price Logic (3), Market Conclusion (2).`,
      progressionRule: "Fourth tie-break criterion. Cumulative total after Stage 3: 55 marks.",
    },
    {
      stageNumber: 4,
      title: "Financial Contribution, Costing & Timeline",
      format: "Finance & Contribution Sheet plus a milestone timeline",
      duration: "20 marks — cumulative 75%",
      taskDescription: `Purpose: assess whether the team understands the basic money, resource and timing requirements needed to make the microbusiness model feasible.

Guiding rules: state the proposed startup capital needed and explain its planned source — the competition does not require students to invest real money • separate one-time startup costs from recurring or unit costs where possible • state the proposed selling price and show the assumptions behind it • use simple unit economics (estimated cost per unit or service, price, expected contribution or margin, and likely sales volume for a small pilot) • include a basic revenue estimate and identify the assumptions that could make it wrong • create a timeline with clear milestones, responsibilities and target completion periods • identify at least two financial or operational risks and a practical response.

Common pitfalls: treating revenue as profit • leaving out packaging, delivery, platform, material or other obvious costs • using unrealistic sales volumes to make the idea look profitable • assuming more startup money automatically means a stronger model • giving a timeline with dates but no milestones or responsibility • no contingency if costs rise, demand is lower, or a supplier or resource becomes unavailable.

Marks: Startup Contribution / Capital Logic (5), Cost & Revenue Assumptions (5), Financial Viability (4), Timeline & Milestones (3), Risk & Contingency (3).`,
      progressionRule: "Third tie-break criterion. Cumulative total after Stage 4: 75 marks.",
    },
    {
      stageNumber: 5,
      title: "10-Minute Business Model Presentation",
      format: "Live team presentation with a pitch deck, all three members speaking",
      duration: "Maximum 10 minutes — 15 marks, cumulative 90%",
      taskDescription: `Purpose: assess whether the team can communicate the complete microbusiness logic clearly, professionally and persuasively within a strict ten-minute limit.

Guiding rules: maximum 10 minutes, and the Chair or timekeeper stops the presentation at time • all three candidates must have meaningful speaking roles — no candidate may be only the slide operator or a silent member • recommended sequence: need → customer → solution and value → business model → market → finance → timeline → closing case • slides should support the business story, not be read as dense paragraphs • use only claims and figures the team can explain and defend • label any charts, survey data or prices and keep them traceable to the submitted evidence • a prototype or mock-up may be shown if safe and permitted, but visual polish cannot substitute for business logic.

Suggested timing: 0:00–1:00 hook and market need • 1:00–2:30 target customer and evidence • 2:30–4:30 the solution and value proposition • 4:30–6:00 business model, operations and team roles • 6:00–7:15 market and competitor insight • 7:15–8:45 financial contribution, costs, price and revenue logic • 8:45–9:30 timeline and risk • 9:30–10:00 the closing case.

Common pitfalls: spending most of the ten minutes on the product and rushing finance and market logic • one candidate giving nearly the whole presentation • reading slides rather than explaining decisions • exaggerated claims such as "everyone will buy this" • too many slides, tiny text or decorative visuals that hide weak content • exceeding ten minutes and losing the conclusion.

Marks: Structure & Business Story (3), Visual Communication (3), Business Understanding (4), Team Delivery (3), Persuasiveness & Time Control (2).`,
      progressionRule: "Assessed live by the panel. Cumulative total after Stage 5: 90 marks.",
    },
    {
      stageNumber: 6,
      title: "Panel Q&A & Business Defense",
      format: "Structured panel questioning directed to any team member",
      duration: "Recommended 5 minutes — 10 marks, cumulative 100%",
      taskDescription: `Purpose: assess whether all three candidates genuinely own the business model and can answer evidence, market, finance, feasibility and risk questions under challenge.

Guiding rules: the panel may direct a question to any team member, and members may add briefly after the first answer but should not routinely rescue one another • questions test assumptions, not confidence • teams may acknowledge uncertainty, and a qualified answer is stronger than inventing data • when challenged, explain whether you would keep, modify or reject an assumption and why • panel members use a common question framework so teams receive comparable challenge.

Common pitfalls: giving a memorised pitch answer instead of responding to the actual question • defending every assumption even when the panel exposes a weakness • contradictory answers from different team members • inventing market or financial figures during Q&A • one member answering nearly every question • becoming argumentative rather than analytical.

Marks: Accuracy & Ownership (3), Business Reasoning (3), Adaptability Under Challenge (2), Collective Team Ownership (2).`,
      progressionRule:
        "First tie-break criterion. Final team score = Stage 1 + 2 + 3 + 4 + 5 + 6 = 100 marks; half-marks may be used, and no stage total can exceed its published weightage.",
    },
  ],

  rubrics: [
    {
      isPublic: true,
      criteria: [
        { name: "Market Need & Opportunity Identification", weight: 15 },
        { name: "Creative & Innovative Microbusiness Model", weight: 25 },
        { name: "Market Analysis & Customer Validation", weight: 15 },
        { name: "Financial Contribution, Costing & Timeline", weight: 20 },
        { name: "10-Minute Business Model Presentation", weight: 15 },
        { name: "Panel Q&A & Business Defense", weight: 10 },
      ],
      tieBreakRule:
        "In order: 1) Stage 6 Panel Q&A & Defense, 2) Stage 2 Creative & Innovative Microbusiness Model, 3) Stage 4 Financial Contribution and Feasibility, 4) Stage 3 Market Analysis. If still tied, the organizer may declare a shared rank or use a short pre-announced additional business-defense question scored by the calibrated panel.",
    },
  ],

  resources: [
    {
      type: "article",
      title: "The Microbusiness Model Pack — what you submit",
      content: `A. Business Model Summary — problem or need, target customer, solution, value proposition, delivery and operations, revenue logic and team roles. B. Market Analysis Sheet — target market, simple evidence of need, competitors and alternatives, estimated demand, proposed price logic. C. Finance & Contribution Sheet — proposed startup contribution or capital, major costs, price, expected unit economics and revenue assumptions, and simple viability logic. D. Timeline — key milestones from preparation to pilot or launch, with responsibility and target period. E. Pitch Deck — the file used for the 10-minute live presentation. F. Source / Evidence Record — any survey data, reference sources, quotations, price checks or external claims used.

Team rules: all three candidates must contribute meaningfully to research, planning and preparation. Assign working responsibilities such as Market Lead, Business Model/Operations Lead and Finance/Pitch Lead — these are preparation roles, not separate scoring categories. All three must understand the complete model and may be questioned on any part of it. Teacher and coordinator support may explain rules and provide general enterprise coaching but must not create the business model, market analysis, finance plan or pitch.`,
    },
    {
      type: "sample_task",
      title: "Market Need Toolkit and the Microbusiness Model Canvas",
      content: `Market need working questions — Problem: what repeated difficulty, inconvenience, cost, access gap or unmet preference exists? Customer: who experiences it most often? Evidence: what did we observe, ask, measure or verify? Current alternative: what do customers do now instead? Opportunity: what specific improvement could a small student business realistically provide?

Example need statement: "Many Grade 8 – O Level students use loose revision notes and repeatedly lose or replace weekly planning sheets. A compact reusable planning-and-note organization kit could reduce waste and make study materials easier to manage."

Model canvas blocks: Customer Segment (the first, most reachable group) • Problem / Need (the verified difficulty) • Value Proposition (why the customer should choose this) • Product / Service (core features, what is included and excluded) • Channel (how customers learn, order and receive it) • Key Activities (what the business must do consistently) • Key Resources (materials, tools, people, supplier or platform needs) • Revenue Logic • Cost Logic (main startup and unit costs) • Team Roles.`,
    },
    {
      type: "sample_task",
      title: "Market analysis and finance toolkits",
      content: `Market analysis methods and their outputs — Customer validation: a short neutral survey or interview, or an observed use problem → a count or percentage plus one stated limitation. Competitors and alternatives: compare 2–3 currently available options → a comparison matrix. Price check: record comparable prices or ask a willingness-to-pay range neutrally → a price range. Reachable market: estimate only the realistic school or local customer pool → a reachable customer estimate. Market conclusion: select the strongest initial segment and explain why → one short paragraph.

Finance sheet fields — proposed startup contribution or capital (PKR, a planning assumption only) • one-time startup costs (design, setup, tools, display) • estimated unit or service cost • proposed selling price • estimated contribution per unit (selling price minus variable cost) • pilot sales assumption (units over weeks) • estimated pilot revenue (price × units) • main risk • response or contingency.

Timeline columns: milestone, owner, target period, evidence of completion — covering validate need, finalise model, identify suppliers or resources, prepare prototype or mock-up, prepare launch materials, review finance assumptions, and final pitch rehearsal.`,
    },
    {
      type: "practice_question",
      title: "Panel Q&A question bank",
      content: `Need — what evidence would make you decide the problem is not large enough to pursue? Customer — why did you choose this segment first instead of another group? Innovation — what is genuinely new or better about your model? Competition — why would a customer switch from the current alternative? Finance — which cost assumption is most likely to change, and what happens if it rises? Price — how did you decide the proposed price is acceptable? Operations — what is the first operational bottleneck if orders increase? Risk — what could cause this business model to fail? Adaptation — if demand is half your estimate, what would you change first? Team ownership — which decision did your team disagree on, and how did you resolve it?

Rehearse with every member answering every type — the panel may direct any question to any member, and contradictory answers between members is a listed pitfall.`,
    },
    {
      type: "sample_task",
      title: "Worked example — \"ReNote Mini Kits\"",
      content: `An illustrative practice example created for the manual. It is not a live competition answer and must not be copied as a team's own business model.

Concept: a compact reusable study-planning kit — a small erasable weekly planner card, subject tabs and a durable note folder — responding to students who repeatedly replace loose planning sheets or lose small revision notes.

Stage 1 evidence: a short survey found 36 of 50 students had lost loose revision or planning sheets at least twice in the previous month; observation showed students carrying loose A4 sheets inside textbooks or bags without folders; the current alternative is buying new notebooks and folders or continuing with loose sheets.

Stage 2 model: target customer — Grade 8 to O Level students who regularly use revision schedules and loose notes. Value proposition — one compact kit keeps weekly planning and small revision notes organised and reusable. Differentiation — reusable planner surface plus replaceable tabs plus a lightweight folder as one simple kit. Channel — a school-approved preorder form and collection point during a pilot.

Stage 3 market: the pilot considers 150 students at one school, not the entire city. Alternative A is a basic plastic folder — cheaper but with no reusable planning feature. Alternative B is a notebook or planner — more writing space but a higher replacement cost and less compact. Comparable stationery bundles were observed around PKR 250–450, so the team tests acceptance near the lower-middle of that range, targeting students already using weekly study plans rather than every student.

Stage 4 finance (illustrative only, demonstrating calculation logic and not a recommendation to spend money): startup contribution PKR 6,000 for a small pilot batch and sample materials • estimated unit cost PKR 180 • proposed price PKR 300 • unit contribution PKR 120 before overhead • pilot assumption 30 kits • revenue if all 30 sell PKR 9,000 • direct unit cost for 30 PKR 5,400 • key risk: actual willingness to pay may be lower • response: test preorders before preparing the full quantity and reduce non-essential packaging if needed.

Stage 6 example defenses — "Why would students pay PKR 300 instead of buying a simple folder?" Compare the additional reusable planning value, but acknowledge price-sensitive customers may still prefer the cheaper alternative. "What if only 10 students preorder?" Reduce the pilot quantity, revisit unit cost and avoid preparing unsold stock before demand is clearer. "How do you know the survey is reliable?" Explain sample size and method, then acknowledge it represents one school group and should not be generalised too broadly.`,
    },
    {
      type: "article",
      title: "Collective marking versus individual portfolio evidence",
      content: `The competition result is one collective score and rank for the three-person team — all three receive the same VentureMinds result, and teamwork quality is assessed inside the business model, the live delivery and the defense.

Portfolio evidence works differently. Each student later records their real role, actions and evidence, and a student should not claim finance, market research or leadership actions they did not perform. Individual proficiency remains evidence-based and separate from event rank.

The judging panel is structured as: Judge 1 — Enterprise / Business Model (opportunity, value proposition, innovation, model coherence). Judge 2 — Market / Finance (market evidence, customer logic, costs, price, capital, feasibility). Judge 3 — Communication / Applied Reviewer (pitch clarity, team ownership, timeline, risk, Q&A reasoning). A Moderator or Chief Judge handles calibration, outliers, score completeness and result lock.`,
    },
  ],

  faqs: [
    {
      question: "Do we have to invest real money?",
      answer:
        "No. \"Financial contribution\" means the proposed startup capital requirement within your model and where that capital would come from. Students are never required to invest or risk personal money, and judges assess the quality and realism of the financial plan, not how much money a team has.",
    },
    {
      question: "How big is a team, and can members come from different schools?",
      answer:
        "Exactly 3 candidates, and all three normally represent the same registered school unless a future edition explicitly permits mixed-school teams. All three must contribute meaningfully and all three must be able to defend the complete model.",
    },
    {
      question: "Does the business have to be real and trading?",
      answer:
        "No. A model may be conceptual or pilot-ready — students are not required to trade commercially to participate. What is assessed is the quality of the need evidence, the model, the market analysis, the financial logic, the pitch and the defense.",
    },
    {
      question: "How are marks split between the submission and the live event?",
      answer:
        "75 marks come from the submitted Microbusiness Model Pack (Stages 1–4) and 25 from the live event — 15 for the 10-minute presentation and 10 for the panel defense. The single highest-weighted stage is the business model itself, at 25 marks.",
    },
    {
      question: "Can one team member do most of the presenting?",
      answer:
        "No. All three candidates must have meaningful speaking roles, and no candidate may be only the slide operator or a silent member. Team Delivery explicitly penalises one member dominating, and the panel may direct any Q&A question to any member.",
    },
    {
      question: "What if the panel finds a weakness in our assumptions?",
      answer:
        "Engage with it. Teams may acknowledge uncertainty, and a qualified answer is stronger than inventing data. Adaptability Under Challenge rewards recognising weaknesses and proposing sensible revisions without abandoning core logic unnecessarily — defending every assumption regardless is a listed pitfall.",
    },
    {
      question: "Do we each get an individual score?",
      answer:
        "No. All stage marks are awarded collectively and the same final score and rank apply to all three members. Individual competency evidence for a portfolio must separately reflect what each student actually did.",
    },
    {
      question: "What happens if we run over ten minutes?",
      answer:
        "The Chair or timekeeper stops the presentation at time, so you lose whatever you had not yet delivered — typically the closing case. Persuasiveness & Time Control specifically marks down an overtime or incomplete pitch.",
    },
  ],

  events: leagueDates("2026-11-04", "Pitch day — 10-minute presentation and panel defense", {
    activityNote: "The Microbusiness Model Pack must be submitted before the live pitch.",
  }),
};
