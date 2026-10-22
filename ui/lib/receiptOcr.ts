/** Client-side receipt OCR helpers for fee checkout hard-block. */

export const RECEIPT_ACCEPT = "image/*,application/pdf";

export type ReceiptOcrCheck = {
  id: "amount" | "payee" | "account";
  label: string;
  ok: boolean;
};

export type ReceiptOcrResult = {
  ok: boolean;
  checks: ReceiptOcrCheck[];
  error: string | null;
};

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Map common OCR confusions back toward digits before searching. */
function digitsWithOcrHints(value: string): string {
  return digitsOnly(
    value
      .toLowerCase()
      .replace(/[il|!]/g, "1")
      .replace(/[o]/g, "0")
      .replace(/[s\$]/g, "5")
      .replace(/[gq]/g, "9")
      .replace(/[z]/g, "2")
      .replace(/[b]/g, "8"),
  );
}

export function isAllowedReceiptFile(file: File): boolean {
  const type = file.type.toLowerCase();
  if (type.startsWith("image/")) return true;
  if (type === "application/pdf") return true;
  const name = file.name.toLowerCase();
  return /\.(png|jpe?g|gif|webp|bmp|pdf)$/.test(name);
}

function amountAppearsInText(text: string, amountExpected: number): boolean {
  const amountDigits = digitsOnly(String(Math.round(amountExpected)));
  if (!amountDigits) return false;
  const digitBlob = digitsOnly(text);
  const hinted = digitsWithOcrHints(text);
  // Exact digit run, or the same amount with trailing .00 cents (e.g. 2400 → 240000).
  if (digitBlob.includes(amountDigits) || hinted.includes(amountDigits)) return true;
  if (digitBlob.includes(`${amountDigits}00`) || hinted.includes(`${amountDigits}00`)) return true;
  // "PKR 2,400" / "2,400.00" style near a currency marker.
  const escaped = amountDigits.replace(/(\d)(?=\d)/g, "$1[,.\\s]*");
  const money = new RegExp(`(?:pkr|rs)?\\s*${escaped}(?:\\.\\d{2})?`, "i");
  return money.test(text);
}

function payeeAppearsInText(text: string): boolean {
  const normalized = normalizeText(text);
  const compact = normalized.replace(/\s+/g, "");
  const hasPaideia = normalized.includes("paideia") || compact.includes("paideia") || normalized.includes("paidela");
  const hasVentures = normalized.includes("ventures") || compact.includes("ventures");
  const hasPrivate = normalized.includes("private") || compact.includes("private") || normalized.includes("ltd");
  return hasPaideia && hasVentures && hasPrivate;
}

function accountSuffixAppearsInText(text: string, payeeOk: boolean): boolean {
  if (text.includes("1953") || digitsOnly(text).includes("1953")) return true;
  if (digitsWithOcrHints(text).includes("1953")) return true;
  // Bank apps often mask the account (*********1953). OCR frequently drops those
  // digits, so accept a masked "To" destination when the payee already matched.
  if (!payeeOk) return false;
  if (/[*xX•·kK]{3,}/.test(text)) return true;
  if (/\bto\s*:/i.test(text) && /paideia/i.test(text)) return true;
  return false;
}

export function evaluateReceiptText(text: string, amountExpected: number | null): ReceiptOcrResult {
  const payeeOk = payeeAppearsInText(text);
  const amountOk = amountExpected != null && amountExpected > 0 ? amountAppearsInText(text, amountExpected) : false;
  const accountOk = accountSuffixAppearsInText(text, payeeOk);

  const checks: ReceiptOcrCheck[] = [
    {
      id: "amount",
      label:
        amountExpected != null
          ? `Hamper amount (PKR ${amountExpected.toLocaleString("en-US")})`
          : "Hamper amount",
      ok: amountOk,
    },
    {
      id: "payee",
      label: "Paideia Ventures (Private)",
      ok: payeeOk,
    },
    {
      id: "account",
      label: "Account number ending in 1953",
      ok: accountOk,
    },
  ];

  const ok = checks.every((check) => check.ok);
  return {
    ok,
    checks,
    error: ok
      ? null
      : "Please upload a valid amount deposit receipt image, or improve the image quality.",
  };
}

async function canvasFromImageFile(file: File): Promise<{ canvas: HTMLCanvasElement; objectUrl: string }> {
  const objectUrl = URL.createObjectURL(file);
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load the receipt image."));
    img.src = objectUrl;
  });

  const scale = Math.max(1.5, 1400 / Math.max(image.width, 1));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not prepare the receipt image.");
  context.fillStyle = "#fff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return { canvas, objectUrl };
}

async function fileToImageSource(file: File): Promise<{ source: HTMLCanvasElement | string; objectUrl: string | null }> {
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();
    const data = new Uint8Array(await file.arrayBuffer());
    const doc = await pdfjs.getDocument({ data }).promise;
    const page = await doc.getPage(1);
    const viewport = page.getViewport({ scale: 2.5 });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not prepare the PDF for reading.");
    await page.render({ canvasContext: context, viewport, canvas }).promise;
    return { source: canvas, objectUrl: null };
  }

  const prepared = await canvasFromImageFile(file);
  return { source: prepared.canvas, objectUrl: prepared.objectUrl };
}

/** Runs OCR on an image or PDF receipt and evaluates the hard-block checks. */
export async function verifyReceiptFile(file: File, amountExpected: number | null): Promise<ReceiptOcrResult> {
  if (!isAllowedReceiptFile(file)) {
    return {
      ok: false,
      checks: [],
      error: "Only image or PDF receipts are accepted.",
    };
  }

  let objectUrl: string | null = null;

  try {
    const prepared = await fileToImageSource(file);
    objectUrl = prepared.objectUrl;

    const Tesseract = (await import("tesseract.js")).default;
    const { data } = await Tesseract.recognize(prepared.source, "eng", { logger: () => undefined });
    return evaluateReceiptText(data.text ?? "", amountExpected);
  } catch {
    return {
      ok: false,
      checks: [],
      error: "Could not read this receipt. Try a clearer image or PDF.",
    };
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}
