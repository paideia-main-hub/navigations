"use server";

import sharp from "sharp";
import { revalidatePath } from "next/cache";
import { createClient } from "@/data/supabase/server";
import { createAdminClient } from "@/data/supabase/admin";
import { getCurrentUser } from "@/domain/auth/session";
import { getCoordinatorSchool } from "@/domain/schools/service";
import { uploadOwnPhoto } from "@/domain/storage/actions";
import { addStudentToSchool, getOwnStudentProfile, setStudentPhoto, updateOwnStudentProfile, updateSchoolStudent } from "./service";

export type ActionState = { error: string | null; success?: boolean };

export async function addStudentAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "school_coordinator") return { error: "Not authorized." };

  const supabase = await createClient();
  const school = await getCoordinatorSchool(supabase, user.id);
  if (!school) return { error: "No school found for this coordinator." };

  const { student, error } = await addStudentToSchool(supabase, school.id, {
    fullName: String(formData.get("full_name")),
    grade: String(formData.get("grade")) || null,
    dateOfBirth: String(formData.get("date_of_birth")) || null,
    gender: String(formData.get("gender")) || null,
    guardianName: String(formData.get("guardian_name")) || null,
    guardianRelationship: String(formData.get("guardian_relationship")) || null,
    guardianEmail: String(formData.get("guardian_email")) || null,
    guardianMobile: String(formData.get("guardian_mobile")) || null,
  });

  if (error || !student) return { error };

  // Optional, same as at student self-registration — a failed upload
  // doesn't block adding the student, it just leaves photoUrl null until
  // someone uploads one later.
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    const { url } = await uploadOwnPhoto(photo, student.id);
    if (url) await setStudentPhoto(supabase, student.id, url);
  }

  revalidatePath("/dashboard");
  return { error: null, success: true };
}

export async function updateSchoolStudentAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "school_coordinator") return { error: "Not authorized." };

  const fullName = String(formData.get("full_name") ?? "").trim();
  if (!fullName) return { error: "Enter the student's full name." };

  const supabase = await createClient();
  const school = await getCoordinatorSchool(supabase, user.id);
  if (!school) return { error: "No school found for this coordinator." };

  const studentId = String(formData.get("student_id") ?? "");
  const { error } = await updateSchoolStudent(supabase, school.id, studentId, {
    fullName,
    grade: String(formData.get("grade")) || null,
    dateOfBirth: String(formData.get("date_of_birth")) || null,
    gender: String(formData.get("gender")) || null,
    guardianName: String(formData.get("guardian_name")) || null,
    guardianRelationship: String(formData.get("guardian_relationship")) || null,
    guardianEmail: String(formData.get("guardian_email")) || null,
    guardianMobile: String(formData.get("guardian_mobile")) || null,
  });
  if (error) return { error };

  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    const { url } = await uploadOwnPhoto(photo, studentId);
    if (url) await setStudentPhoto(supabase, studentId, url);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/students");
  return { error: null, success: true };
}

export async function updateStudentProfileAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") return { error: "Not authorized." };

  const supabase = await createClient();
  const profile = await getOwnStudentProfile(supabase, user.id);
  if (!profile) return { error: "No student profile found for this account." };

  const { error } = await updateOwnStudentProfile(supabase, profile.id, {
    fullName: profile.fullName,
    grade: String(formData.get("grade")) || null,
    dateOfBirth: String(formData.get("date_of_birth")) || null,
    gender: String(formData.get("gender")) || null,
    guardianName: String(formData.get("guardian_name")) || null,
    guardianRelationship: String(formData.get("guardian_relationship")) || null,
    guardianEmail: String(formData.get("guardian_email")) || null,
    guardianMobile: String(formData.get("guardian_mobile")) || null,
  });

  if (error) return { error };

  revalidatePath("/dashboard");
  return { error: null, success: true };
}

const PHOTO_BUCKET = "student-photos";
const PHOTO_MAX_MB = 8;
const PHOTO_SIZE = 600;

/** Storage path of a photo in our own bucket, or null for anything else. */
function ownPhotoPath(publicUrl: string | null): string | null {
  const match = publicUrl?.match(/\/student-photos\/(.+)$/);
  return match ? decodeURIComponent(match[1]) : null;
}

function revalidatePhotoPages() {
  revalidatePath("/dashboard", "layout");
  revalidatePath("/results");
  revalidatePath("/");
}

/** Student: replaces their own profile photo. The image is auto-rotated from
 * its EXIF data, cropped to a square around its most important area, resized
 * to 600×600 and converted to WebP, so every photo looks consistent wherever
 * it's shown (dashboard, published results). The previous file is deleted. */
export async function updateOwnPhotoAction(formData: FormData): Promise<{ error: string | null; url?: string }> {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") return { error: "Only students can change their profile photo here." };

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a photo to upload." };
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
    return { error: "Use a JPG, PNG or WebP image (iPhone HEIC photos: share or export them as JPG first)." };
  }
  if (file.size > PHOTO_MAX_MB * 1024 * 1024) return { error: `That image is too large — the limit is ${PHOTO_MAX_MB} MB.` };

  const supabase = await createClient();
  const profile = await getOwnStudentProfile(supabase, user.id);
  if (!profile) return { error: "No student profile found for this account." };

  let buffer: Buffer;
  try {
    buffer = await sharp(Buffer.from(await file.arrayBuffer()))
      .rotate()
      .resize(PHOTO_SIZE, PHOTO_SIZE, { fit: "cover", position: sharp.strategy.attention })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    return { error: "That image couldn't be read — try a different photo." };
  }

  // The bucket has no insert policy of its own; writes go through the service
  // role, scoped here to the signed-in student's own folder.
  const admin = createAdminClient();
  const path = `${profile.id}/${crypto.randomUUID()}.webp`;
  const { error: uploadError } = await admin.storage.from(PHOTO_BUCKET).upload(path, buffer, { contentType: "image/webp", upsert: false });
  if (uploadError) return { error: uploadError.message };
  const url = admin.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl;

  const { error } = await setStudentPhoto(supabase, profile.id, url);
  if (error) {
    await admin.storage.from(PHOTO_BUCKET).remove([path]);
    return { error };
  }

  const previous = ownPhotoPath(profile.photoUrl);
  if (previous && previous !== path) await admin.storage.from(PHOTO_BUCKET).remove([previous]);

  revalidatePhotoPages();
  return { error: null, url };
}

/** Student: removes their profile photo (initials are shown instead). */
export async function removeOwnPhotoAction(): Promise<{ error: string | null }> {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") return { error: "Only students can change their profile photo here." };

  const supabase = await createClient();
  const profile = await getOwnStudentProfile(supabase, user.id);
  if (!profile) return { error: "No student profile found for this account." };

  const { error } = await supabase.from("students").update({ photo_url: null }).eq("id", profile.id);
  if (error) return { error: error.message };

  const previous = ownPhotoPath(profile.photoUrl);
  if (previous) await createAdminClient().storage.from(PHOTO_BUCKET).remove([previous]);

  revalidatePhotoPages();
  return { error: null };
}
