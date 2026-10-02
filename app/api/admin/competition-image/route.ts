import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/data/supabase/admin";
import { getAdminSession } from "@/domain/admin-auth/guard";
import * as service from "@/domain/competitions/service";
import { compressToWebp } from "@/domain/storage/processImage";
import { deleteCompetitionCardImage } from "@/domain/storage/actions";

export const runtime = "nodejs";

/** Multipart upload used by the admin card-image form so the browser can report
 * upload progress (Server Actions cannot). Compresses to WebP server-side.
 * Replacing an image deletes the previous object from competition-images. */
export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }

  const competitionId = String(formData.get("competition_id") ?? "");
  const file = formData.get("file");
  if (!competitionId) {
    return NextResponse.json({ error: "Missing competition." }, { status: 400 });
  }
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
  }

  const admin = createAdminClient();
  const existing = await service.adminGetCompetitionById(admin, competitionId);
  if (!existing) {
    return NextResponse.json({ error: "Competition not found." }, { status: 404 });
  }

  const previousUrl = existing.imageUrl;

  const { buffer, error: processError } = await compressToWebp(file);
  if (processError) {
    return NextResponse.json({ error: processError }, { status: 400 });
  }

  const path = `${competitionId}/${crypto.randomUUID()}.webp`;
  const { error: storageError } = await admin.storage.from("competition-images").upload(path, buffer, {
    contentType: "image/webp",
    upsert: false,
  });
  if (storageError) {
    return NextResponse.json({ error: storageError.message }, { status: 500 });
  }

  const { data } = admin.storage.from("competition-images").getPublicUrl(path);
  const url = data.publicUrl;

  const { error } = await service.setCompetitionImageUrl(admin, competitionId, url);
  if (error) {
    // Roll back the new object so we don't leave an orphan if the DB write fails.
    await deleteCompetitionCardImage(url);
    return NextResponse.json({ error }, { status: 500 });
  }

  // After the DB points at the new file, remove the previous Supabase object.
  if (previousUrl && previousUrl !== url) {
    await deleteCompetitionCardImage(previousUrl);
  }

  revalidatePath("/admin/competitions");
  revalidatePath(`/admin/competitions/${competitionId}`);
  revalidatePath("/competitions");
  revalidatePath("/");
  revalidatePath(`/competitions/${existing.slug}`);

  return NextResponse.json({ success: true, url });
}
