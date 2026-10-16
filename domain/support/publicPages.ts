/** Plain-text copies of public marketing pages for the support chat knowledge base. */

/** Matches ui/components/calendar/calendar2026.ts KEY_DATES — keep in sync. */
export const SEASON_CALENDAR_KNOWLEDGE = `
Official season calendar (/calendar) — authoritative League dates
- Registration opens: Thursday 8 October 2026
- Registration closes: Tuesday 10 November 2026
- Work & nomination deadline: Sunday 22 November 2026
- League opens: Monday 23 November 2026 (Applied Skills through 4 December)
- Final celebrations day one: Saturday 12 December 2026 (live performances, showcases, screenings)
- Final celebrations day two / closing & awards ceremony: Sunday 13 December 2026
`.trim();

export const COMPETENCY_VISION_KNOWLEDGE = `
Competency Vision (/competency-vision)
- Navigations creates purposeful opportunities for school-age learners to develop and demonstrate future competencies through practical challenges, creative expression and meaningful participation.
- Academically grounded in future competence frameworks and connected with the United Nations Sustainable Development Goals.
- Flagship initiative: Future Ready League — Lahore Edition 2026, with 25+ competitions across four participation pathways, recognising skills, effort and achievement.
`.trim();

export const STUDENTS_PAGE_KNOWLEDGE = `
For Students (/students)
- Eligibility: each competition is Primary, Middle or Secondary with its own grade (and sometimes age) range on Eligibility & Registration Rules. Filter /competitions by grade.
- Entry mode: individual, team, or both — per competition. Students can self-register or a school coordinator can enter them.
- Pathways: Applied Skills Challenges, Independent Submission, Project Showcasing, Live Performances.
- Stages: format, duration, task and progression rules are on the Competition Stages tab.
- Preparation: Stage-wise Challenges + Practice & Resource Pack (practice questions, samples, videos) on the competition page.
- Materials/rules: Guiding Principles tab and the competition manual.
- Judging: Judging & Rubrics tab — weighted criteria and tie-break rules.
- Season 2026 dates: registration 8 Oct–10 Nov; advance submissions due 22 Nov; activity period 23 Nov–4 Dec; finals & awards ceremony 12–13 Dec. Per-competition dates on Important Dates; full schedule on Competition Calendar (/calendar).
- After registration: League ID (FRL-2026-XXXXX) and per-competition registration numbers; track status on the dashboard (login required).
- Qualification/results: published via dashboard and competition page after admin approval.
- Awards: Digital Certificate and Digital Badge for completers; top ranks get Competition Distinctions; name/school/photo only if consented.
- Conduct: original work; manual sets integrity rules; breach can mean disqualification.
- Create student account: /register/student
`.trim();

export const SCHOOLS_PAGE_KNOWLEDGE = `
For Schools (/schools)
- Why participate: structured competency development; School Awards (Champion School, School Excellence, Whole School Participation, Diversified School, Collaboration & Integrity) from participation and results.
- Eligibility: Primary / Middle / Secondary with per-competition grade/age ranges.
- Entry: individual and/or team from the coordinator dashboard.
- Team size: per competition on Eligibility & Registration Rules; form blocks invalid sizes.
- Coordinator role: roster, register individuals/teams, track statuses, share resources/deadlines; League contact for the school.
- Season 2026 dates: same as students page (8 Oct–10 Nov registration, etc.).
- Fees: the published amount is PER STUDENT PER COMPETITION (not a flat fee for the whole team or school). A team of 3 at PKR 1,200 each pays PKR 3,600. Several separate students entered in one competition also pay fee × number of students. Amount is shown before submit; payment instructions are in the registration flow.
- Manuals: registration rules, guiding principles, complete manual, judging rubric on Manual tab.
- Consent at registration: terms, privacy, results publication, photo publication (independent).
- Recognition: certificates/badges plus Competition Distinctions, School Awards, Spotlight, Teacher/Parent, Sports & Principal awards.
- Results: private until admin approval; then Results & Winners and competition pages (subject to consent).
- Support: Contact page and /faqs.
- Create school account: /register/school (or equivalent school register path).
`.trim();

export const DASHBOARD_ONLY_KNOWLEDGE = `
Private / dashboard-only (NOT available to the public chat — require login)
Tell the visitor to log in (student, school coordinator or judge) and open their dashboard. Set needsLogin=true.
Examples that need login:
- My registration status, payment status, or whether my payment was approved
- My League ID or registration numbers
- My hamper / entry list / draft registrations
- My school’s student roster, teams, or coordinator tools
- My submissions, scores, judge feedback, or personal results before public publish
- Editing my profile, school profile, or team members
- Anything under /dashboard that is account-specific

Do NOT invent private data. After they log in they use /dashboard (and related dashboard pages).
If they also need a human (disputes, failed payment proof, account lockout), set needsHuman=true as well.
`.trim();
