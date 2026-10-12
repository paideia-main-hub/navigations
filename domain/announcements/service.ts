import type { SupabaseClient } from "@supabase/supabase-js";
import * as repo from "@/data/repositories/announcements.repository";
import type { Announcement, HeaderNotice } from "./types";

export async function listAllAnnouncements(supabase: SupabaseClient): Promise<Announcement[]> {
  return repo.listAnnouncements(supabase);
}

export async function listHeaderNotices(supabase: SupabaseClient): Promise<HeaderNotice[]> {
  const announcements = await repo.listAnnouncements(supabase);
  return announcements.map((announcement) => ({
    id: announcement.id,
    title: announcement.title,
    body: announcement.body,
    publishDate: announcement.publishDate,
    competitionTitle: announcement.competitionTitle,
  }));
}

export async function announcementsForCompetition(supabase: SupabaseClient, slug: string): Promise<Announcement[]> {
  const all = await repo.listAnnouncements(supabase);
  return all.filter((a) => a.competitionSlug === slug);
}

// --- Admin ---

export async function adminListAnnouncements(admin: SupabaseClient): Promise<Announcement[]> {
  return repo.adminListAnnouncements(admin);
}

export const createAnnouncement = repo.insertAnnouncement;
export const updateAnnouncement = repo.updateAnnouncement;
export const setAnnouncementStatus = repo.setAnnouncementStatus;

export type { AnnouncementInput } from "@/data/repositories/announcements.repository";
