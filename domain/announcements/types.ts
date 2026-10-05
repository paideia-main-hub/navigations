/** Kept for the DB column only — categories are no longer a product concept. */
export type AnnouncementCategory = "general";

export interface Announcement {
  id: string;
  competitionSlug?: string; // undefined = site-wide
  competitionTitle?: string;
  /** Legacy DB field; always treated as unused in the UI. */
  category: AnnouncementCategory | string;
  title: string;
  body: string;
  publishDate: string;
  /** Null means the notice stays public. A past timestamp hides it. */
  expiryDate: string | null;
  isImportant?: boolean;
}
