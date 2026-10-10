"use server";

import sharp from "sharp";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/data/supabase/admin";
import { getCurrentUser } from "@/domain/auth/session";
import { AVATAR_BUCKET, removeCoordinatorAvatarFiles } from "@/domain/profiles/avatar";

const AVATAR_MAX_MB = 8;
const AVATAR_SIZE = 600;

function revalidateAvatar() {
  revalidatePath("/dashboard", "layout");
  revalidatePath("/", "layout");
}

/** School coordinator: replaces their own avatar. Cropped to a square,
 * resized, and stored as WebP. Older files for this account are deleted. */
export async function updateCoordinatorAvatarAction(formData: FormData): Promise<{ error: string | null; url?: string }> {
  const user = await getCurrentUser();
  if (!user || user.role !== "school_coordinator") return { error: "Only a school coordinator can change this avatar." };

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a photo to upload." };
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
    return { error: "Use a JPG, PNG or WebP image (iPhone HEIC photos: share or export them as JPG first)." };
  }
  if (file.size > AVATAR_MAX_MB * 1024 * 1024) return { error: `That image is too large — the limit is ${AVATAR_MAX_MB} MB.` };

  let buffer: Buffer;
  try {
    buffer = await sharp(Buffer.from(await file.arrayBuffer()))
      .rotate()
      .resize(AVATAR_SIZE, AVATAR_SIZE, { fit: "cover", position: sharp.strategy.attention })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    return { error: "That image couldn't be read — try a different photo." };
  }

  const admin = createAdminClient();
  const path = `${user.id}/${crypto.randomUUID()}.webp`;
  const { error: uploadError } = await admin.storage.from(AVATAR_BUCKET).upload(path, buffer, {
    contentType: "image/webp",
    upsert: false,
  });
  if (uploadError) return { error: uploadError.message };

  const { data: existing } = await admin.storage.from(AVATAR_BUCKET).list(user.id, { limit: 100 });
  const stale = (existing ?? [])
    .filter((item) => item.id && item.name && `${user.id}/${item.name}` !== path)
    .map((item) => `${user.id}/${item.name}`);
  if (stale.length > 0) await admin.storage.from(AVATAR_BUCKET).remove(stale);

  revalidateAvatar();
  return { error: null, url: admin.storage.from(AVATAR_BUCKET).getPublicUrl(path).data.publicUrl };
}

/** School coordinator: removes their avatar (initials are shown instead). */
export async function removeCoordinatorAvatarAction(): Promise<{ error: string | null }> {
  const user = await getCurrentUser();
  if (!user || user.role !== "school_coordinator") return { error: "Only a school coordinator can change this avatar." };

  await removeCoordinatorAvatarFiles(user.id);
  revalidateAvatar();
  return { error: null };
}
