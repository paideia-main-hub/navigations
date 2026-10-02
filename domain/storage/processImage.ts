import sharp from "sharp";

/** Max width for competition card artwork after conversion. */
const MAX_WIDTH = 1600;
/** Card aspect ratio used on CompetitionCard / homepage stacks. */
const CARD_ASPECT = 16 / 9;
/** WebP quality — balances card clarity with upload size. */
const WEBP_QUALITY = 80;

/**
 * Compresses an admin-uploaded image and converts it to WebP before storage.
 * Portrait (taller than wide) images are centre-cropped to 16:9 landscape so
 * they match competition card banners; landscape images are only fitted.
 */
export async function compressToWebp(file: File): Promise<{ buffer: Buffer; error: string | null }> {
  if (!file.type.startsWith("image/")) {
    return { buffer: Buffer.alloc(0), error: "Choose an image file (JPEG, PNG, WebP, etc.)." };
  }

  try {
    const input = Buffer.from(await file.arrayBuffer());
    // Apply EXIF orientation before measuring — phones often store portrait
    // pixels sideways with a rotation flag.
    const meta = await sharp(input).rotate().metadata();
    const width = meta.width ?? 0;
    const height = meta.height ?? 0;
    const isPortrait = height > width && width > 0;

    const pipeline = sharp(input).rotate();
    const sized = isPortrait
      ? pipeline.resize({
          width: MAX_WIDTH,
          height: Math.round(MAX_WIDTH / CARD_ASPECT),
          fit: "cover",
          position: "centre",
        })
      : pipeline.resize({
          width: MAX_WIDTH,
          height: MAX_WIDTH,
          fit: "inside",
          withoutEnlargement: true,
        });

    const buffer = await sized.webp({ quality: WEBP_QUALITY }).toBuffer();
    return { buffer, error: null };
  } catch {
    return { buffer: Buffer.alloc(0), error: "Could not process that image. Try a different file." };
  }
}
