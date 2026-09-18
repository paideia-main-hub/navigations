"use server";

import { createClient } from "@/data/supabase/server";
import { createAdminClient } from "@/data/supabase/admin";
import { requireAdminSession } from "@/domain/admin-auth/guard";
import { getCurrentUser } from "@/domain/auth/session";

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

/** Uploads award evidence into the private `award-evidence` bucket, under the
 * uploading user's own session (not the service-role client) so the
 * `owner = auth.uid()` storage policy in 0016_awards.sql applies — this is
 * the nominator's own file, not admin-supplied content. Returns the storage
 * *path* (not a public URL, since the bucket is private) — resolve it to a
 * viewable link with getEvidenceSignedUrl() when an admin/judge needs to
 * preview it. */
export async function uploadEvidenceFile(file: File, nominationId: string): Promise<{ path: string | null; error: string | null }> {
  const user = await getCurrentUser();
  if (!user) return { path: null, error: "You must be logged in to upload evidence." };
  if (!file || file.size === 0) return { path: null, error: null };

  const supabase = await createClient();
  const path = `${nominationId}/${crypto.randomUUID()}-${file.name}`;

  const { error } = await supabase.storage.from("award-evidence").upload(path, file, {
    contentType: file.type || undefined,
    upsert: false,
  });
  if (error) return { path: null, error: error.message };

  return { path, error: null };
}

/** Resolves an award-evidence storage path to a short-lived signed URL —
 * admin/judge-only (evidence is private per spec). Uses the service-role
 * client since a judge's own RLS grant is read access to the *row*, not
 * automatically to the object in storage. */
export async function getEvidenceSignedUrl(path: string): Promise<{ url: string | null; error: string | null }> {
  const admin = createAdminClient();
  const { data, error } = await admin.storage.from("award-evidence").createSignedUrl(path, 60 * 10);
  if (error || !data) return { url: null, error: error?.message ?? "Could not sign evidence URL." };
  return { url: data.signedUrl, error: null };
}
