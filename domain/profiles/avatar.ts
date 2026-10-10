import { createAdminClient } from "@/data/supabase/admin";

export const AVATAR_BUCKET = "profile-avatars";

/** Public URL of the coordinator's current avatar, or null when none is stored. */
export async function getCoordinatorAvatarUrl(userId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.storage.from(AVATAR_BUCKET).list(userId, {
    limit: 20,
    sortBy: { column: "created_at", order: "desc" },
  });
  if (error || !data?.length) return null;
  const file = data.find((item) => item.id && item.name && !item.name.startsWith("."));
  if (!file) return null;
  return admin.storage.from(AVATAR_BUCKET).getPublicUrl(`${userId}/${file.name}`).data.publicUrl;
}

/** Deletes every avatar file in this coordinator's folder. */
export async function removeCoordinatorAvatarFiles(userId: string): Promise<void> {
  const admin = createAdminClient();
  const { data } = await admin.storage.from(AVATAR_BUCKET).list(userId, { limit: 100 });
  const paths = (data ?? []).filter((item) => item.id && item.name).map((item) => `${userId}/${item.name}`);
  if (paths.length > 0) await admin.storage.from(AVATAR_BUCKET).remove(paths);
}
