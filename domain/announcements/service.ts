import { listAnnouncements } from "@/data/repositories/announcements.repository";
import type { Announcement, AnnouncementCategory } from "./types";

export function listAllAnnouncements(): Announcement[] {
  return [...listAnnouncements()].sort(
    (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime(),
  );
}

export function filterAnnouncements(category: AnnouncementCategory | "all"): Announcement[] {
  const all = listAllAnnouncements();
  if (category === "all") return all;
  return all.filter((a) => a.category === category);
}

export function announcementsForCompetition(slug: string): Announcement[] {
  return listAllAnnouncements().filter((a) => a.competitionSlug === slug);
}
