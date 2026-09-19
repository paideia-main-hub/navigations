// Extracted from MANUALS/MANUALS/Product_Pulse_Digital_Poster_Product_Launch_Competition_Manual_v1_0.docx
import { leagueDates } from "./_shared.mjs";

export default {
  slug: "product-pulse",
  title: "Product Pulse",
  shortDescription:
    "Digital product launch poster competition built in Canva: understand, position, design, communicate, export, submit, engage.",
  domain: "Digital Media Creation & Design",
  supportsIndividual: true,
  supportsTeam: false,
  status: "open",
  manualFile: "Product_Pulse_Digital_Poster_Product_Launch_Competition_Manual_v1_0.docx",
  manualVersion: "v1.0",

  overview: `Product Pulse is a digital poster-making challenge. The organizer releases an official product-launch brief; each candidate designs a launch poster in Canva that convinces the intended audience to notice, understand and want to explore the product.

The challenge is not simply to make a beautiful poster. Students must communicate a new product clearly: What is it? Who is it for? Why should the audience care? What makes the launch memorable? The best poster combines a catchy statement, creative design, a clear product message and strong audience engagement.

The rule to remember is the 5-second test — within a few seconds a viewer should be able to notice the poster, identify the product, understand its key benefit and remember the main launch message.

Final submission: one digital poster, a short product brief, a Canva view-only verification link and an originality declaration, all submitted through the League website. Assessment is out of 100, with Junior and Senior ranked separately.

Competencies: C19 Digital Media Creation is the core, supported by C16 Digital Literacy, C20 Information & Media Literacy, C23 Design & Aesthetic Thinking and C25 Creative Communication. C29 Entrepreneurship is credited only where value proposition and product positioning are genuinely demonstrated. Competition rank does not automatically equal a competency level — evidence comes from the poster, the design choices, responsible digital use and the product-message reasoning.`,

  eligibility: [
    {
      category: "middle",
      minGrade: "6",
      maxGrade: "8",
      notes:
        "Junior category — individual entry, poster created in Canva. The product brief asks for a simple, clear target audience and benefit. Junior entries are ranked separately from Senior.",
    },
    {
      category: "secondary",
      minGrade: "9",
      maxGrade: "10",
      notes:
        "Senior category — Grades 9–10 / O Level / Matric equivalent, individual entry, poster created in Canva. More demanding audience positioning and message hierarchy are expected. Senior entries are ranked separately from Junior.",
    },
  ],

  stages: [
    {
      stageNumber: 1,
      title: "Brief, Design & Submission",
      format: "Digital poster designed in Canva, submitted with a product brief, Canva link and declarations",
      duration: "5–7 calendar days of design time from brief release to the published deadline",
      taskDescription: `Register on the League website, open the Product Pulse competition page and read the official product-launch brief. Identify the product, target audience, main benefit and desired action, plan the poster before designing, then build it in Canva, review it against the 5-second test and the rubric, export it and submit.

Mandatory poster elements: product or brand name • a catchy launch statement or slogan • a clear product visual or representation • one main product benefit or value proposition • a clear indication of the intended use or audience where necessary • a call to action such as "Discover it", "Try it", "Launching Soon" or "Pre-order" • and a clean visual hierarchy so the viewer knows what to read first, second and third.

The catchy statement rule — catchy does not mean confusing. A clever phrase that does not help the viewer understand the product will not receive top marks. Weak: "The Future Is Here" / "Buy This Now" / "Amazing Product". Stronger: "Hydrate Smart. Study Strong." / "Your Notes. Your Plan. One Reusable Kit." / "Charge Less. Learn Longer."

Product message rules: do not overload the poster with every feature; choose one main benefit and no more than 2–3 supporting points; claims must be reasonable and supported by the brief; never invent medical, safety, environmental or performance claims the brief does not support; include price only if supplied or explicitly allowed.

Canva rules: start from a blank page or substantially transform an allowed template — simply changing a name or colour on a ready-made template is not enough. The student must make the main layout, headline, product-message and visual-hierarchy decisions. Use only assets permitted by Canva or supplied by the organizer, never copy another brand's poster, logo, slogan or campaign, and do not use a real brand unless the brief deliberately sets that. A view-only Canva link may be requested for originality and process verification.

AI rule: generative features must not create the central poster concept, headline, product image or finished layout. Basic background removal, resizing and non-generative editing may be allowed — the organizer publishes the exact rule before launch.

Submission flow on the website: confirm category, enter product name and poster title, complete the short brief fields (target audience, main benefit, catchy statement, call to action), upload the final poster, paste the Canva view-only link, complete the originality / source-asset / AI declarations, preview, then FINAL SUBMIT before the deadline. Only the final submitted version is judged — a draft saved in Canva or on your device does not count.`,
      progressionRule:
        "The organizer checks eligibility, files and originality (1–2 days), then judging and moderation run for 2–3 days. At least two judges review prize-boundary and shortlisted entries; large score differences go to a moderator or chief judge before the result is locked.",
    },
  ],

  rubrics: [
    {
      stageNumber: 1,
      isPublic: true,
      criteria: [
        { name: "Product Message & Value Proposition", weight: 20 },
        { name: "Catchy Statement / Slogan", weight: 15 },
        { name: "Creativity & Originality", weight: 20 },
        { name: "Visual Design & Canva Execution", weight: 20 },
        { name: "Public / Audience Engagement", weight: 15 },
        { name: "Responsible Digital Practice", weight: 10 },
      ],
      tieBreakRule:
        "In order: 1) Product Message & Value Proposition, 2) Creativity & Originality, 3) Public / Audience Engagement, 4) Visual Design & Canva Execution, 5) Chief Judge blind comparative review.",
    },
  ],

  resources: [
    {
      type: "article",
      title: "The 7-step method — UNDERSTAND → TARGET → VALUE → HOOK → SKETCH → DESIGN → TEST",
      content: `1. UNDERSTAND — what is the product and what problem does it solve? 2. TARGET — who is the main audience? 3. VALUE — what is the single strongest benefit? 4. HOOK — write 5–10 possible slogans and choose the strongest. 5. SKETCH — make a quick layout before opening Canva. 6. DESIGN — build the poster with strong hierarchy and visual balance. 7. TEST — use the 5-second test, revise and submit.

Product positioning canvas to fill in first: What is the product? Who is the target audience? What problem or need does it address? What is the main benefit? Why is this product different or interesting? What should the viewer remember after 5 seconds? What action should the viewer take?`,
    },
    {
      type: "practice_question",
      title: "Slogan builder — five techniques with patterns",
      content: `Benefit + rhythm — "Plan Better. Study Smarter." Problem → solution — "Lost Notes? Meet Your New Study Hub." Short transformation — "From Messy to Ready." Audience identity — "Built for Students Who Move Fast." Curiosity — "What If Your Bottle Reminded You?"

Write 5–10 candidates using different techniques before choosing. The Catchy Statement criterion is worth 15 marks and rewards a headline that is short, memorable, original, meaningful and tightly connected to the product.`,
    },
    {
      type: "article",
      title: "The 5-second poster test and the visual design checklist",
      content: `Five-second test — Can I identify the product? Can I read the headline? Can I understand the main benefit? Do I know what to look at first? Does the poster feel appropriate for the target audience? Do I know what action the poster wants me to take?

Visual design checklist — clear focal point • readable fonts and sufficient contrast • consistent colours and style • balanced use of empty space • strong visual hierarchy • product easy to identify • headline prominent but not overpowering • no unnecessary decoration • readable on a phone screen as well as a large display.

Example poster structure — Top: product name plus strong visual identity. Middle (main focus): hero product visual, catchy statement and one key benefit. Bottom: 1–2 supporting points, call to action, and an optional launch date or website if the brief supplies one.`,
    },
    {
      type: "sample_task",
      title: "Example product brief and practice tasks",
      content: `A brief looks like this — Product: smart reusable study bottle. Target audience: students aged 12–16. Main problem: students forget to drink water during school hours. Main benefit: simple reminder feature plus reusable design. Launch objective: make students curious and interested in trying the product. Mandatory fact: reusable, designed for school use. Optional brand direction: the student creates the product name and visual identity.

Practice tasks and what each develops — redesign a cluttered mock poster (hierarchy and simplification) • create three headlines for the same product (creative communication) • design the same product for two audiences (audience adaptation) • make a monochrome version first (layout before decoration) • ask 3 people what they notice in 5 seconds (audience testing).`,
    },
    {
      type: "article",
      title: "Submission checklist",
      content: `I created the poster in Canva • my poster clearly shows the product name • my catchy statement is easy to read and connected to the product • my main product benefit is clear • my call to action is visible • the design is readable on both phone and large screen • I used permitted images and assets and did not copy another brand campaign • my product claims match the official brief • I exported the correct final file • I checked my Canva view-only link and completed the declarations • I clicked FINAL SUBMIT before the deadline.

Short product brief template to complete on the website: Product Name, Target Audience, Problem / Need, Main Benefit, Catchy Statement, Supporting Point 1, Supporting Point 2, Call to Action.`,
    },
  ],

  faqs: [
    {
      question: "Must the poster be made in Canva?",
      answer:
        "Yes. The final poster must be created in Canva, and a view-only Canva link may be requested for originality and process verification. The final composition, wording, hierarchy and design choices must be your own work.",
    },
    {
      question: "Can I use a Canva template?",
      answer:
        "Only if you substantially transform it. Simply changing a name or colour on a ready-made template is not enough — you must make the main layout, headline, product-message and visual-hierarchy decisions. Heavily template-dependent posters score poorly on Creativity & Originality, and may be referred for originality review.",
    },
    {
      question: "Can I use AI features inside Canva?",
      answer:
        "Generative features must not create the central poster concept, headline, product image or finished layout. Basic background removal, resizing and non-generative editing may be permitted — the organizer publishes the exact rule before launch, and you complete an AI-use declaration at submission.",
    },
    {
      question: "Do I invent the product myself?",
      answer:
        "No — the organizer releases a common product brief per category, giving the product, target audience, main problem, main benefit and launch objective. You typically create the product name and visual identity within that brief, and your claims must stay consistent with what the brief supports.",
    },
    {
      question: "Will a Canva Pro subscription help me win?",
      answer:
        "No. Judges are instructed not to award extra marks for Canva Pro assets, expensive devices or premium resources, and not to reward decoration that weakens the product message.",
    },
    {
      question: "Can I keep editing after I submit?",
      answer:
        "No. After the deadline, editing is locked unless the organizer reopens the entry for a documented technical reason. Only the final submitted version is judged — a draft saved in Canva or on your device does not count as a submission.",
    },
    {
      question: "How are Junior and Senior entries compared?",
      answer:
        "They are not. Junior (Grades 6–8) and Senior (Grades 9–10 / O Level / Matric) are judged against age-appropriate expectations and ranked separately, with their own 1st, 2nd and 3rd places.",
    },
  ],

  events: leagueDates("2026-10-31", "Poster submission deadline", {
    activityNote: "Submission-based competition; the design window opens when the official product brief is released.",
  }),
};
