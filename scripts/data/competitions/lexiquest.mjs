// Extracted from MANUALS/MANUALS/LexiQuest_Competition_Manual_v1_0.docx
//
// The manual deliberately carries no calendar dates ("Calendar dates are
// intentionally kept outside this reusable manual"), so no activity date is
// scheduled until the organiser publishes one. Route 1 category and
// competencies follow the published catalogue (Live Performances).
import { leagueDates } from "./_shared.mjs";

export default {
  slug: "lexiquest",
  title: "LexiQuest",
  shortDescription:
    "The Spelling & Word Meaning Challenge: complete words with missing letters, then complete synonyms and antonyms, in two supervised written stages.",
  domain: "D2 – Communication & Public Expression",
  competencies: ["Interpretation", "Analytical Reasoning"],
  supportsIndividual: true,
  supportsTeam: false,
  status: "open",
  pathway: "live_response",
  image: null,
  manualVersion: "v1.0",
  manualFile: "LexiQuest_Competition_Manual_v1_0.docx",

  overview: `LexiQuest gives students an accessible opportunity to demonstrate precise spelling and word knowledge. Candidates use visible letter patterns and meaning clues to complete words, then distinguish similar and opposite meanings. A short, supervised format produces a marked response sheet that schools can use for targeted vocabulary feedback.

Every candidate works individually in two written stages: completing words with two missing letters, then completing synonyms or antonyms with one missing letter. Both stages contribute to a 100-mark result. There is no team entry and no elimination between stages — every participant attempts the complete challenge and receives a stage breakdown, including separate synonym and antonym results.

Divisions — LexiQuest Junior (Word Explorers) and LexiQuest Senior (Word Masters). Junior and senior papers differ in vocabulary difficulty; separate senior age bands have separate papers and rankings. No marks are awarded for speed, handwriting style, spoken delivery or presentation.

Vision: to help learners use vocabulary accurately and approach unfamiliar words with confidence and attention to meaning. Mission: to deliver an age-appropriate language challenge with clear instructions, objective marking and useful feedback on word completion, synonym knowledge and antonym knowledge.

Educational scope — LexiQuest is a written spelling and vocabulary challenge. It does not include oral spelling, pronunciation tests or speeches, and familiarity with a particular accent is not part of the assessment.

Competency alignment — C07 Written Communication (core skill: Vocabulary) is the primary alignment: evidence of vocabulary knowledge and accurate written word forms, not the whole competency. A visible correction made before submission can be conditional supporting evidence for C07 Editing. C01 Critical Thinking is a development opportunity only, and C04 Learning to Learn is conditional portfolio evidence from an optional post-result reflection. Do not award C06 or C08 credit simply because this is a language competition. A competition rank does not establish an overall competency proficiency level.`,

  eligibility: [
    {
      category: "primary",
      minGrade: "3",
      maxGrade: "5",
      notes:
        "LexiQuest Junior — Word Explorers. Individual participation. Junior paper and junior ranking. Session: 10-minute briefing, Stage 1 (20 items, 25 minutes, 40 marks), 5-minute supervised interval, Stage 2 (20 items, 25 minutes, 60 marks) — 65 minutes including briefing. Items use familiar school, home and everyday vocabulary with short, direct clues. Junior candidates may use pencil and erase corrections.",
    },
    {
      category: "middle",
      minGrade: "6",
      maxGrade: "8",
      notes:
        "LexiQuest Senior — Word Masters A. Individual participation. Senior A paper with its own separate ranking. Session: 10-minute briefing, Stage 1 (20 items, 20 minutes, 40 marks), 5-minute supervised interval, Stage 2 (20 items, 20 minutes, 60 marks) — 55 minutes including briefing. Adds common academic vocabulary and less familiar letter patterns.",
    },
    {
      category: "secondary",
      minGrade: "9",
      maxGrade: "10",
      notes:
        "LexiQuest Senior — Word Masters B (Grades 9–10 / O Level equivalent). Individual participation. Senior B paper with its own separate ranking — Senior A and B share the Word Masters title but are never combined in one ranking. Same timings as Senior A. Uses more nuanced meanings and concise sentence contexts.",
    },
  ],

  stages: [
    {
      stageNumber: 1,
      title: "Missing Letter Challenge",
      format: "20 words, each with exactly two single-letter blanks and a short definition or sentence clue",
      duration: "Junior 25 minutes / Senior A and B 20 minutes — 40 marks",
      taskDescription: `Purpose: candidates complete 20 words. Every word has exactly two missing letters and a short definition or sentence clue. A blank represents a single letter; all visible letters must remain unchanged. The stage measures accurate word completion supported by vocabulary knowledge.

Marking: 1 mark per correct letter in its correct position, maximum 2 per word. Only the inserted letters are marked. Capitalisation is ignored where meaning is unchanged. Multiple uncancelled letters in a blank earn zero for that blank. No negative marking.

Solved model — Question: g _ r d _ n. Clue: a place where flowers and plants grow. Answer: garden (missing letters a, e). Garden fits both the printed pattern and the clue. Two correct letters earn 2 marks; only "a" in the first blank earns 1 mark.

Student method: read the clue; inspect the complete letter pattern; think of a matching word; fill both blanks; reread the completed word against the clue. Work through the paper and revisit uncertain items within the allocated time.`,
      progressionRule:
        "No elimination — every candidate continues to Stage 2. All Stage 1 scripts are collected before the interval and candidates cannot return to Stage 1.",
    },
    {
      stageNumber: 2,
      title: "Meaning Match",
      format: "20 partially written words with one missing letter each — Part A: 10 synonyms, Part B: 10 antonyms",
      duration: "Junior 25 minutes / Senior A and B 20 minutes — 60 marks",
      taskDescription: `Purpose: candidates complete 20 partially written words, each with exactly one missing letter. The completed word must be a synonym or antonym of the provided word in the stated sense, and the instruction explicitly identifies which relationship is required.

Part A: 10 synonym items, 3 marks each (maximum 30). Part B: 10 antonym items, 3 marks each (maximum 30).

Scoring rule: award 3 marks only when the single inserted letter creates an accepted word matching both the fixed pattern and the required relationship; otherwise 0. There are no separate marks for spelling and meaning, and no partial or negative marks. A correctly spelled word with the wrong relationship is not a correct response.

Solved synonym model — Given word: HAPPY. Complete a synonym: g l _ d. Answer: glad (missing letter a).
Solved antonym model — Given word: GENEROUS. Complete an antonym meaning unwilling to share: s t _ n g y. Answer: stingy (missing letter i).

Student method: identify whether the question asks for similar or opposite meaning, read any sense or sentence clue, complete the letter pattern, then check the whole word and its relationship to the given word.`,
      progressionRule: "Final stage. Total = Stage 1 + Stage 2 synonyms + Stage 2 antonyms, out of 100.",
    },
  ],

  rubrics: [
    {
      isPublic: true,
      criteria: [
        { name: "Stage 1 letter completion (2 per item; 1 correct letter = 1)", weight: 40 },
        { name: "Stage 2 synonyms (3 per valid completion)", weight: 30 },
        { name: "Stage 2 antonyms (3 per valid completion)", weight: 30 },
      ],
      tieBreakRule:
        "Rank within each category by total score, then higher Stage 2 score, then more fully correct Stage 1 words. If still tied, award a joint rank (competition ranking, e.g. 1, 1, 3) — submission speed is never used. A candidate missing an entire stage is recorded as incomplete and not ranked against full two-stage entries.",
    },
  ],

  resources: [
    {
      type: "practice_question",
      title: "Junior solved practice — Stage 1 (Missing Letter Challenge)",
      content: `Each pattern has exactly two missing letters. Cover the answers, attempt the item, then compare the completed word with the clue. Each correct letter earns 1 mark.

1. g _ r d _ n — a place where flowers and plants grow → garden (a, e)
2. p _ n c _ l — a writing tool with a graphite centre → pencil (e, i)
3. r _ b b _ t — an animal with long ears that can hop → rabbit (a, i)
4. w _ n d _ w — a glass opening that lets light into a room → window (i, o)
5. b _ s k _ t — a container woven from strips of material → basket (a, e)
6. y _ l l _ w — the colour of a ripe lemon → yellow (e, o)
7. t _ a c h _ r — a person who helps students learn → teacher (e, e)
8. k _ t c h _ n — a room where food is prepared → kitchen (i, e)
9. l _ b r a _ y — a place where books can be borrowed → library (i, r)
10. p _ c t u _ e — a drawing, painting or photograph → picture (i, r)
11. m _ r k _ t — a place where goods are bought and sold → market (a, e)
12. f _ i e _ d — someone you like and trust → friend (r, n)
13. f _ m i _ y — a group of related people → family (a, l)
14. a _ i m _ l — a living creature such as a cat or horse → animal (n, a)
15. m _ r n i _ g — the early part of the day → morning (o, n)
16. b _ t t _ e — a container with a narrow neck for liquids → bottle (o, l)
17. p _ a n _ t — a large body that travels around a star → planet (l, e)
18. w _ n t _ r — the coldest season of the year → winter (i, e)
19. h _ a l t _ y — in good physical condition → healthy (e, h)
20. j _ u r n _ y — travel from one place to another → journey (o, e)`,
    },
    {
      type: "practice_question",
      title: "Junior solved practice — Stage 2 (Meaning Match)",
      content: `Items 1–10 require a synonym; items 11–20 require an antonym. Each pattern has one missing letter; each accepted completion earns 3 marks.

Synonyms: 1. HAPPY — g l _ d → glad (a) • 2. SMALL — t i _ y → tiny (n) • 3. QUICK — f a _ t → fast (s) • 4. BEGIN — s t _ r t → start (a) • 5. QUIET — s i l _ n t → silent (e) • 6. CLEVER — s m _ r t → smart (a) • 7. LARGE — b _ g → big (i) • 8. ANGRY — m _ d → mad (a) • 9. CLOSE — s h _ t → shut (u) • 10. SIMPLE — e a _ y → easy (s)

Antonyms: 11. HOT — c o _ d → cold (l) • 12. EARLY — l a _ e → late (t) • 13. FULL — e m _ t y → empty (p) • 14. CLEAN — d i _ t y → dirty (r) • 15. STRONG — w e _ k → weak (a) • 16. DARK — b r i _ h t → bright (g) • 17. OPEN — c l o _ e d → closed (s) • 18. KIND — c r _ e l → cruel (u) • 19. NEAR — f _ r → far (a) • 20. DRY — w _ t → wet (e)`,
    },
    {
      type: "practice_question",
      title: "Senior solved practice — Stage 1 (Missing Letter Challenge)",
      content: `Each pattern has exactly two missing letters; each correct letter earns 1 mark. Senior practice illustrates both Word Masters bands — live Senior B papers use a greater proportion of nuanced vocabulary.

1. r _ s i l i e _ t — able to recover after difficulty → resilient (e, n)
2. e _ i d e n _ e — information used to support a claim → evidence (v, c)
3. a _ c u r a _ e — correct and free from mistakes → accurate (c, t)
4. r _ l e v a _ t — closely connected to the matter discussed → relevant (e, n)
5. a _ b i t i o _ s — having a strong wish to achieve a goal → ambitious (m, u)
6. e _ s e n t i _ l — absolutely necessary → essential (s, a)
7. p _ r s u a _ e — to convince someone through reasons → persuade (e, d)
8. a _ a l y _ e — to examine something in detail → analyse (n, s)
9. c _ e d i b _ e — able to be believed or trusted → credible (r, l)
10. c _ h e r e _ t — logical and clearly connected → coherent (o, n)
11. c _ u t i o _ s — careful to avoid unnecessary risk → cautious (a, u)
12. d _ l i g e _ t — showing steady and careful effort → diligent (i, n)
13. a _ u n d a _ t — available in large quantities → abundant (b, n)
14. r _ l u c t a _ t — unwilling or hesitant to act → reluctant (e, n)
15. a _ a p t a b _ e — able to adjust to new conditions → adaptable (d, l)
16. e _ f i c i e _ t — working well with little wasted time or effort → efficient (f, n)
17. c _ r i o s i _ y — a strong desire to know or learn → curiosity (u, t)
18. c _ n s e q u e n _ e — a result of an action or event → consequence (o, c)
19. i _ d e p e n d e _ t — able to act without relying on others → independent (n, n)
20. p _ r s e v e r a n _ e — continued effort despite difficulty → perseverance (e, c)`,
    },
    {
      type: "practice_question",
      title: "Senior solved practice — Stage 2 (Meaning Match)",
      content: `Items 1–10 require a synonym; items 11–20 require an antonym. Each accepted completion earns 3 marks.

Synonyms: 1. BRIEF — c o n _ i s e → concise (c) • 2. ACCURATE — p r e _ i s e → precise (c) • 3. CAUTIOUS — c a r _ f u l → careful (e) • 4. ABUNDANT — p l e n _ i f u l → plentiful (t) • 5. RELUCTANT — u n w i _ l i n g → unwilling (l) • 6. DILIGENT — i n d u s _ r i o u s → industrious (t) • 7. FRAGILE — d e l i _ a t e → delicate (c) • 8. VITAL — e s s e _ t i a l → essential (n) • 9. RAPID — s w _ f t → swift (i) • 10. ASSIST — h e _ p → help (l)

Antonyms: 11. GENEROUS — s t i _ g y → stingy (n) • 12. EXPAND — c o n t _ a c t → contract (r) • 13. SCARCE — a b u n _ a n t → abundant (d) • 14. ANCIENT — m o d _ r n → modern (e) • 15. TEMPORARY — p e r m _ n e n t → permanent (a) • 16. OPTIMISTIC — p e s s i _ i s t i c → pessimistic (m) • 17. CONCEAL — r e v _ a l → reveal (e) • 18. RIGID — f l e x _ b l e → flexible (i) • 19. INCLUDE — e x c _ u d e → exclude (l) • 20. ACCEPT — r e j _ c t → reject (e)`,
    },
    {
      type: "article",
      title: "Worked scoring and feedback bands",
      content: `Worked scoring: Stage 1 has 16 fully correct words, 2 half-correct words and 2 incorrect words: (16 × 2) + (2 × 1) = 34. Stage 2 has 8 correct synonyms and 7 correct antonyms: (8 × 3) + (7 × 3) = 45. Final score = 34 + 45 = 79/100.

Event feedback bands — 85–100: highly accurate across the overall paper; examine the sub-scores for remaining gaps. 70–84: generally accurate with identifiable spelling or meaning gaps. 50–69: partial command; targeted practice needed across several item types. 0–49: foundational practice needed; review errors with the solved examples.

These are event feedback bands, not competency proficiency levels.`,
    },
  ],

  faqs: [
    {
      question: "Is LexiQuest an oral spelling bee?",
      answer:
        "No. It is a written spelling and vocabulary challenge. There is no oral spelling, pronunciation test or speech, and familiarity with a particular accent is not part of the assessment.",
    },
    {
      question: "Is anyone eliminated after Stage 1?",
      answer:
        "No. Every candidate completes both stages independently, and both contribute to the 100-mark result. There is no team entry and no elimination between stages.",
    },
    {
      question: "Do I get marks if only one letter is right?",
      answer:
        "In Stage 1, yes — each correct letter in its correct position earns 1 mark, up to 2 per word. In Stage 2, no — 3 marks are awarded only when the single inserted letter creates an accepted word that fits the pattern and the required synonym or antonym relationship.",
    },
    {
      question: "What can I bring and what is not allowed?",
      answer:
        "Bring your candidate confirmation and two suitable writing instruments; the supplied paper is the only working material. Dictionaries, phones, smartwatches, vocabulary lists, electronic translators, AI tools, spellcheck, prompts from adults or another candidate's responses are not allowed.",
    },
    {
      question: "Are the practice questions on the live paper?",
      answer:
        "No. The practice questions demonstrate the format only; the live papers use fresh, confidential items.",
    },
    {
      question: "How are ties broken?",
      answer:
        "By total score, then the higher Stage 2 score, then the number of fully correct Stage 1 words. If still tied, candidates share a joint rank. Speed is never used to break a tie.",
    },
    {
      question: "Can a result be reviewed?",
      answer:
        "Yes. A school coordinator or parent may request a key or total check within two working days of provisional results. Reviews are resolved before final awards are issued.",
    },
  ],

  events: leagueDates(null),
};
