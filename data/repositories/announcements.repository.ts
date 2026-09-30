import type { SupabaseClient } from "@supabase/supabase-js";
import type { Announcement, AnnouncementCategory } from "@/domain/announcements/types";

type Row = {
  id: string;
  category: AnnouncementCategory;
  title: string;
  body: string;
  publish_date: string;
  expiry_date: string | null;
  is_important: boolean;
  competitions: { slug: string; title: string } | null;
};

const SELECT = "id, category, title, body, publish_date, expiry_date, is_important, competitions(slug, title)";

function toAnnouncement(row: Row): Announcement {
  return {
    id: row.id,
    competitionSlug: row.competitions?.slug,
    competitionTitle: row.competitions?.title,
    category: row.category,
    title: row.title,
    body: row.body,
    publishDate: row.publish_date,
    expiryDate: row.expiry_date,
    isImportant: row.is_important,
  };
}

/** Public reads: current (not yet expired) announcements only. Pinned
 * (`is_important`) announcements sort to the top regardless of date,
 * then newest-first within each group. */
export async function listAnnouncements(supabase: SupabaseClient): Promise<Announcement[]> {
  const { data, error } = await supabase
    .from("announcements")
    .select(SELECT)
    .or(`expiry_date.is.null,expiry_date.gt.${new Date().toISOString()}`)
    .order("is_important", { ascending: false })
    .order("publish_date", { ascending: false });

  if (error || !data) return [];
  return (data as unknown as Row[]).map(toAnnouncement);
}

/** Admin overview: every announcement, including expired ones. */
export async function adminListAnnouncements(admin: SupabaseClient): Promise<Announcement[]> {
  const { data, error } = await admin.from("announcements").select(SELECT).order("publish_date", { ascending: false });
  if (error || !data) return [];
  return (data as unknown as Row[]).map(toAnnouncement);
}

export interface AnnouncementInput {
  competitionId: string | null;
  category: AnnouncementCategory;
  title: string;
  body: string;
  isImportant: boolean;
  /** Calendar day stored at noon UTC so the public site shows that date. */
  publishDate: string;
}

export async function insertAnnouncement(admin: SupabaseClient, input: AnnouncementInput): Promise<{ error: string | null }> {
  const { error } = await admin.from("announcements").insert({
    competition_id: input.competitionId,
    category: input.category,
    title: input.title,
    body: input.body,
    is_important: input.isImportant,
    publish_date: input.publishDate,
  });
  return { error: error?.message ?? null };
}

export async function updateAnnouncement(
  admin: SupabaseClient,
  id: string,
  input: AnnouncementInput,
): Promise<{ error: string | null }> {
  const { error } = await admin
    .from("announcements")
    .update({
      competition_id: input.competitionId,
      category: input.category,
      title: input.title,
      body: input.body,
      is_important: input.isImportant,
      publish_date: input.publishDate,
    })
    .eq("id", id);
  return { error: error?.message ?? null };
}

/** Published clears the expiry so the notice returns to the public site.
 * Expired stamps the current time, which hides it from public reads. */
export async function setAnnouncementStatus(
  admin: SupabaseClient,
  id: string,
  status: "published" | "expired",
): Promise<{ error: string | null }> {
  const { error } = await admin
    .from("announcements")
    .update({ expiry_date: status === "published" ? null : new Date().toISOString() })
    .eq("id", id);
  return { error: error?.message ?? null };
}
