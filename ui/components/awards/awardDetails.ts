// Full per-award publication copy, straight from
// documentation/FRL_Awards_Website_Publication_Copy.docx — the client's own
// requirements doc is explicitly written as website copy, so this is a
// direct transcription rather than a summary. Used by the /awards landing
// page to explain who each award is for and how it's decided, independent
// of whether the matching award_categories row has been created yet in the
// admin panel.
import type { AwardLayer } from "@/domain/awards/types";

export interface AwardDetail {
  slug: string;
  title: string;
  layer: AwardLayer;
  awardedTo: string;
  description: string;
  criteria?: { label: string; weight: string }[];
}

export const AWARD_DETAILS: AwardDetail[] = [
  {
    slug: "outstanding-performer",
    title: "Outstanding Performer, Distinguished Finalist & Emerging Talent",
    layer: "competition_distinction",
    awardedTo: "The three top-ranked entries in each Route 1 competition",
    description:
      "Each of the 23 Route 1 competitions recognises three leading entries. Outstanding Performer is awarded to the first-ranked entry, Distinguished Finalist to the second, and Emerging Talent to the third. Rankings follow the competition's published assessment rules. A pair or team receives one entry distinction, with certificates for its verified members. An entry can receive only one distinction in the same competition award pool.",
  },
  {
    slug: "champion-school",
    title: "Champion School Award",
    layer: "school_award",
    awardedTo: "The school with the highest competition points total",
    description:
      "Champion points = (Outstanding Performer awards × 10) + (Distinguished Finalist awards × 6) + (Emerging Talent awards × 3). Only approved League competition results count. Each winning pair or team earns one set of points. Other recognition awards do not add points.",
  },
  {
    slug: "school-excellence",
    title: "School Excellence Award",
    layer: "school_award",
    awardedTo: "The school with the highest number of Outstanding Performer awards",
    description: "This award counts first positions only.",
  },
  {
    slug: "whole-school-participation",
    title: "Whole School Participation Award",
    layer: "school_award",
    awardedTo: "The school with the highest number of confirmed student–competition registrations",
    description:
      "A student registered for four competitions counts as four registrations. A team of three counts as three student registrations in that competition. Duplicate, draft, cancelled, withdrawn and rejected registrations do not count. Completion is not required for this registration-based award.",
  },
  {
    slug: "diversified-school",
    title: "Diversified School Award",
    layer: "school_award",
    awardedTo: "The school participating successfully across the widest range of competitions",
    description:
      "Each different competition counts once when the school completes at least one eligible entry. Multiple entries in the same competition do not increase the count. Coverage is the number of competitions completed divided by 23, multiplied by 100.",
  },
  {
    slug: "collaboration-and-integrity",
    title: "Collaboration and Integrity Award",
    layer: "school_award",
    awardedTo: "The school that demonstrates the strongest coordination and cooperation during the League",
    description:
      "The organizer uses documented records; the highest verified score of at least 70% receives the award. Schools do not need to nominate themselves for any of the five School Awards — exact ties receive joint recognition, and a school may win more than one category.",
    criteria: [
      { label: "Timely and accurate coordination", weight: "30%" },
      { label: "Communication", weight: "25%" },
      { label: "Cooperation and problem resolution", weight: "20%" },
      { label: "Integrity", weight: "15%" },
      { label: "Professional, inclusive conduct", weight: "10%" },
    ],
  },
  {
    slug: "idea-of-the-year",
    title: "Idea of the Year",
    layer: "spotlight",
    awardedTo: "School-nominated or independent individuals — you don't have to win a League competition to submit",
    description:
      "Have you implemented an idea that made a difference, or developed a credible proposal for the future? Share the need you identified, your solution and the value it can create. Choose Implemented idea if you can show implementation and results within the published two-year evidence period, or Future proposal if your idea is planned for the upcoming edition or a stated future year (future proposals need credible research or testing, an implementation plan and measures of success). One award is planned; the highest verified score of at least 70% receives recognition.",
    criteria: [
      { label: "Problem and relevance", weight: "15%" },
      { label: "Originality and your contribution", weight: "20%" },
      { label: "Practicality and resources", weight: "20%" },
      { label: "Evidence and learning", weight: "25%" },
      { label: "Value and sustainability", weight: "20%" },
    ],
  },
  {
    slug: "story-of-the-year",
    title: "Story of the Year",
    layer: "spotlight",
    awardedTo: "School-nominated or independent individuals",
    description:
      "Share a true story of progress from home, school, work, personal life or the wider community — the starting point, the challenge, the actions taken, what changed and what you learned. Meaningful progress matters, even when it begins with a small step. Submit 600–1,000 words or an audio/video account of up to five minutes, with at least two supporting evidence items and one verifier. English and Urdu entries are welcome.",
    criteria: [
      { label: "Authenticity and evidence", weight: "25%" },
      { label: "Significance of progress", weight: "25%" },
      { label: "Agency and effort", weight: "20%" },
      { label: "Reflection and learning", weight: "20%" },
      { label: "Clarity", weight: "10%" },
    ],
  },
  {
    slug: "young-changemaker",
    title: "Young Changemaker Award",
    layer: "spotlight",
    awardedTo: "A young person aged 5–25 who has influenced others to make a positive change",
    description:
      "Show what you initiated, how you involved people and what improved as a result. Contributions within a team are welcome when your own role is clear. Submit two dated evidence items, a before-and-after measure or observable outcome, and one beneficiary or independent adult verifier. Likes, views and followers do not by themselves prove positive change.",
    criteria: [
      { label: "Positive change", weight: "30%" },
      { label: "Influence and involvement of others", weight: "25%" },
      { label: "Personal initiative", weight: "20%" },
      { label: "Continuity and responsible action", weight: "15%" },
      { label: "Verification and reflection", weight: "10%" },
    ],
  },
  {
    slug: "supportive-teacher",
    title: "Supportive Teacher Award",
    layer: "teacher_parent",
    awardedTo: "School-nominated teachers",
    description:
      "Thanks teachers for their guidance, coordination, encouragement and cooperation throughout the Future Ready League. This is a nomination-based acknowledgement with no competitive scoring, ranking or merit shortlist — every complete, valid school nomination receives the award. A person nominated more than once in the same category receives one award for that category.",
  },
  {
    slug: "supportive-parent",
    title: "Supportive Parent Award",
    layer: "teacher_parent",
    awardedTo: "School-nominated parents and guardians",
    description:
      "Recognises the contribution of parents and guardians who make participation possible through encouragement, practical support and cooperation. Like Supportive Teacher, every complete, valid school nomination receives the award — no competitive scoring.",
  },
  {
    slug: "excellence-athlete",
    title: "Excellence Athlete Award",
    layer: "sports",
    awardedTo: "A student with sustained, verified performance in one primary sport over the previous two years",
    description:
      "Schools submit the nomination with a dated record of achievement, development and sportsmanship — a verified competitive achievement or selection in each of the two consecutive 12-month periods ending on the nomination deadline, plus evidence of regular development. Sports recognition celebrates documented achievement and does not add school leaderboard points.",
    criteria: [
      { label: "Consistency across two years", weight: "30%" },
      { label: "Verified performance and progression", weight: "30%" },
      { label: "Commitment and development", weight: "20%" },
      { label: "Sportsmanship and teamwork", weight: "10%" },
      { label: "Evidence", weight: "10%" },
    ],
  },
  {
    slug: "blazer-athlete",
    title: "Blazer Athlete Award",
    layer: "sports",
    awardedTo: "A student with strong verified achievement across three distinct sports",
    description:
      "Schools must identify three sports and provide a competitive result or selection record for each within the two-year evidence period; different events in the same sport count as one sport. Each sport must score at least 10 out of 20, and the overall score must reach 70%. A student may receive both Excellence Athlete and Blazer Athlete if independently eligible for each.",
    criteria: [
      { label: "Performance in each of the three sports", weight: "20% each" },
      { label: "Consistency across two years", weight: "15%" },
      { label: "All-round development", weight: "10%" },
      { label: "Sportsmanship", weight: "10%" },
      { label: "Verification", weight: "5%" },
    ],
  },
  {
    slug: "best-principal",
    title: "Best Principal of Future Ready League Award",
    layer: "principal",
    awardedTo: "Up to 50 principals from participating schools",
    description:
      "Recognises principals for enabling participation and supporting League coordination. Each school may nominate one principal, and each principal may receive one award per edition. If more than 50 eligible principals are nominated, selection considers documented contributions below. This recognition does not change school leaderboard points.",
    criteria: [
      { label: "Timely coordination", weight: "30%" },
      { label: "Communication", weight: "25%" },
      { label: "Cooperation", weight: "20%" },
      { label: "Integrity", weight: "15%" },
      { label: "Inclusive professional conduct", weight: "10%" },
    ],
  },
];
