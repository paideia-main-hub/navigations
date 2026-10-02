import sharp from "sharp";

/** Longest side for competition card artwork after conversion. */
const MAX_SIDE = 1600;
/** WebP quality — balances card clarity with upload size. */
const WEBP_QUALITY = 80;

/**
 * Compresses an admin-uploaded image and converts it to WebP before storage.
 * The whole image is kept — it's only scaled down to fit within MAX_SIDE,
 * never cropped — because the cards display artwork at its own shape, and a
 * crop here would permanently cut off the top and bottom of portrait art.
 */
export async function compressToWebp(file: File): Promise<{ buffer: Buffer; error: string | null }> {
  if (!file.type.startsWith("image/")) {
    return { buffer: Buffer.alloc(0), error: "Choose an image file (JPEG, PNG, WebP, etc.)." };
  }

  try {
    const input = Buffer.from(await file.arrayBuffer());
    // rotate() applies EXIF orientation first — phones often store portrait
    // pixels sideways with a rotation flag.
    const buffer = await sharp(input)
      .rotate()
      .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: "inside", withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
    return { buffer, error: null };
  } catch {
    return { buffer: Buffer.alloc(0), error: "Could not process that image. Try a different file." };
  }
}
