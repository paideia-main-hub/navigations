import { NextResponse } from "next/server";
import { createAdminClient } from "@/data/supabase/admin";
import {
  answerSupportChat,
  sanitizeChatImage,
  sanitizeHistory,
  sanitizeUserMessage,
} from "@/domain/support/chat";
import { logSupportChatMessage } from "@/domain/support/logs";

export const runtime = "nodejs";

function sanitizeSessionId(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > 80) return null;
  if (!/^[A-Za-z0-9_-]+$/.test(trimmed)) return null;
  return trimmed;
}

function sanitizePagePath(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || trimmed.length > 300) return null;
  if (trimmed.startsWith("//")) return null;
  return trimmed;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const image = sanitizeChatImage((body as { image?: unknown })?.image);
  const rawMessage = sanitizeUserMessage((body as { message?: unknown })?.message);
  const message =
    rawMessage ??
    (image ? "Please look at this image and help me with what it shows for Navigations / FRL." : null);

  if (!message) {
    return NextResponse.json({ error: "Enter a short question or attach an image." }, { status: 400 });
  }

  const history = sanitizeHistory((body as { history?: unknown })?.history);
  const sessionId = sanitizeSessionId((body as { sessionId?: unknown })?.sessionId);
  const pagePath = sanitizePagePath((body as { pagePath?: unknown })?.pagePath);
  const hadScreenshot = Boolean(image) || Boolean((body as { hadScreenshot?: unknown })?.hadScreenshot);
  const hadVoice = Boolean((body as { hadVoice?: unknown })?.hadVoice);

  try {
    const result = await answerSupportChat(message, history, image);

    if (sessionId) {
      void logSupportChatMessage(createAdminClient(), {
        sessionId,
        userMessage: message,
        assistantReply: result.reply,
        pagePath,
        hadScreenshot,
        hadVoice,
        needsHuman: result.needsHuman,
        needsLogin: result.needsLogin,
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[support-chat]", error);
    return NextResponse.json(
      {
        reply: "Something went wrong. Please continue on WhatsApp and our team will help.",
        needsHuman: true,
      },
      { status: 200 },
    );
  }
}
