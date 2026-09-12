export type AnnouncementCategory =
  | "registration"
  | "schedule"
  | "venue"
  | "manual_update"
  | "results"
  | "final_round"
  | "general";

export interface Announcement {
  id: string;
  competitionSlug?: string; // undefined = site-wide
  competitionTitle?: string;
  category: AnnouncementCategory;
  title: string;
  body: string;
  publishDate: string;
  isImportant?: boolean;
}

export const announcementCategoryLabels: Record<AnnouncementCategory, string> = {
  registration: "Registration",
  schedule: "Schedule",
  venue: "Venue",
  manual_update: "Manual Update",
  results: "Results",
  final_round: "Final Round",
  general: "General Notice",
};
