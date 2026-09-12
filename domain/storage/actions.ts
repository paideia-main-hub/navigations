"use server";

import { createAdminClient } from "@/data/supabase/admin";
import { requireAdminSession } from "@/domain/admin-auth/guard";

export type StorageBucket = "manuals" | "resources" | "winner-photos";

/** Uploads an admin-supplied file to Supabase Storage and returns its public
 * URL. Buckets are public (see supabase/migrations/0011_storage_buckets.sql),
 * so no signed-URL logic is needed. Server-only, admin-gated. */
export async function uploadFile(
  bucket: StorageBucket,
  file: File,
  pathPrefix: string,
): Promise<{ url: string | null; error: string | null }> {
  await requireAdminSession();

  if (!file || file.size === 0) return { url: null, error: null };

  const admin = createAdminClient();
  const path = `${pathPrefix}/${crypto.randomUUID()}-${file.name}`;

  const { error } = await admin.storage.from(bucket).upload(path, file, {
    contentType: file.type || undefined,
    upsert: false,
  });
  if (error) return { url: null, error: error.message };

  const { data } = admin.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}
