import type { Announcement } from "@/domain/announcements/types";

const announcements: Announcement[] = [
  {
    id: "an-1",
    category: "general",
    title: "2026 season registration is now open",
    body: "Registration for the 2026 Future Competence Series is open across all 13 competitions. Check each competition's Important Dates tab for its deadline.",
    publishDate: "2026-09-01T09:00:00.000Z",
    isImportant: true,
  },
  {
    id: "an-2",
    competitionSlug: "young-innovators-challenge",
    competitionTitle: "Young Innovators Challenge",
    category: "schedule",
    title: "Stage 2 prototype submission window extended",
    body: "Due to popular request, the prototype build submission window has been extended by one week.",
    publishDate: "2026-09-08T12:00:00.000Z",
  },
  {
    id: "an-3",
    competitionSlug: "public-speaking-championship",
    competitionTitle: "Public Speaking Championship",
    category: "results",
    title: "Grand Final results published",
    body: "Results for the 2026 Public Speaking Championship Grand Final are now live on the Results & Winners page.",
    publishDate: "2026-09-12T08:00:00.000Z",
  },
  {
    id: "an-4",
    competitionSlug: "robotics-arena",
    competitionTitle: "Robotics Arena",
    category: "venue",
    title: "Arena Trials venue confirmed",
    body: "Arena Trials will be held at the Central Sports Complex, Hall B. Doors open 8:00 AM.",
    publishDate: "2026-09-10T11:00:00.000Z",
  },
  {
    id: "an-5",
    competitionSlug: "math-olympiad",
    competitionTitle: "Future Competence Math Olympiad",
    category: "manual_update",
    title: "Updated rubric published",
    body: "A minor update to the scoring rubric (tie-break clarification) has been published on the competition's Manual tab.",
    publishDate: "2026-09-09T15:00:00.000Z",
  },
];

export function listAnnouncements(): Announcement[] {
  return announcements;
}
