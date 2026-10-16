import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_AUDIO_BYTES = 8 * 1024 * 1024;

function extensionForMime(mimeType: string): string {
  if (mimeType.includes("mp4") || mimeType.includes("m4a")) return "mp4";
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("mpeg") || mimeType.includes("mp3")) return "mp3";
  if (mimeType.includes("wav")) return "wav";
  return "webm";
}

/** Transcribes a short voice clip via Groq Whisper (forced English). */
export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Voice input needs GROQ_API_KEY. Type your question, or continue on WhatsApp." },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid audio upload." }, { status: 400 });
  }

  const file = form.get("audio");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Record a short voice message first." }, { status: 400 });
  }
  if (file.size > MAX_AUDIO_BYTES) {
    return NextResponse.json({ error: "Voice clip is too long. Keep it under ~1 minute." }, { status: 400 });
  }

  const mimeType = file.type || "audio/webm";
  const filename = `question.${extensionForMime(mimeType)}`;

  const upstream = new FormData();
  upstream.append("file", file, filename);
  upstream.append("model", process.env.GROQ_WHISPER_MODEL?.trim() || "whisper-large-v3");
  upstream.append("language", "en");
  upstream.append(
    "prompt",
    "The speaker asks a short question in English about Navigations, Future Ready League, competitions, fees, registration, schools, or students.",
  );
  upstream.append("response_format", "json");
  upstream.append("temperature", "0");

  const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: upstream,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("[support-transcribe]", response.status, detail.slice(0, 400));
    return NextResponse.json(
      { error: "Could not transcribe that clip. Try again speaking clearly in English, or type your question." },
      { status: 502 },
    );
  }

  const payload = (await response.json()) as { text?: string };
  const text = payload.text?.trim().replace(/\s+/g, " ") ?? "";
  if (!text) {
    return NextResponse.json({ error: "No speech detected. Try again in English." }, { status: 422 });
  }

  // Whisper sometimes emits noise tokens when the clip is bad / too short.
  const letters = text.replace(/[^A-Za-z]/g, "");
  if (letters.length < 3) {
    return NextResponse.json(
      { error: "Could not understand that. Speak clearly in English, or type your question." },
      { status: 422 },
    );
  }

  return NextResponse.json({ text: text.slice(0, 800) });
}
