import type { SupabaseClient } from "@supabase/supabase-js";

export type SupportChatLogInput = {
  sessionId: string;
  userMessage: string;
  assistantReply: string;
  pagePath?: string | null;
  hadScreenshot?: boolean;
  hadVoice?: boolean;
  needsHuman?: boolean;
  needsLogin?: boolean;
};

export type SupportChatLogRow = {
  id: string;
  sessionId: string;
  userMessage: string;
  assistantReply: string;
  pagePath: string | null;
  hadScreenshot: boolean;
  hadVoice: boolean;
  needsHuman: boolean;
  needsLogin: boolean;
  createdAt: string;
};

type DbRow = {
  id: string;
  session_id: string;
  user_message: string;
  assistant_reply: string;
  page_path: string | null;
  had_screenshot: boolean;
  had_voice: boolean;
  needs_human: boolean;
  needs_login: boolean;
  created_at: string;
};

function toRow(row: DbRow): SupportChatLogRow {
  return {
    id: row.id,
    sessionId: row.session_id,
    userMessage: row.user_message,
    assistantReply: row.assistant_reply,
    pagePath: row.page_path,
    hadScreenshot: row.had_screenshot,
    hadVoice: row.had_voice,
    needsHuman: row.needs_human,
    needsLogin: row.needs_login,
    createdAt: row.created_at,
  };
}

/** Fire-and-forget safe: never throws to the chat caller. */
export async function logSupportChatMessage(
  supabase: SupabaseClient,
  input: SupportChatLogInput,
): Promise<void> {
  const sessionId = input.sessionId.trim().slice(0, 80);
  const userMessage = input.userMessage.trim().slice(0, 2000);
  const assistantReply = input.assistantReply.trim().slice(0, 4000);
  if (!sessionId || !userMessage || !assistantReply) return;

  const { error } = await supabase.from("support_chat_messages").insert({
    session_id: sessionId,
    user_message: userMessage,
    assistant_reply: assistantReply,
    page_path: input.pagePath?.trim().slice(0, 300) || null,
    had_screenshot: Boolean(input.hadScreenshot),
    had_voice: Boolean(input.hadVoice),
    needs_human: Boolean(input.needsHuman),
    needs_login: Boolean(input.needsLogin),
  });

  if (error) {
    console.error("[support-chat-log]", error.message);
  }
}

export async function adminListSupportChatMessages(
  supabase: SupabaseClient,
  limit = 200,
): Promise<SupportChatLogRow[]> {
  const { data, error } = await supabase
    .from("support_chat_messages")
    .select(
      "id, session_id, user_message, assistant_reply, page_path, had_screenshot, had_voice, needs_human, needs_login, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    console.error("[support-chat-log] list", error?.message);
    return [];
  }

  return (data as DbRow[]).map(toRow);
}
