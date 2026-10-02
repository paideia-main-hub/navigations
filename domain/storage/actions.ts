"use server";

import { createClient } from "@/data/supabase/server";
import { createAdminClient } from "@/data/supabase/admin";
import { requireAdminSession } from "@/domain/admin-auth/guard";
import { getCurrentUser } from "@/domain/auth/session";
import { compressToWebp } from "@/domain/storage/processImage";
import { competitionImageStoragePath } from "@/domain/storage/competitionImagePath";
import { awardImageStoragePath } from "@/domain/storage/awardImagePath";

export type StorageBucket = "manuals" | "resources" | "winner-photos" | "competition-images" | "award-images";

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

/** Compresses and converts an image to WebP, then uploads it to the public
 * `competition-images` bucket (migration 0018). Returns the public URL for
 * competitions.image_url. */
export async function uploadCompetitionCardImage(
  file: File,
  competitionId: string,
): Promise<{ url: string | null; error: string | null }> {
  await requireAdminSession();

  if (!file || file.size === 0) return { url: null, error: "Choose an image to upload." };

  const { buffer, error: processError } = await compressToWebp(file);
  if (processError) return { url: null, error: processError };

  const admin = createAdminClient();
  const path = `${competitionId}/${crypto.randomUUID()}.webp`;

  const { error } = await admin.storage.from("competition-images").upload(path, buffer, {
    contentType: "image/webp",
    upsert: false,
  });
  if (error) return { url: null, error: error.message };

  const { data } = admin.storage.from("competition-images").getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}

/** Compresses to WebP and uploads to the public `award-images` bucket
 * (migration 0023). Returns the public URL for award_categories.image_url. */
export async function uploadAwardCardImage(
  file: File,
  categoryId: string,
): Promise<{ url: string | null; error: string | null }> {
  await requireAdminSession();

  if (!file || file.size === 0) return { url: null, error: "Choose an image to upload." };

  const { buffer, error: processError } = await compressToWebp(file);
  if (processError) return { url: null, error: processError };

  const admin = createAdminClient();
  const path = `${categoryId}/${crypto.randomUUID()}.webp`;

  const { error } = await admin.storage.from("award-images").upload(path, buffer, {
    contentType: "image/webp",
    upsert: false,
  });
  if (error) return { url: null, error: error.message };

  const { data } = admin.storage.from("award-images").getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}

/** Removes a competition-images object when its public URL is known.
 * Non-fatal if the path cannot be parsed or the object is already gone. */
export async function deleteCompetitionCardImage(publicUrl: string): Promise<{ deleted: boolean; error: string | null }> {
  const path = competitionImageStoragePath(publicUrl);
  if (!path) return { deleted: false, error: null };

  const admin = createAdminClient();
  const { error } = await admin.storage.from("competition-images").remove([path]);
  if (error) return { deleted: false, error: error.message };
  return { deleted: true, error: null };
}

/** Removes an award-images object when its public URL is known. */
export async function deleteAwardCardImage(publicUrl: string): Promise<{ deleted: boolean; error: string | null }> {
  const path = awardImageStoragePath(publicUrl);
  if (!path) return { deleted: false, error: null };

  const admin = createAdminClient();
  const { error } = await admin.storage.from("award-images").remove([path]);
  if (error) return { deleted: false, error: error.message };
  return { deleted: true, error: null };
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

/** Uploads a student profile photo to the public `student-photos` bucket
 * (see supabase/migrations/0019_registration_payments.sql) — collected once
 * at student self-registration or when a coordinator adds a student, then
 * reused everywhere a photo is needed (winner publication included), rather
 * than an admin uploading one per result. Gated on being signed in at all
 * (student or coordinator), not on being an admin — writes still go through
 * the service-role client, same as uploadFile, since the bucket has no
 * insert policy of its own. */
export async function uploadOwnPhoto(file: File, pathPrefix: string): Promise<{ url: string | null; error: string | null }> {
  const user = await getCurrentUser();
  if (!user) return { url: null, error: "You must be logged in to upload a photo." };
  if (!file || file.size === 0) return { url: null, error: null };

  const admin = createAdminClient();
  const path = `${pathPrefix}/${crypto.randomUUID()}-${file.name}`;

  const { error } = await admin.storage.from("student-photos").upload(path, file, {
    contentType: file.type || undefined,
    upsert: false,
  });
  if (error) return { url: null, error: error.message };

  const { data } = admin.storage.from("student-photos").getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}

/** Uploads a fee-payment receipt into the private `fee-receipts` bucket,
 * under the uploading user's own session (not the service-role client) so
 * the `owner = auth.uid()` storage policy applies — same shape as
 * uploadEvidenceFile, since a receipt is the payer's own document, not
 * admin-supplied content. Returns the storage path; resolve it to a
 * viewable link with getReceiptSignedUrl() for the admin approvals screen. */
export async function uploadReceiptFile(file: File, pathPrefix: string): Promise<{ path: string | null; error: string | null }> {
  const user = await getCurrentUser();
  if (!user) return { path: null, error: "You must be logged in to upload a receipt." };
  if (!file || file.size === 0) return { path: null, error: "A receipt file is required." };

  const supabase = await createClient();
  const path = `${pathPrefix}/${crypto.randomUUID()}-${file.name}`;

  const { error } = await supabase.storage.from("fee-receipts").upload(path, file, {
    contentType: file.type || undefined,
    upsert: false,
  });
  if (error) return { path: null, error: error.message };

  return { path, error: null };
}

/** Resolves a fee-receipt storage path to a short-lived signed URL for the
 * admin payment-approvals screen — same reasoning as getEvidenceSignedUrl. */
export async function getReceiptSignedUrl(path: string): Promise<{ url: string | null; error: string | null }> {
  const admin = createAdminClient();
  const { data, error } = await admin.storage.from("fee-receipts").createSignedUrl(path, 60 * 10);
  if (error || !data) return { url: null, error: error?.message ?? "Could not sign receipt URL." };
  return { url: data.signedUrl, error: null };
}
