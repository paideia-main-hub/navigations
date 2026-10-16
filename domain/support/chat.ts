import { getSiteKnowledge } from "@/domain/support/siteKnowledge";

export type SupportChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type SupportChatImage = {
  mimeType: string;
  data: string;
};

export type SupportChatResult = {
  reply: string;
  needsHuman: boolean;
  needsLogin: boolean;
};

const MAX_HISTORY = 8;
const MAX_MESSAGE_CHARS = 800;

const GEMINI_MODELS = [
  "gemini-3.8-flash",
  "gemini-flash-latest",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-flash-lite-latest",
];

const GROQ_MODELS = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];

async function systemPrompt(): Promise<string> {
  const knowledge = await getSiteKnowledge();
  return `You are the Navigations / Future Ready League on-site support assistant.
Answer ONLY using the knowledge base below. Be concise, clear and friendly.
Never invent fees, dates, winners, manuals, or competition rules that are not in the knowledge base.
When helpful, name the competition page path (/competitions/{slug}) or /faqs, /students, /schools, /contact.
Fees: the published amount is per student per competition. Total = fee × number of students in the entry (e.g. PKR 1,200 × 3 teammates = PKR 3,600). Never describe it as a flat one-time team fee.

Formatting for the "reply" string (important):
- Use short paragraphs separated by blank lines.
- Use numbered lists (1. 2. 3.) for step-by-step instructions.
- Use bullet lists (- item) for options or unordered points.
- Use **bold** only for short labels, not whole sentences.
- Do NOT put an entire answer on one long line. Do NOT wrap list items inside a single paragraph.

Flags (default BOTH to false):
- needsLogin=true ONLY when the user needs their private dashboard data (own registration/payment status, roster, League ID, etc.). Tell them to log in. Do not invent private data.
- needsHuman=true ONLY when you cannot answer from the knowledge base and must send them to a human on WhatsApp. In that case the reply must clearly say they should continue on WhatsApp / talk to the Navigations team.
- If you successfully answered the question from the knowledge base (fees, eligibility, how to register, competition info, etc.), BOTH flags MUST be false — even if you mention contact pages or dashboards in passing.
- Never set needsHuman=true just because the topic is important or the answer is long.

Return ONLY valid JSON: {"reply":"string","needsHuman":boolean,"needsLogin":boolean}

KNOWLEDGE BASE:
${knowledge}`;
}

export function sanitizeUserMessage(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim().replace(/\s+/g, " ");
  if (!trimmed || trimmed.length > MAX_MESSAGE_CHARS) return null;
  return trimmed;
}

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_IMAGE_BASE64_CHARS = 2_800_000; // ~2MB binary

export function sanitizeChatImage(raw: unknown): SupportChatImage | null {
  if (!raw || typeof raw !== "object") return null;
  const mimeType = (raw as { mimeType?: unknown }).mimeType;
  const data = (raw as { data?: unknown }).data;
  if (typeof mimeType !== "string" || typeof data !== "string") return null;
  if (!ALLOWED_IMAGE_TYPES.has(mimeType)) return null;
  const cleaned = data.replace(/^data:[^;]+;base64,/, "").replace(/\s+/g, "");
  if (!cleaned || cleaned.length > MAX_IMAGE_BASE64_CHARS) return null;
  if (!/^[A-Za-z0-9+/=]+$/.test(cleaned)) return null;
  return { mimeType, data: cleaned };
}

export function sanitizeHistory(raw: unknown): SupportChatMessage[] {
  if (!Array.isArray(raw)) return [];
  const out: SupportChatMessage[] = [];
  for (const item of raw.slice(-MAX_HISTORY)) {
    if (!item || typeof item !== "object") continue;
    const role = (item as { role?: unknown }).role;
    const content = (item as { content?: unknown }).content;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") continue;
    const text = content.trim().slice(0, MAX_MESSAGE_CHARS);
    if (!text) continue;
    out.push({ role, content: text });
  }
  return out;
}

/** Only keep WhatsApp handoff when the reply actually sends the user to a human. */
function replyRequestsHuman(reply: string): boolean {
  const text = reply.toLowerCase();
  return (
    text.includes("whatsapp") ||
    text.includes("talk to our team") ||
    text.includes("contact our team") ||
    text.includes("navigations team") ||
    text.includes("speak to a human") ||
    text.includes("speak with a human") ||
    text.includes("could not reach the assistant") ||
    text.includes("assistant is busy") ||
    text.includes("assistant is not configured") ||
    text.includes("i could not answer") ||
    text.includes("i am not sure") ||
    text.includes("i'm not sure")
  );
}

function normalizeResult(result: SupportChatResult): SupportChatResult {
  return {
    ...result,
    needsHuman: result.needsHuman && replyRequestsHuman(result.reply),
  };
}

function parseModelJson(text: string): SupportChatResult | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const parsed = JSON.parse(text.slice(start, end + 1)) as {
      reply?: unknown;
      needsHuman?: unknown;
      needsLogin?: unknown;
    };
    if (typeof parsed.reply !== "string" || !parsed.reply.trim()) return null;
    return normalizeResult({
      reply: parsed.reply.trim().slice(0, 2000),
      needsHuman: Boolean(parsed.needsHuman),
      needsLogin: Boolean(parsed.needsLogin),
    });
  } catch {
    return null;
  }
}

function uniqueModels(preferred: string | undefined, defaults: string[]): string[] {
  const list = preferred ? [preferred, ...defaults.filter((model) => model !== preferred)] : defaults;
  return [...new Set(list)];
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

type ProviderAttempt = {
  result?: SupportChatResult;
  busy: boolean;
};

async function tryGemini(
  message: string,
  history: SupportChatMessage[],
  system: string,
  image?: SupportChatImage | null,
): Promise<ProviderAttempt> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return { busy: false };

  const userParts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
    { text: message },
  ];
  if (image) {
    userParts.push({ inlineData: { mimeType: image.mimeType, data: image.data } });
  }

  const contents = [
    ...history.map((item) => ({
      role: item.role === "assistant" ? "model" : "user",
      parts: [{ text: item.content }],
    })),
    { role: "user", parts: userParts },
  ];

  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: system }] },
    contents,
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 700,
      responseMimeType: "application/json",
    },
  });

  let busy = false;
  const models = uniqueModels(process.env.GEMINI_MODEL?.trim(), GEMINI_MODELS);

  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (response.ok) {
        const payload = (await response.json()) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };
        const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
        const parsed = parseModelJson(text);
        if (parsed) return { result: parsed, busy: false };
        return {
          result: {
            reply: text.trim() || "I am not sure about that. Please continue on WhatsApp for help from our team.",
            needsHuman: true,
            needsLogin: false,
          },
          busy: false,
        };
      }

      const detail = await response.text().catch(() => "");
      console.error("[support-chat] Gemini error", model, response.status, detail.slice(0, 300));

      if (response.status === 503 || response.status === 429) {
        busy = true;
        await sleep(500 * (attempt + 1));
        continue;
      }
      break;
    }
  }

  return { busy };
}

async function tryGroq(
  message: string,
  history: SupportChatMessage[],
  system: string,
  image?: SupportChatImage | null,
): Promise<ProviderAttempt> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) return { busy: false };

  const userContent = image
    ? [
        { type: "text", text: message },
        { type: "image_url", image_url: { url: `data:${image.mimeType};base64,${image.data}` } },
      ]
    : message;

  const messages = [
    { role: "system", content: system },
    ...history.map((item) => ({ role: item.role, content: item.content })),
    { role: "user", content: userContent },
  ];

  const models = image
    ? uniqueModels(process.env.GROQ_VISION_MODEL?.trim(), ["meta-llama/llama-4-scout-17b-16e-instruct"])
    : uniqueModels(process.env.GROQ_MODEL?.trim(), GROQ_MODELS);

  let busy = false;

  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          temperature: 0.3,
          max_tokens: 700,
          ...(image ? {} : { response_format: { type: "json_object" } }),
          messages,
        }),
      });

      if (response.ok) {
        const payload = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const text = payload.choices?.[0]?.message?.content ?? "";
        const parsed = parseModelJson(text);
        if (parsed) return { result: parsed, busy: false };
        return {
          result: {
            reply: text.trim() || "I am not sure about that. Please continue on WhatsApp for help from our team.",
            needsHuman: true,
            needsLogin: false,
          },
          busy: false,
        };
      }

      const detail = await response.text().catch(() => "");
      console.error("[support-chat] Groq error", model, response.status, detail.slice(0, 300));

      if (response.status === 503 || response.status === 429) {
        busy = true;
        await sleep(500 * (attempt + 1));
        continue;
      }
      break;
    }
  }

  return { busy };
}

/** Gemini first, then Groq fallback. Needs at least one of GEMINI_API_KEY / GROQ_API_KEY. */
export async function answerSupportChat(
  message: string,
  history: SupportChatMessage[],
  image?: SupportChatImage | null,
): Promise<SupportChatResult> {
  const hasGemini = Boolean(process.env.GEMINI_API_KEY?.trim());
  const hasGroq = Boolean(process.env.GROQ_API_KEY?.trim());

  if (!hasGemini && !hasGroq) {
    return {
      reply:
        "The assistant is not configured yet. Please continue on WhatsApp and our team will help you.",
      needsHuman: true,
      needsLogin: false,
    };
  }

  const system = await systemPrompt();
  let busy = false;

  if (hasGemini) {
    const gemini = await tryGemini(message, history, system, image);
    if (gemini.result) return gemini.result;
    busy = busy || gemini.busy;
  }

  if (hasGroq) {
    const groq = await tryGroq(message, history, system, image);
    if (groq.result) return groq.result;
    busy = busy || groq.busy;
  }

  return {
    reply: busy
      ? "The assistant is busy right now. Please try again in a moment, or continue on WhatsApp."
      : "I could not reach the assistant just now. Please continue on WhatsApp and our team will help.",
    needsHuman: true,
    needsLogin: false,
  };
}
