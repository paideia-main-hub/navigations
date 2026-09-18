// The published Future Ready League 2026 calendar, transcribed from
// documentation/FRL_Website_Competition_Calendar_2026.docx (which is written
// as website copy). Static on purpose: this is one fixed published
// programme, not per-competition dates an admin edits — those still come
// from the CMS and render separately at the bottom of the calendar page.
//
// The source document's final pages are explicitly marked "keep these setup
// notes internal" (venue/session assumptions, deadline-time proposals,
// appeal-window policy questions), so nothing from them appears here.

export type ActivityFormat = "One-day activity" | "Live performance" | "Project showcase" | "Submission" | "Screening" | "Award ceremony";

export const CALENDAR_INTRO =
  "Join the Future Ready League for reasoning challenges, live performances, creative activities and project showcases. Register from 1 to 10 October 2026. Submit required advance work and award nominations by 23 October. Weekday activities begin on 26 October, followed by the final showcase and awards programme on 6 and 7 November.";

export const CALENDAR_STRAPLINE = ["Registration 1 to 10 October", "Submissions close 23 October", "League begins 26 October"];

export interface KeyDate {
  milestone: string;
  date: string;
  note: string;
}

export const KEY_DATES: KeyDate[] = [
  { milestone: "Registration opens", date: "Thursday 1 October 2026", note: "School and individual registration opens." },
  { milestone: "Registration closes", date: "Saturday 10 October 2026", note: "Last date to register for competitions and award submissions." },
  {
    milestone: "Work submission deadline",
    date: "Friday 23 October 2026",
    note: "Upload all required advance work, project records and award nomination evidence.",
  },
  { milestone: "League activity period", date: "26 October to 5 November 2026", note: "One-day activities and live performances run on weekdays." },
  { milestone: "Final event day one", date: "Friday 6 November 2026", note: "Project showcases, screenings and Think Masters final presentations." },
  { milestone: "Final event day two", date: "Saturday 7 November 2026", note: "Continued displays and screenings, followed by the award ceremony." },
];

export const FORMAT_LEGEND: { format: ActivityFormat; description: string }[] = [
  { format: "One-day activity", description: "Complete a timed task, practical challenge or creative activity on the scheduled date." },
  { format: "Live performance", description: "Speak, debate, pitch, tell a story or present to a judging panel in person." },
  { format: "Project showcase", description: "Display a completed project, model, poster or photograph and explain it where required." },
  { format: "Submission", description: "Upload the required work or nomination evidence through the website by 23 October." },
];

export interface ScheduledActivity {
  date: string;
  day: string;
  name: string;
  nature: string;
  formats: ActivityFormat[];
}

export const WEEK_ONE: ScheduledActivity[] = [
  { date: "26 Oct", day: "Monday", name: "MindWorks Decathlon Senior", nature: "Timed reasoning, evidence analysis and problem-solving stations.", formats: ["One-day activity"] },
  { date: "26 Oct", day: "Monday", name: "Picture Detective", nature: "Observe a visual scene, identify clues and explain conclusions.", formats: ["One-day activity"] },
  { date: "27 Oct", day: "Tuesday", name: "Oratoris Cup Senior", nature: "Prepared scenario speech followed by adaptive speaking.", formats: ["One-day activity", "Live performance"] },
  { date: "27 Oct", day: "Tuesday", name: "Young Orator Junior", nature: "Short speech on an age-appropriate topic.", formats: ["One-day activity", "Live performance"] },
  { date: "28 Oct", day: "Wednesday", name: "Argumentor", nature: "Team debate with evidence, rebuttal and cross-questioning.", formats: ["One-day activity", "Live performance"] },
  { date: "28 Oct", day: "Wednesday", name: "StorySpark", nature: "Create and tell an original story using picture prompts.", formats: ["One-day activity", "Live performance"] },
  { date: "29 Oct", day: "Thursday", name: "CodeCircuit", nature: "Solve coding tasks through algorithms, programming, testing and debugging.", formats: ["One-day activity"] },
  { date: "29 Oct", day: "Thursday", name: "Young Scientist Observation", nature: "Observe a safe demonstration, record changes and explain findings.", formats: ["One-day activity"] },
  { date: "30 Oct", day: "Friday", name: "WordWave Narrative Challenge", nature: "Timed original narrative writing from an organizer-issued prompt.", formats: ["One-day activity"] },
  { date: "30 Oct", day: "Friday", name: "EthosQuest", nature: "Values-based decision-making, written reflection and short oral defence.", formats: ["One-day activity", "Live performance"] },
];

export const WEEK_TWO: ScheduledActivity[] = [
  {
    date: "2 Nov",
    day: "Monday",
    name: "LeadLab Summit",
    nature: "Student leadership and legislative simulation with speeches, debate and decisions.",
    formats: ["One-day activity", "Live performance"],
  },
  { date: "3 Nov", day: "Tuesday", name: "Imaginarium", nature: "Live sketch development, final artwork and a short explanation.", formats: ["One-day activity"] },
  { date: "4 Nov", day: "Wednesday", name: "WorldView", nature: "Global issue briefing, live presentation and panel questions.", formats: ["One-day activity", "Live performance"] },
  { date: "4 Nov", day: "Wednesday", name: "VentureMinds", nature: "Microbusiness pitch and panel defence. Business model due 23 October.", formats: ["Submission", "Live performance"] },
  {
    date: "5 Nov",
    day: "Thursday",
    name: "EcoSphere School Improvement Action Plan",
    nature: "Create an action plan from an issued school-improvement problem and present it.",
    formats: ["One-day activity", "Live performance"],
  },
  {
    date: "6 Nov",
    day: "Friday",
    name: "Think Masters Championship",
    nature: "Final presentation and defence of a researched school-life solution. Summary and presentation due 23 October.",
    formats: ["Submission", "Live performance"],
  },
  { date: "6 Nov", day: "Friday", name: "Final event day one", nature: "Project demonstrations, poster and photo displays, film and video screenings.", formats: ["Project showcase"] },
  {
    date: "7 Nov",
    day: "Saturday",
    name: "Final event day two",
    nature: "Continued project displays and screenings, followed by the League award ceremony.",
    formats: ["Project showcase", "Award ceremony"],
  },
];

export const WEEKEND_GAP_NOTE = "31 October and 1 November: no regular League activities scheduled.";

export const ON_THE_DAY_NOTE =
  "For on-the-day competitions, the assessed work is produced during the scheduled event. The 23 October deadline applies to advance materials only where the competition rules require them; it does not require contestants to submit unseen live tasks early.";

export const FINAL_EVENT_PROGRAMME: { date: string; detail: string }[] = [
  {
    date: "6 November",
    detail:
      "Showcase displays open; SciVanta teams demonstrate their models; scheduled panels complete project assessment; Think Masters teams deliver their final presentations; selected films and video messages are screened.",
  },
  {
    date: "7 November",
    detail:
      "Displays and selected screenings continue. The closing award ceremony recognises competition distinctions, school awards, Spotlight recipients, supportive teachers and parents, student athletes and up to 50 selected principals.",
  },
];

export const FINAL_EVENT_NOTE =
  "Finalists will receive their reporting times and venue details before the event. Demonstration slots and ceremony timings will be published separately. Work displayed at the finale must match the entry submitted by 23 October, subject to the competition's stated rules.";

export interface SubmissionEntry {
  competition: string;
  requirement: string;
  formats: ActivityFormat[];
  presentation: string;
}

export const SUBMISSION_CALENDAR_INTRO =
  "Register from 1 to 10 October. Upload the required work by Friday 23 October 2026. Physical projects are brought to the final event according to the organizer's setup instructions; the online deadline covers their project records and supporting files.";

export const SUBMISSION_CALENDAR: SubmissionEntry[] = [
  {
    competition: "InquiryQuest",
    requirement:
      "Scientific inquiry report with question, method, evidence, analysis and conclusion. Proposed prompt release 14 October, giving a 10-calendar-day window through 23 October.",
    formats: ["Submission"],
    presentation: "Online assessment; no mandatory live slot",
  },
  {
    competition: "Think Masters Championship",
    requirement: "Researched school-life problem, evidence, proposed solution, two-page summary and final presentation file.",
    formats: ["Submission", "Live performance"],
    presentation: "6 November final defence",
  },
  { competition: "VentureMinds", requirement: "Original microbusiness model and pitch materials.", formats: ["Submission", "Live performance"], presentation: "4 November pitch" },
  {
    competition: "DigitalHorizon Environmental Poster",
    requirement: "Environmental awareness poster with credible supporting information. Upload final poster file.",
    formats: ["Submission", "Project showcase"],
    presentation: "6 and 7 November",
  },
  {
    competition: "SciVanta Robotics for Environmental Pollution",
    requirement: "Robotics model addressing an environmental problem. Upload project record and demonstration evidence.",
    formats: ["Submission", "Project showcase"],
    presentation: "6 November judged demo; displays both days",
  },
  {
    competition: "CultureScript Five Minute Cultural Film",
    requirement: "Original cultural short film of up to five minutes. Upload the final film or permitted viewing link.",
    formats: ["Submission", "Screening"],
    presentation: "Selected films screened 6 and 7 November",
  },
  {
    competition: "PixelProof Catchy Photograph",
    requirement: "Original photograph with a clear caption or message. Upload final image and caption.",
    formats: ["Submission", "Project showcase"],
    presentation: "6 and 7 November",
  },
  {
    competition: "Message for Humanity Two Minute Video Message",
    requirement: "Original video of up to two minutes. Separate Junior, Senior and Teacher categories.",
    formats: ["Submission", "Screening"],
    presentation: "Selected videos screened 6 and 7 November",
  },
];

export interface AwardSubmissionEntry {
  award: string;
  nature: string;
  whoMaySubmit: string;
}

export const AWARD_SUBMISSION_INTRO =
  "Register the nomination from 1 to 10 October 2026 and submit the complete evidence package by 23 October. Eligible nominations are assessed before the final award ceremony on 7 November.";

export const AWARD_SUBMISSIONS: AwardSubmissionEntry[] = [
  {
    award: "Idea of the Year",
    nature: "An implemented idea with evidence of success during the previous two years, or a credible future proposal with a practical plan and supporting evidence.",
    whoMaySubmit: "School-nominated or independent individual",
  },
  {
    award: "Story of the Year",
    nature: "A true success story from home, education, work, personal life or the community, supported by relevant evidence.",
    whoMaySubmit: "School-nominated or independent individual",
  },
  {
    award: "Young Changemaker Award",
    nature: "Evidence showing how the nominee influenced others to make a positive change, with personal contribution and outcomes explained.",
    whoMaySubmit: "School-nominated or independent individual, within the published age rules",
  },
  {
    award: "Excellence Athlete Award",
    nature: "Verified two-year record of consistent performance and development in one primary sport.",
    whoMaySubmit: "School nomination",
  },
  {
    award: "Blazer Athlete Award",
    nature: "Verified sporting achievement across three distinct sports, supported by records within the two-year evidence period.",
    whoMaySubmit: "School nomination",
  },
];

export const ADDITIONAL_NOMINATIONS_NOTE =
  "Supportive Teacher, Supportive Parent and Best Principal nominations may also be completed by 23 October through the school account. These are additional recognition routes and are not part of the five assessed award submissions above. All valid teacher and parent nominees receive recognition without competitive assessment. Principal recognition remains capped at 50 recipients.";

export const SCHEDULING_NOTE =
  "The regular activity calendar excludes Saturday 31 October and Sunday 1 November. Saturday 7 November is the expressly scheduled finale exception. Online registration remains open through Saturday 10 October. Session times, venues and deadline cutoff times will be announced in Pakistan Standard Time.";
