import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/data/supabase/admin";
import { getAdminSession } from "@/domain/admin-auth/guard";
import * as service from "@/domain/awards/service";
import { compressToWebp } from "@/domain/storage/processImage";
import { deleteAwardCardImage } from "@/domain/storage/actions";

export const runtime = "nodejs";

/** Multipart upload used by the admin award card-image form so the browser can
 * report upload progress (Server Actions cannot). Compresses to WebP server-side. */
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

  const categoryId = String(formData.get("category_id") ?? "");
  const file = formData.get("file");
  if (!categoryId) {
    return NextResponse.json({ error: "Missing award category." }, { status: 400 });
  }
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
  }

  const admin = createAdminClient();
  const existing = await service.adminGetCategoryById(admin, categoryId);
  if (!existing) {
    return NextResponse.json({ error: "Award category not found." }, { status: 404 });
  }

  const previousUrl = existing.imageUrl;

  const { buffer, error: processError } = await compressToWebp(file);
  if (processError) {
    return NextResponse.json({ error: processError }, { status: 400 });
  }

  const path = `${categoryId}/${crypto.randomUUID()}.webp`;
  const { error: storageError } = await admin.storage.from("award-images").upload(path, buffer, {
    contentType: "image/webp",
    upsert: false,
  });
  if (storageError) {
    return NextResponse.json({ error: storageError.message }, { status: 500 });
  }

  const { data } = admin.storage.from("award-images").getPublicUrl(path);
  const url = data.publicUrl;

  const { error } = await service.setAwardCategoryImageUrl(admin, categoryId, url);
  if (error) {
    await deleteAwardCardImage(url);
    return NextResponse.json({ error }, { status: 500 });
  }

  if (previousUrl && previousUrl !== url) {
    await deleteAwardCardImage(previousUrl);
  }

  revalidatePath("/admin/awards");
  revalidatePath(`/admin/awards/${categoryId}`);
  revalidatePath("/awards");
  revalidatePath(`/awards/${existing.slug}`);
  revalidatePath("/competitions");
  revalidatePath("/");

  return NextResponse.json({ success: true, url });
}
