// Extracted from MANUALS/MANUALS/PixelProof_Environmental_Photography_Voting_Competition_Manual_v1_1_Easy_Guide.docx
import { leagueDates } from "./_shared.mjs";

export default {
  slug: "pixelproof",
  title: "PixelProof",
  shortDescription:
    "Environmental photography and public voting challenge: see a problem, capture a message, share responsibly, engage the public.",
  domain: "Digital Media Creation & Environmental Responsibility",
  supportsIndividual: true,
  supportsTeam: false,
  status: "open",
  pathway: "project_showcase",
  image: "/competitions/pixelproof.jpg",
  manualFile: "PixelProof_Environmental_Photography_Voting_Competition_Manual_v1_1_Easy_Guide.docx",
  manualVersion: "v1.1",

  overview: `PixelProof is an environmental photography and public voting challenge. Each candidate submits ONE original photograph plus a short caption showing a clear environmental problem, concern or responsible environmental action. Approved entries are published on the official League Facebook Page and website, and candidates then campaign for verified public votes during a fixed voting period.

PixelProof is not just "take a nice photo." The photograph must carry a clear environmental message — a beautiful image with no clear environmental meaning should not score highly.

Scoring is out of 100: 80 marks from judges (environmental message, visual quality, originality, digital responsibility) plus 20 marks from verified public voting on the official website. Vote marks are relative: (candidate verified votes ÷ highest verified votes in the same category) × 20. A separate People's Choice Award goes to the highest verified vote total in each category.

Why votes are capped at 20 marks: the main League result must still reward photography, message, originality and responsible digital use. If votes decided the whole result, students with larger follower networks would hold an unfair advantage — so public voting gets its own strong recognition instead through People's Choice.

Competencies: C19 Digital Media Creation (core), with C16 Digital Literacy and C20 Information & Media Literacy as supports, and C38 Environmental Responsibility credited when a genuine environmental issue is clearly demonstrated. Votes, likes and awards are achievements — they do not by themselves prove competency.

Why schools choose it: a normal smartphone camera is enough, it suits students who do not prefer speech or written competitions, and it builds creativity, digital citizenship and environmental awareness together under controlled social-media rules.`,

  eligibility: [
    {
      category: "middle",
      minGrade: "6",
      maxGrade: "8",
      notes:
        "Junior category — individual entry, one final photograph. Junior entries are voted, judged and awarded in their own separate pool. Judging expectation: a clear, direct message with good basic technical control.",
    },
    {
      category: "secondary",
      minGrade: "9",
      maxGrade: "10",
      notes:
        "Senior category — Matric / O Level equivalent, individual entry, one final photograph. Senior entries are voted, judged and awarded in their own separate pool. Judging expectation: greater depth, visual control and independent judgement.",
    },
  ],

  stages: [
    {
      stageNumber: 1,
      title: "Create & Submit the Entry",
      format: "One original environmental photograph, a 20–50 word caption and an originality declaration",
      duration: "7–10 days of photo creation, then 1–2 days of submission review",
      taskDescription: `Choose one real environmental problem or responsible environmental action to show, take the photograph yourself during the competition period, and keep the original camera or smartphone file. Then submit the original file, the final image, the caption and the originality declaration.

Directions that work well: waste and plastic (litter, poor waste separation, unnecessary single-use plastic, reuse) • water (wastage, leaking taps, conservation, a safe view of pollution) • energy (unnecessary lights or equipment, an energy-saving action) • air and the city environment (haze, dust, traffic emissions from a safe position, green-space contrast) • biodiversity (habitat pressure, tree or plant protection, responsible coexistence) • green school or city (loss of greenery, restoration, shade, campus improvement).

Originality rules: no downloaded, stock, copied or AI-generated images; no screenshots of another person's work; no combining different photographs into one image; and never create pollution, litter or damage just to make a stronger photograph.

Editing must stay truthful. Allowed: crop and straighten, brightness and exposure correction, reasonable contrast and white balance, small sharpening or noise reduction, and black-and-white conversion if declared. Not allowed: adding or removing objects, AI generative fill, replacing the sky or background, adding fake smoke, litter, water or people, or any edit that changes the environmental facts.

Caption: 20–50 words explaining what the image shows and why it matters. Do not exaggerate or make an unsupportable factual claim; if you use a statistic, provide the source in the submission form; never include personal phone numbers, addresses or private account details.

Safety comes before the photograph. Do not enter traffic, railway areas, rooftops, construction zones, drains or polluted water; do not touch unknown waste, chemicals or medical waste; do not climb, trespass or cross barriers for a better angle; do not disturb wildlife, nests or plants. Prefer scenes without identifiable people — where an identifiable person is essential, appropriate permission is required before submission, and organizer-approved parent/guardian consent is required for an identifiable minor.`,
      progressionRule:
        "Nevigation checks originality, safety and technical compliance. Approved entries proceed to publication and voting; incomplete, unsafe or non-original entries may be rejected before publication.",
    },
    {
      stageNumber: 2,
      title: "Publication & Verified Public Voting",
      format: "Official publication on the League Facebook Page and website, then a public voting campaign",
      duration: "7-day voting campaign, followed by a 1-day vote audit",
      taskDescription: `Approved photos are posted on the official League Facebook Page, and the same Entry Code and photo appear on the League website. The Facebook post directs viewers to the official website voting page — the website vote total is what counts for scoring, because website voting can be verified and audited to remove duplicate, fake or automated votes.

Allowed campaign methods: share the official post or official voting link; ask your school or parent/guardian to share it; use school newsletters, noticeboards or approved school groups; explain the environmental message when asking for support; send a limited number of respectful reminders during the voting period.

Not allowed: buying votes, followers or reactions; using bots, scripts, fake accounts or repeated identities; offering money, gifts, prizes, grades or favours for votes; spam messaging or repeatedly contacting someone who has said no; publishing a student's private phone number or address to collect votes; misleading people about the competition or attacking another candidate.

Verified vote rules: one person, one verified vote per category according to the published platform rule. Voting opens and closes at fixed times and late votes are not counted. Duplicate, automated, purchased or suspicious votes may be removed after audit. Junior and Senior vote totals are calculated separately.

Use your Entry Code on public competition posts instead of personal contact details.`,
      progressionRule:
        "After the audit closes vote totals, judges' 80 marks and the website's 20 vote marks are combined into a final score out of 100. Top and unusual scores are moderated before results are published.",
    },
  ],

  rubrics: [
    {
      stageNumber: 2,
      isPublic: true,
      criteria: [
        { name: "Environmental Message & Content", weight: 30 },
        { name: "Photographic / Visual Quality", weight: 25 },
        { name: "Originality & Relevance", weight: 15 },
        { name: "Digital Responsibility & Media Integrity", weight: 10 },
        { name: "Verified Public Vote", weight: 20 },
      ],
      tieBreakRule:
        "In order: 1) Environmental Message & Content, 2) Photographic / Visual Quality, 3) Originality & Relevance, 4) Digital Responsibility & Media Integrity, 5) higher verified vote total, 6) Chief Judge blind review.",
    },
  ],

  resources: [
    {
      type: "article",
      title: "The 6-step preparation method — OBSERVE → CHOOSE → PLAN → CAPTURE → SELECT & EDIT → CAPTION & CAMPAIGN",
      content: `1. OBSERVE — look for a real environmental issue around you. 2. CHOOSE — select ONE clear message. 3. PLAN — decide subject, angle, distance, light and a safe position. 4. CAPTURE — take several original photos without creating risk. 5. SELECT & EDIT — choose your strongest image and make only permitted corrections. 6. CAPTION & CAMPAIGN — write the caption and prepare a respectful sharing plan.

Photo planning sheet: What environmental issue or action will I show? What will be the main subject? What should viewers notice first? Best angle, distance and time of day? Any safety or permission concern? My one-sentence message. My 20–50 word caption.`,
    },
    {
      type: "article",
      title: "Before you submit — the 8 checks",
      content: `1. I took the photo myself. 2. The environmental message is visible in the image, not only in the caption. 3. I kept the original file. 4. I did not add or remove objects. 5. I did not use generative AI. 6. I have any needed consent. 7. My caption is accurate. 8. I am submitting the correct category and Entry Code.

Submission declaration statements you will confirm: I took this photograph myself • I kept the original file • I used only permitted editing • I did not use AI-generated or composite content • required consent is available where needed • my caption is accurate and any factual source is recorded.`,
    },
    {
      type: "article",
      title: "How the 80 jury marks are broken down",
      content: `Environmental Message & Content (30) — environmental issue is clear (12: can the viewer identify the issue or action without a long explanation?), photo–message connection (10), environmental significance (8: does the work encourage awareness and responsibility?).

Photographic / Visual Quality (25) — composition and framing (8: subject placement, background, viewpoint, visual balance), lighting and exposure (5), focus and technical control (5), visual storytelling (7: the image holds attention and communicates an idea).

Originality & Relevance (15) — original idea or perspective (8: personal observation, not a copied concept), relevance and authenticity (4), caption quality (3).

Digital Responsibility & Media Integrity (10) — privacy and consent (4), editing integrity (3), accuracy and source responsibility (3).

Judges are instructed not to reward expensive cameras for their own sake — a smartphone photo can win if the message and visual storytelling are stronger — and not to use follower count as a quality judgement, since public engagement already has its own 20-mark component.`,
    },
    {
      type: "practice_question",
      title: "How the 20 vote marks are calculated",
      content: `Vote marks = (candidate verified votes ÷ highest verified votes in the same category) × 20.

Worked example — if the highest verified total in the category is 1,000 votes: that candidate scores 20.00. A candidate with 750 votes scores 15.00. With 500 votes, 10.00. With 250 votes, 5.00.

People's Choice is separate from the main ranking: the candidate with the highest verified vote total in each category receives the People's Choice Award regardless of where they place on the 100-mark table.`,
    },
    {
      type: "article",
      title: "Campaign planner",
      content: `Plan these before voting opens: your Entry Code • the official voting link • your main environmental message • a school-approved sharing channel • a parent/guardian-supported channel • your launch message • your final-day reminder • and specifically how you will avoid spam and pressure.

Remember the campaign itself is assessed indirectly through Digital Responsibility & Media Integrity — respectful, honest promotion is part of the competition, not separate from it.`,
    },
  ],

  faqs: [
    {
      question: "Do I need a professional camera?",
      answer:
        "No. A normal smartphone camera is enough, and judges are explicitly instructed not to reward expensive equipment for its own sake. A smartphone photo can win if the message and visual storytelling are stronger.",
    },
    {
      question: "How much of my score comes from votes?",
      answer:
        "20 out of 100. Judges award the other 80 for environmental message, visual quality, originality and digital responsibility. Vote marks are relative to the highest verified total in your own category — Junior and Senior pools are counted separately.",
    },
    {
      question: "Can I edit my photo?",
      answer:
        "Only within the truthful-editing rules: crop and straighten, brightness and exposure correction, reasonable contrast and white balance, small sharpening or noise reduction, and black-and-white conversion if declared. Adding or removing objects, AI generative fill, replacing the sky or background, or anything that changes the environmental facts is prohibited.",
    },
    {
      question: "Can I use an AI-generated image?",
      answer:
        "No. The registered student must take the photograph themselves during the competition period and keep the original file. Downloaded, stock, copied, composite and AI-generated images are all disqualified.",
    },
    {
      question: "Do Facebook likes count as votes?",
      answer:
        "No. Facebook is the public campaign and display channel, but only the official website vote count — after audit — is used for the 20 vote marks and the People's Choice Award, because website voting can be verified against duplicates and bots.",
    },
    {
      question: "What happens if someone buys votes?",
      answer:
        "Duplicate, automated, purchased or suspicious votes are removed during the vote audit, and suspicious spikes are reviewed before totals are locked. Buying votes, using bots or fake accounts, and offering rewards for votes are all explicit violations of the campaign rules.",
    },
    {
      question: "Can there be people in my photo?",
      answer:
        "Prefer environmental scenes without identifiable people. If an identifiable person is essential to the photo, appropriate permission is required before submission, and organizer-approved parent/guardian consent is required for an identifiable minor. Never photograph people in embarrassing, vulnerable or private situations.",
    },
    {
      question: "What is People's Choice, and is it the same as winning?",
      answer:
        "No — it is a separate award. Junior 1st/2nd/3rd and Senior 1st/2nd/3rd are decided by the final moderated score out of 100, while People's Choice goes to the highest verified vote total in each category.",
    },
  ],

  events: leagueDates("2026-12-05", "Displayed at the finale", {
    workDeadline: true,
    activityNote: "Submit your original photograph and caption in advance; the curated display runs across both finale days, 5–6 December.",
  }),
};
