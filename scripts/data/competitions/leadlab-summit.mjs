// Extracted from MANUALS/MANUALS/leadlab Summit Manual.docx
import { leagueDates } from "./_shared.mjs";

export default {
  slug: "leadlab-summit",
  title: "LeadLab Summit",
  shortDescription:
    "Student Senate / House bill-passage simulation: evidence, argument, speech, cross-question, rebuttal, amendment and vote.",
  domain: "Enterprise, Financial & Civic Development",
  supportsIndividual: true,
  supportsTeam: false,
  status: "open",
  manualVersion: "v1.1",
  manualFile: "leadlab Summit Manual.docx",

  overview: `LeadLab Summit is a school-based Senate / House simulation in which individual delegates from different schools are divided into two balanced benches — Government / In Favour and Opposition / Against — and debate one proposed Bill or Motion using evidence, structured speeches, argument, cross-questioning, rebuttal, amendments and a final House vote.

The assessment principle is the point of the whole design: the Bill may pass or fail by vote, but individual marks are awarded for the quality of evidence, argument, speaking, response, leadership, planning and House conduct. A delegate is not rewarded simply because their side wins.

The cycle runs: Bill release → Evidence → Argument → Speech → Cross-Question → Rebuttal → Amendment → Vote. Six assessed stages accumulate to one score out of 100 (15 + 15 + 20 + 20 + 20 + 10).

Delegates may not choose their side. Bench allocation is made by the organizer to keep each House balanced, and arguing an assigned position rather than a personal opinion is part of the leadership challenge.

Neutrality rule: "Government" and "Opposition" are competition bench labels only. Delegates do not represent real political parties or governments. Live Bills focus on school, youth, community, education, environment, technology or development policy suitable for the age category, and no specialist law or political-science background is required — the Bill dossier contains the essential context and evidence base.

Competency alignment — C26 Leadership and C27 Planning & Organization are the core competencies, with C28 Collaboration & Teamwork as supporting evidence only when the delegate actually coordinates, negotiates, contributes to an amendment or helps build a workable House position. Winning the vote does not prove any competency.

After scores are verified, the Chair selects one Best Delegate per ranked House using the published evidence-based criteria — independent of which bench won.`,

  eligibility: [
    {
      category: "middle",
      minGrade: "6",
      maxGrade: "8",
      notes:
        "Junior category — individual delegate entry, school registration preferred. Bench allocation is roughly 50% Government / In Favour and 50% Opposition / Against within each House, assigned by the organizer. No specialist law or political-science syllabus is required. Recommended pilot maximum is 100 delegates across about 4 Houses of 20–25. A recommended pilot registration fee per delegate applies — confirm the current figure on the portal, as the manual quotes both PKR 1,000 and PKR 1,500 in different sections.",
    },
    {
      category: "secondary",
      minGrade: "9",
      maxGrade: "10",
      notes:
        "Senior category — Grades 9–10 / O Level equivalent, individual delegate entry. Same bench model, House size and procedure as Junior, with age-appropriate Bill complexity. Delegates may not choose their side. Assessment does not reward accent — clarity, evidence and reasoning are what count.",
    },
  ],

  stages: [
    {
      stageNumber: 1,
      title: "Bill / Motion Analysis & Evidence Preparation",
      format: "Bill Analysis & Evidence Map",
      duration: "15 marks — cumulative 15% • about 25 minutes on the day",
      taskDescription: `Purpose: assess whether the delegate can understand the proposal, identify what would change if it became policy, distinguish evidence from assertion, and select information relevant to their assigned bench.

Guiding rules: read the exact Bill wording before researching arguments • restate the Bill in neutral language — what action, restriction, entitlement, funding, requirement or change is proposed? • identify the main stakeholders and likely direct and indirect effects • collect at least three relevant evidence points from traceable sources or the official dossier • distinguish facts, estimates, opinions and assumptions • deliberately look for evidence that could weaken your own assigned side, because strong leadership recognises inconvenient evidence • Government delegates should test whether the Bill is feasible and protected against risk, while Opposition delegates should test whether criticism is evidence-based and whether a workable alternative exists • record source name, title and enough identifying information for a judge or the Chair to verify the claim.

Common pitfalls: treating the title of the Bill as if it proves its benefits • collecting many facts that do not answer the policy question • using unsupported social-media claims as evidence • ignoring evidence that conflicts with the assigned side • attacking motives instead of analysing likely effects • confusing correlation, prediction and proven causal effect • arriving with a speech before understanding the Bill.

Marks: Bill Understanding (4), Evidence Relevance & Quality (4), Evidence Interpretation (4), Stakeholder & Risk Awareness (3).

The Bill and background dossier are normally released 3–5 days before the live session unless the organizer publishes an on-the-day model. Every delegate must maintain a short source list, may not fabricate evidence or present opinion as fact, and must retain individual authorship of their evidence sheet, argument brief and final note even where bench caucus is scheduled. Generative AI may not write or substantially rewrite a delegate's submissions or live speech.`,
      progressionRule: "Cumulative total after Stage 1: 15 marks. Judges award Advanced at roughly full criterion marks, Proficient about 80%, Developing about 60% and Emerging about 30%, with half-marks permitted.",
    },
    {
      stageNumber: 2,
      title: "Assigned Position & Argument Construction",
      format: "Position Brief plus Argument Map",
      duration: "15 marks — cumulative 30% • about 20 minutes on the day",
      taskDescription: `Purpose: assess whether the delegate can build a logical case for the assigned bench using claims, evidence, reasoning, counterargument and a clear legislative recommendation.

Guiding rules: write one clear thesis — PASS, SUPPORT WITH AMENDMENT or REJECT — consistent with your assigned bench • build two or three main arguments, each following Claim → Evidence → Reasoning → Impact • rank your arguments rather than presenting an unstructured list • prepare at least one counterargument you expect from the other bench plus your evidence-based response • Government delegates must explain feasibility, safeguards and implementation logic, while Opposition delegates must explain the cost, risk or gap and offer an alternative or amendment where practical • use different evidence for genuinely different claims rather than recycling one statistic as proof of everything • keep language respectful and challenge policy, evidence and reasoning, never the person • prepare one sentence explaining what evidence could make you revise your position.

Common pitfalls: using slogans instead of reasoning • repeating the same point in different words • citing evidence without explaining why it supports the claim • absolute claims such as "always" or "never" without strong evidence • ignoring the strongest argument from the other bench • Government refusing any amendment, or Opposition rejecting everything without an alternative • building an argument around personal belief rather than the assigned role and the evidence.

Marks: Thesis & Position Clarity (3), Argument Structure (4), Counterargument & Rebuttal Planning (4), Feasibility / Alternative Logic (4).`,
      progressionRule: "Cumulative total after Stage 2: 30 marks.",
    },
    {
      stageNumber: 3,
      title: "Opening House Speech",
      format: "Live speech before the House, addressed to the Chair, with a speaking-note card",
      duration: "20 marks — cumulative 50% • recommended 2 minutes per delegate",
      taskDescription: `Purpose: assess the delegate's ability to communicate an evidence-based legislative argument clearly and persuasively before the House.

Guiding rules: recommended speech time is 2 minutes per delegate (the organizer may publish 90 seconds for larger Houses, but one standard applies to all) • address the Chair, not the opposing delegate personally • open with your position on the Bill and the most important reason • use at least one traceable evidence point and explain its significance • build around two or three coherent arguments, not a list of facts • acknowledge one real trade-off or limitation where appropriate • conclude with a clear legislative request — pass, reject or amend • you may use a note card but should not read a complete essay word for word.

Speaking marks reward clarity, structure, evidence, reasoning and audience engagement. Accent, volume and theatrical style alone earn nothing.

Common pitfalls: reading a prepared essay without engaging the House • dramatic claims with no source or reasoning • speaking too fast to fit too much content • attacking the other bench or school • giving evidence but no argument • repeating the Bill wording instead of analysing it • finishing without stating what the House should do.

Recommended speech plan: opening 15–20 seconds to address the Chair and state PASS / REJECT / AMEND with your strongest reason • Argument 1 (claim plus one evidence point plus why it matters) • Argument 2 (a second distinct claim with evidence and reasoning) • a trade-off or opposing concern acknowledged • a clear closing legislative request.

Marks: Argument & Evidence (6), Speech Structure & Clarity (5), Delivery & House Presence (4), Leadership Judgment (5).`,
      progressionRule: "Cumulative total after Stage 3: 50 marks. The Chair alternates benches in the published speaking order.",
    },
    {
      stageNumber: 4,
      title: "Cross-Questioning, Response & Rebuttal",
      format: "Live questioning and answering under Chair control, scored from the question and response record",
      duration: "20 marks — cumulative 70% • approximately 45–60 minutes per House",
      taskDescription: `Purpose: assess active listening, quality of questioning, evidence-based response, rebuttal and the ability to defend or qualify a position under challenge.

Guiding rules: the Chair recognises speakers and there is no shouting across benches • questions should challenge evidence, assumptions, feasibility, fairness, cost, implementation or likely impact • ask one clear question at a time, and never let a question become a disguised speech • respond directly before adding explanation, following Answer → Evidence → Reason → Qualification/Rebuttal • you may concede a valid point or narrow a claim, and honest revision can score better than defensive repetition • where an opposing delegate misstates your claim, correct it briefly and return to the substance • use rebuttal to answer the strongest opposing argument rather than launching an unrelated new speech • no personal remarks, mockery, discriminatory language, intimidation or deliberate interruption.

Common pitfalls: vague questions such as "Why is your idea bad?" • giving a long statement instead of a question • avoiding the question and repeating your opening speech • responding emotionally rather than with evidence • misquoting another delegate • treating concession or qualification as weakness • using an aggressive tone to appear confident.

Marks: Cross-Question Quality (5), Directness & Listening (4), Evidence-Based Response (6), Rebuttal & Conduct (5).`,
      progressionRule: "Cumulative total after Stage 4: 70 marks. Stage 4 and Stage 5 scores are the Chair's first comparison when two delegates are close for Best Delegate.",
    },
    {
      stageNumber: 5,
      title: "House Debate, Amendment & Negotiation",
      format: "Open House debate with a defined amendment window, scored from the Amendment / Negotiation Record and observed contribution",
      duration: "20 marks — cumulative 90% • approximately 35–45 minutes",
      taskDescription: `Purpose: assess whether a delegate can move beyond fixed advocacy into legislative problem-solving — proposing or testing amendments, negotiating priorities, building support, and improving or defending the Bill while preserving principled reasoning.

Guiding rules: the Chair opens a defined amendment and debate window after cross-questioning • any delegate may submit a concise amendment if it is relevant to the Bill and does not replace the entire motion with a different topic • an amendment must state the exact change and why it improves feasibility, fairness, evidence alignment or protection against risk • Government may accept, reject or modify an amendment with reasons, and Opposition may support an amendment while remaining against the Bill overall • delegates may negotiate across benches, but deals must concern the substance of the Bill — never personal rewards, school alliances or unrelated promises • where the Chair releases a new constraint or update, delegates must visibly adapt their case or explain why no change is required • leadership includes listening, prioritising and building a workable path, and is not measured by speaking frequency • accepted amendments are read back by the Chair before the final vote.

Common pitfalls: proposing amendments unrelated to the Bill • changing wording without changing policy effect • refusing every compromise to look "strong" • agreeing to every suggestion without protecting core reasoning • building school-based voting blocs unrelated to the evidence • speaking repeatedly without helping the House reach a clearer decision • ignoring new information released by the Chair.

Marks: Amendment / Policy Improvement (5), Negotiation & Collaboration (5), Adaptability & Judgment (5), House Leadership & Conduct (5).`,
      progressionRule: "Cumulative total after Stage 5: 90 marks. This is the stage where the supporting C28 Collaboration & Teamwork evidence is actually generated.",
    },
    {
      stageNumber: 6,
      title: "Final Position, House Vote & Accountability Note",
      format: "A 45–60 second final statement, the recorded vote, and a short final position note",
      duration: "10 marks — cumulative 100% • approximately 20–30 minutes",
      taskDescription: `Purpose: assess whether the delegate can integrate the debate, amendments and evidence into an accountable final judgment immediately before the House votes.

Guiding rules: the Chair reads the final Bill text including accepted amendments before final statements and voting • give a concise final statement explaining your final recommendation and strongest reason • you may retain or revise your original position, but any change must be explained from evidence, amendment or debate, never convenience • the vote is recorded as AYE / In Favour, NO / Against, or ABSTAIN where permitted • the Bill passes on a simple majority of valid AYE and NO votes unless another threshold is published, with abstentions excluded from the denominator, and a tied vote means the Bill does not pass • your final note records the vote, the key evidence, the most important amendment or issue, and one accountability or monitoring point if the Bill passes — or one alternative recommendation if it fails.

No stage marks are awarded merely because a delegate voted with the winning side.

Common pitfalls: changing your vote only to join the expected majority • a final speech that ignores accepted amendments • claiming the vote result proves the policy is objectively correct • voting one way while the final note argues the opposite without explanation • using victory or defeat language against other delegates instead of closing the decision responsibly.

Marks: Final Judgment & Consistency (3), Evidence & Amendment Integration (3), Accountability / Alternative (2), Final House Conduct (2).`,
      progressionRule:
        "Cumulative total: 100 marks. The Chair announces the PASS/FAIL result only after votes are verified, then — after score verification — announces Best Delegate and any approved distinctions.",
    },
  ],

  rubrics: [
    {
      isPublic: true,
      criteria: [
        { name: "Bill & Evidence Analysis", weight: 15 },
        { name: "Position & Argument Building", weight: 15 },
        { name: "Opening House Speech", weight: 20 },
        { name: "Cross-Question & Rebuttal", weight: 20 },
        { name: "House Debate, Amendment & Negotiation", weight: 20 },
        { name: "Final Position, Vote & Accountability", weight: 10 },
      ],
      tieBreakRule:
        "For Best Delegate, where two delegates are exceptionally close the Chair compares Stage 4 plus Stage 5 scores first, then Stage 1 evidence quality. A co-Best Delegate result is permitted only if organizer policy allows it in advance. The Chair must not select on popularity, school reputation, speaking volume, the winning bench, personal agreement with the delegate's position, or one dramatic speech alone.",
    },
  ],

  resources: [
    {
      type: "article",
      title: "Official House procedure — the twelve-step session",
      content: `1. Call to order and attendance — the Chair opens the session, confirms quorum and explains timing and procedure. 2. Bill reading — the Chair or Clerk reads the official Bill title, purpose and operative clauses neutrally. 3. Stage 1–2 evidence and argument preparation — delegates complete individual documents; bench caucus only if scheduled. 4. Government / In Favour opening speeches in the published order. 5. Opposition / Against opening speeches. 6. Cross-questioning and rebuttal, with the Chair alternating benches and controlling timing. 7. Open House debate, with the Chair alternating benches as fairly as practicable. 8. Amendments — written amendments submitted, the Chair checks relevance, and selected amendments are debated and accepted or rejected. 9. Final statements. 10. Final Bill reading, so the voting text is clear. 11. Vote — AYE / NO / ABSTAIN recorded and verified before announcement. 12. Bill result and Best Delegate announced.

Roles — Chair of the House: neutral presiding authority, not a competing delegate; controls procedure, speaking order, time, admissibility of questions and amendments, conduct, the vote and Best Delegate selection. Judge 1 — Evidence & Argument. Judge 2 — Leadership & Communication. Clerk / Score Officer: speaking order, amendment log, vote record, time record and score sheet. Moderator / Chief Judge: calibration, outliers, scoring anomalies and ranking confirmation.`,
    },
    {
      type: "sample_task",
      title: "The worked practice Bill — School Digital Focus & Smartphone Responsibility Bill 2026",
      content: `A fictional training Bill used to teach the method — the live Bill, data and arguments will be different.

Practice proposal: during formal lesson periods, students may use smartphones only when a teacher authorises them for a learning activity. Schools must provide a secure storage or management procedure and an emergency-contact route. The Bill allows controlled access during designated non-lesson times. The purpose is to reduce distraction while preserving legitimate learning and safety uses.

Stage 1 Evidence Map worked through — What changes if passed? Teacher-authorised lesson use replaces unrestricted personal lesson-time use; storage and emergency-contact procedures become required. Who is affected? Students, teachers, parents, school leaders, IT and support staff, and students needing accessibility or medical accommodations. Evidence supporting the Bill: dossier research on distraction, attention or classroom management. Evidence challenging it: evidence on educational use, family contact, implementation burden, accessibility and inconsistent enforcement. Unknowns: how often phones currently disrupt lessons, storage cost, the emergency process, accommodation needs. Source record: title, author, organization, date or URL for every important external claim.`,
    },
    {
      type: "sample_task",
      title: "Argument builder — the same Bill from both benches",
      content: `Government / In Favour — Thesis: pass with clear implementation safeguards. Claim 1: lesson-time distraction requires a consistent rule. Evidence: dossier research showing interruption and attention concerns. Reasoning: consistent teacher-controlled use balances access and focus. Counterargument handled: emergency and access needs can be protected through explicit exceptions. Recommendation: pass, or support with amendment.

Opposition / Against — Thesis: reject as drafted unless implementation and access protections are strengthened. Claim 1: a blanket control may remove legitimate learning and access functions. Evidence: dossier evidence on educational use, emergency access or accommodations. Reasoning: the policy effect depends on implementation, and overly broad restrictions can create new problems. Counterargument handled: consistency benefits could be achieved through narrower teacher-led rules rather than mandatory storage. Recommendation: reject, or amend before passage.

Note how both benches use the same dossier — the difference is which evidence is prioritised and how the trade-offs are weighed, not who has access to better facts.`,
    },
    {
      type: "practice_question",
      title: "Cross-question and rebuttal toolkit",
      content: `Question stems to practise: What evidence supports your claim that ___? How would your proposal affect ___ stakeholder? What would happen if your assumption about ___ is wrong? How will the school implement this without ___? Why is your evidence stronger than the evidence showing ___? Would you accept an amendment that ___ — why or why not?

Response method: DIRECT ANSWER → EVIDENCE → REASON → QUALIFY / REBUT.

Worked example: "Yes, I would support an emergency-access amendment. The purpose of the Bill is to reduce lesson-time distraction, not prevent legitimate safety contact. A defined emergency route protects that need without returning to unrestricted lesson use."

Notice what that answer does: it concedes cleanly, restates the principle, and shows why the concession does not damage the core case. Honest revision scores better than defensive repetition.`,
    },
    {
      type: "sample_task",
      title: "Amendment & negotiation sheet, and the final vote note",
      content: `Amendment sheet fields: the clause or issue to change (identify the exact part of the Bill) • the proposed amendment (the precise change in one or two sentences) • evidence and reason (why does this improve fairness, feasibility, evidence alignment or risk protection?) • your non-negotiable principle (what must remain for you to support your final position?) • your flexible point (what can you accept or revise?) • agreement reached (record the accepted wording, or why no agreement was reached).

Practice amendment example: add an explicit exception requiring schools to provide a documented accommodation process for students who need phone access for verified medical, accessibility or emergency reasons.

Final position note fields: final vote (AYE / NO / ABSTAIN) • final reason (strongest evidence-based reason) • what changed (one amendment, cross-question or evidence point that strengthened, weakened or qualified your original position) • if the Bill passes, one implementation or accountability indicator to monitor • if it fails, one alternative action or revised Bill direction worth considering.`,
    },
    {
      type: "article",
      title: "Final delegate checklist",
      content: `I understand the exact Bill text and can explain what changes if it passes • my evidence is traceable and I know its limitations • I can argue my assigned side even if it is not my personal view • my main arguments follow Claim → Evidence → Reason → Impact • my speech has a clear legislative request and is not only a performance • I can ask concise questions and respond directly with evidence • I can negotiate or accept an amendment without abandoning principled reasoning • I know the final amended Bill text before I vote • my final vote and note are consistent, or any change in position is explained • I will respect the Chair, other delegates and House procedure throughout.

Event-day timings: check-in and seating 30 min • call to order and Bill reading 10 min • Stage 1 evidence analysis 25 min • Stage 2 argument building 20 min • Stage 3 opening speeches 45–60 min per House • Stage 4 cross-question and rebuttal 45–60 min • Stage 5 debate and amendments 35–45 min • Stage 6 final statements and vote 20–30 min • moderation and Best Delegate review • recognition 15 min.`,
    },
  ],

  faqs: [
    {
      question: "Can I choose which side I argue?",
      answer:
        "No. The organizer allocates Government / In Favour and Opposition / Against to keep each House balanced, and arguing an assigned position rather than your personal opinion is an explicit part of the leadership challenge. Building an argument around personal belief instead of the assigned role is a listed pitfall.",
    },
    {
      question: "If my side loses the vote, do I lose marks?",
      answer:
        "No. The Bill outcome is a House result, not an individual mark, and no stage marks are awarded merely because a delegate voted with the winning side. Best Delegate is also selected independently of which bench won.",
    },
    {
      question: "When do we get the Bill?",
      answer:
        "Normally 3–5 days before the live House session, along with a background dossier, unless the organizer publishes an on-the-day model. You may research independently beforehand using books, reputable websites and reports, but you must keep a source list so important claims stay traceable.",
    },
    {
      question: "Is it a weakness to concede a point?",
      answer:
        "The opposite. You may concede a valid point or narrow a claim, and honest revision can score better than defensive repetition — Adaptability & Judgment specifically rewards revising priorities intelligently after new evidence and explaining why the change improves the decision.",
    },
    {
      question: "Do I represent a real political party?",
      answer:
        "No. \"Government\" and \"Opposition\" are competition bench labels only. Bills focus on school, youth, community, education, environment, technology or development policy, and no specialist law or political-science background is needed.",
    },
    {
      question: "Can I use AI to prepare?",
      answer:
        "AI may not write or substantially rewrite your competition submissions or live speech. You must also never fabricate evidence or present opinion as fact, and every delegate retains individual authorship of their evidence sheet, argument brief and final note.",
    },
    {
      question: "How is Best Delegate chosen?",
      answer:
        "By the Chair, after reviewing the verified 100-mark score and the Chair Observation Sheet, based on consistent evidence use, argument quality, clear speaking and direct response, and genuine improvement of House decision-making. The Chair must not select on popularity, school reputation, speaking volume, winning bench, personal agreement with your position, or one dramatic speech.",
    },
    {
      question: "What happens if the vote is tied?",
      answer:
        "The Bill does not pass. The Chair remains neutral and does not use Best Delegate discretion to determine the Bill outcome. Abstentions, where permitted, are not counted in the denominator for the majority.",
    },
  ],

  events: leagueDates("2026-11-05", "House session — speeches, cross-questioning, amendments and the final vote", {
    activityNote: "The Bill and background dossier are normally released 3–5 days before the session.",
  }),
};
