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
    isImportant: row.is_important,
  };
}

/** Public reads: current (not yet expired) announcements only. */
export async function listAnnouncements(supabase: SupabaseClient): Promise<Announcement[]> {
  const { data, error } = await supabase
    .from("announcements")
    .select(SELECT)
    .or(`expiry_date.is.null,expiry_date.gt.${new Date().toISOString()}`)
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
}

export async function insertAnnouncement(admin: SupabaseClient, input: AnnouncementInput): Promise<{ error: string | null }> {
  const { error } = await admin.from("announcements").insert({
    competition_id: input.competitionId,
    category: input.category,
    title: input.title,
    body: input.body,
    is_important: input.isImportant,
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
    })
    .eq("id", id);
  return { error: error?.message ?? null };
}

/** Soft-expire rather than hard-delete, matching the spec's "create/edit/expire" language. */
export async function expireAnnouncement(admin: SupabaseClient, id: string): Promise<{ error: string | null }> {
  const { error } = await admin.from("announcements").update({ expiry_date: new Date().toISOString() }).eq("id", id);
  return { error: error?.message ?? null };
}
