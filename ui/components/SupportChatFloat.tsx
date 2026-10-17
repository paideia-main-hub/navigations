"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import { CONTACT_PHONE_E164 } from "@/domain/site/contact";
import { OPEN_LOGIN_EVENT } from "@/ui/components/LoginModalContext";
import { MenuScroll } from "@/ui/components/MenuScroll";
import { SupportChatReply } from "@/ui/components/SupportChatReply";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  needsHuman?: boolean;
  needsLogin?: boolean;
};

type PendingImage = {
  mimeType: string;
  dataUrl: string;
  data: string;
};

const STORAGE_KEY = "navigations-support-chat-v1";
const SESSION_KEY = "navigations-support-session";

function getOrCreateSessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing && /^[A-Za-z0-9_-]+$/.test(existing)) return existing;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID().replace(/-/g, "")
        : `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return `s${Date.now().toString(36)}`;
  }
}

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi — I can help with competitions, fees, manuals, eligibility and FAQs. For your own registrations or payments, I will ask you to log in. For anything I cannot answer, continue on WhatsApp.",
};

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M7 5h10a3 3 0 0 1 3 3v6.5a3 3 0 0 1-3 3h-4.1L8 20.25V17.5H7a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Z" />
      <path d="M8.5 10.25h7M8.5 13.25h4.5" />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M3.4 20.6 20.85 13.1a1 1 0 0 0 0-1.82L3.4 3.8a1 1 0 0 0-1.37 1.22l2.3 6.55a1 1 0 0 0 .76.68l7.84 1.25-7.84 1.25a1 1 0 0 0-.76.68l-2.3 6.55a1 1 0 0 0 1.37 1.22Z" />
    </svg>
  );
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z" />
      <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
      <path d="M12 18v3" />
    </svg>
  );
}

function ScreenshotIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2Z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

async function capturePageScreenshot(): Promise<PendingImage> {
  const { toJpeg } = await import("html-to-image");
  const target = document.documentElement;
  const dataUrl = await toJpeg(target, {
    quality: 0.82,
    pixelRatio: Math.min(window.devicePixelRatio || 1, 1.5),
    cacheBust: true,
    filter: (node) => {
      if (!(node instanceof HTMLElement)) return true;
      return !node.closest("[data-support-chat-float]");
    },
  });
  const data = dataUrl.replace(/^data:[^;]+;base64,/, "");
  if (!data) throw new Error("Could not capture this page.");
  return { mimeType: "image/jpeg", dataUrl, data };
}

function whatsappHandoffHref(messages: ChatMessage[]): string {
  const recent = messages
    .slice(-6)
    .map((item) => `${item.role === "user" ? "Visitor" : "Assistant"}: ${item.content}`)
    .join("\n");
  const text = recent
    ? `Hi Navigations — I was chatting on the website and need help.\n\n${recent}`
    : "Hi Navigations — I need help from the website chat.";
  return `https://wa.me/${CONTACT_PHONE_E164}?text=${encodeURIComponent(text)}`;
}

function readStoredChat(): { open: boolean; messages: ChatMessage[] } | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { open?: unknown; messages?: unknown };
    if (!Array.isArray(parsed.messages)) return null;
    const messages = parsed.messages.filter(
      (item): item is ChatMessage =>
        !!item &&
        typeof item === "object" &&
        typeof (item as ChatMessage).id === "string" &&
        ((item as ChatMessage).role === "user" || (item as ChatMessage).role === "assistant") &&
        typeof (item as ChatMessage).content === "string",
    );
    if (messages.length === 0) return null;
    return { open: Boolean(parsed.open), messages };
  } catch {
    return null;
  }
}

function openLoginOnThisPage() {
  window.dispatchEvent(
    new CustomEvent(OPEN_LOGIN_EVENT, {
      detail: { next: "/dashboard" },
    }),
  );
}

/** On-site AI assistant with login + WhatsApp handoff. */
export function SupportChatFloat() {
  const pathname = usePathname();
  const panelId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionIdRef = useRef("");
  const voicePendingRef = useRef(false);
  const [hydrated, setHydrated] = useState(false);
  const [open, setOpen] = useState(false);
  const [panelShown, setPanelShown] = useState(false);
  const [closing, setClosing] = useState(false);
  const [dockPulse, setDockPulse] = useState(false);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleMinimizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  /** Keeps the float inside the visible area when the mobile keyboard opens. */
  const [shellStyle, setShellStyle] = useState<CSSProperties>({ right: 30, bottom: 30 });
  const [panelHeightPx, setPanelHeightPx] = useState(520);
  const [composerFocused, setComposerFocused] = useState(false);

  function clearIdleMinimize() {
    if (idleMinimizeTimerRef.current) {
      clearTimeout(idleMinimizeTimerRef.current);
      idleMinimizeTimerRef.current = null;
    }
  }

  function markComposerEngaged() {
    clearIdleMinimize();
  }

  function openPanel() {
    clearIdleMinimize();
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setComposerFocused(false);
    setDockPulse(true);
    setClosing(false);
    setPanelShown(true);
    setOpen(true);
    // Never autofocus — on phones that opens the keyboard and hides the panel.
  }

  function closePanel() {
    if (!panelShown || closing) return;
    clearIdleMinimize();
    setComposerFocused(false);
    setDockPulse(true);
    setClosing(true);
    setOpen(false);
    closeTimerRef.current = setTimeout(() => {
      setPanelShown(false);
      setClosing(false);
      closeTimerRef.current = null;
    }, 280);
  }

  function togglePanel() {
    if (panelShown && !closing) closePanel();
    else openPanel();
  }

  useEffect(() => {
    sessionIdRef.current = getOrCreateSessionId();
    const stored = readStoredChat();
    // Restore messages only — never reopen automatically (stuck open broke mobile).
    if (stored?.messages?.length) setMessages(stored.messages);
    setHydrated(true);
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      if (idleMinimizeTimerRef.current) clearTimeout(idleMinimizeTimerRef.current);
    };
  }, []);

  // Pixel height from the real visible viewport — reliable on mobile LAN browsers.
  useEffect(() => {
    function syncFrame() {
      const vv = window.visualViewport;
      const visibleHeight = vv?.height ?? window.innerHeight;
      const overlap = vv ? Math.max(0, window.innerHeight - vv.height - vv.offsetTop) : 0;
      const keyed = composerFocused && overlap > 80;
      const EDGE = keyed ? 12 : 30;
      const DOCK = keyed ? 0 : 56;
      const available = Math.max(240, Math.floor(visibleHeight - EDGE - DOCK - 12));
      setPanelHeightPx(Math.min(672, available));
      setShellStyle({
        right: EDGE,
        bottom: keyed ? Math.max(12, overlap + 12) : 30,
      });
    }

    syncFrame();
    const vv = window.visualViewport;
    vv?.addEventListener("resize", syncFrame);
    vv?.addEventListener("scroll", syncFrame);
    window.addEventListener("resize", syncFrame);
    return () => {
      vv?.removeEventListener("resize", syncFrame);
      vv?.removeEventListener("scroll", syncFrame);
      window.removeEventListener("resize", syncFrame);
    };
  }, [composerFocused]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const slimMessages = messages.map(({ imageUrl: _imageUrl, ...rest }) => rest);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ open, messages: slimMessages }));
    } catch {
      /* ignore quota / private mode */
    }
  }, [hydrated, open, messages]);

  useEffect(() => {
    return () => {
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [open, messages, pending]);

  // After an AI reply, auto-minimize in 10s unless the user uses mic / screenshot / text input.
  useEffect(() => {
    if (!open || pending || recording || transcribing || capturing) {
      if (pending || recording || transcribing || capturing) clearIdleMinimize();
      return;
    }
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant" || last.id === "welcome") return;

    clearIdleMinimize();
    idleMinimizeTimerRef.current = setTimeout(() => {
      idleMinimizeTimerRef.current = null;
      closePanel();
    }, 10000);

    return () => clearIdleMinimize();
  }, [open, pending, messages, recording, transcribing, capturing]);

  useEffect(() => {
    if (!panelShown || closing) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") closePanel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [panelShown, closing]);

  async function captureScreenshot() {
    if (pending || recording || transcribing || capturing) return;
    markComposerEngaged();
    setCapturing(true);
    setError(null);
    try {
      // Let the UI show capturing state before freezing the DOM paint.
      await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
      setPendingImage(await capturePageScreenshot());
    } catch {
      setError("Could not capture this page. Try again, or describe what you see.");
    } finally {
      setCapturing(false);
    }
  }

  async function stopRecordingAndTranscribe() {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    const blob = await new Promise<Blob>((resolve) => {
      recorder.onstop = () => {
        resolve(new Blob(audioChunksRef.current, { type: recorder.mimeType || "audio/webm" }));
      };
      recorder.stop();
    });

    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    setRecording(false);

    if (blob.size < 800) {
      setError("Recording was too short. Try again.");
      return;
    }

    setTranscribing(true);
    setError(null);
    try {
      const mimeType = blob.type || "audio/webm";
      const extension = mimeType.includes("mp4") ? "mp4" : mimeType.includes("ogg") ? "ogg" : "webm";
      const form = new FormData();
      form.append("audio", blob, `question.${extension}`);
      const response = await fetch("/api/support-transcribe", { method: "POST", body: form });
      const data = (await response.json()) as { text?: string; error?: string };
      if (!response.ok || !data.text) {
        throw new Error(data.error || "Could not transcribe voice.");
      }
      voicePendingRef.current = true;
      setInput((current) => (current.trim() ? `${current.trim()} ${data.text}` : data.text!));
      inputRef.current?.focus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not transcribe voice.");
    } finally {
      setTranscribing(false);
    }
  }

  function pickRecorderMimeType(): string | undefined {
    const candidates = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
      "audio/ogg;codecs=opus",
    ];
    return candidates.find((type) => MediaRecorder.isTypeSupported(type));
  }

  async function toggleRecording() {
    if (pending || transcribing || capturing) return;
    markComposerEngaged();
    if (recording) {
      await stopRecordingAndTranscribe();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
      });
      mediaStreamRef.current = stream;
      const mimeType = pickRecorderMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      recorder.start(250);
      setRecording(true);
      setError(null);
    } catch {
      setError("Microphone access is blocked. Allow the mic, or type your question.");
    }
  }

  async function sendMessage(event: FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if ((!text && !pendingImage) || pending || recording || transcribing || capturing) return;

    // Dismiss the mobile keyboard like Gemini — only reopen if the user taps the field again.
    inputRef.current?.blur();
    setComposerFocused(false);

    const imageForRequest = pendingImage;
    const usedVoice = voicePendingRef.current;
    voicePendingRef.current = false;
    const displayText = text || (imageForRequest ? "Screenshot attached" : "");
    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: displayText,
      imageUrl: imageForRequest?.dataUrl,
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setPendingImage(null);
    setPending(true);
    setError(null);

    try {
      const history = nextMessages
        .filter((item) => item.id !== "welcome")
        .slice(0, -1)
        .map(({ role, content }) => ({ role, content }));

      const response = await fetch("/api/support-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history,
          sessionId: sessionIdRef.current || getOrCreateSessionId(),
          pagePath: pathname || "/",
          hadScreenshot: Boolean(imageForRequest),
          hadVoice: usedVoice,
          image: imageForRequest
            ? { mimeType: imageForRequest.mimeType, data: imageForRequest.data }
            : undefined,
        }),
      });
      const data = (await response.json()) as {
        reply?: string;
        needsHuman?: boolean;
        needsLogin?: boolean;
        error?: string;
      };
      if (!response.ok || !data.reply) {
        throw new Error(data.error || "Could not get a reply.");
      }
      setMessages((current) => [
        ...current,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: data.reply!,
          needsHuman: Boolean(data.needsHuman),
          needsLogin: Boolean(data.needsLogin),
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not get a reply.");
      setMessages((current) => [
        ...current,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: "I could not answer just now. Please continue on WhatsApp and our team will help.",
          needsHuman: true,
        },
      ]);
    } finally {
      setPending(false);
    }
  }

  const handoffHref = whatsappHandoffHref(messages);
  const lastAssistant = [...messages].reverse().find((item) => item.role === "assistant");
  const suggestHandoff = Boolean(lastAssistant?.needsHuman);
  const suggestLogin = Boolean(lastAssistant?.needsLogin);
  return (
    <div
      data-support-chat-float
      className="fixed z-[60] flex flex-col items-end"
      style={shellStyle}
    >
      {panelShown ? (
        <div
          id={panelId}
          role="dialog"
          aria-label="Navigations support chat"
          style={{ height: panelHeightPx }}
          className={`origin-bottom-right mb-3 flex w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-[0_18px_40px_-16px_rgba(31,32,65,0.45)] ${
            closing ? "animate-support-chat-out" : "animate-support-chat-in"
          }`}
        >
          <div className="flex items-start justify-between gap-3 border-b border-border bg-brand-deep px-4 py-3 text-white">
            <div>
              <p className="mb-1.5 text-base font-extrabold tracking-tight">Ask Navigations</p>
              <p className="mt-0.5 text-xs text-white/75">
                I&apos;m an AI assistant and can make mistakes. Check important details on the site or with our team.
              </p>
            </div>
            <button
              type="button"
              onClick={closePanel}
              aria-label="Close support chat"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white/80 hover:bg-white/10 hover:text-white"
            >
              <span aria-hidden="true" className="text-lg leading-none">
                ×
              </span>
            </button>
          </div>

          <MenuScroll
            scrollRef={listRef}
            frameClassName="flex min-h-0 flex-1 flex-col"
            className="min-h-0 flex-1 space-y-3 px-3 py-3"
          >
            {messages.map((item) => (
              <div
                key={item.id}
                className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl px-3 py-2 ${
                    item.role === "user"
                      ? "bg-accent-soft text-sm leading-relaxed text-foreground"
                      : "bg-surface text-foreground"
                  }`}
                >
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="mb-2 max-h-40 w-full rounded-xl object-cover"
                    />
                  ) : null}
                  {item.role === "assistant" ? (
                    <SupportChatReply text={item.content} />
                  ) : (
                    item.content
                  )}
                </div>
              </div>
            ))}
            {pending ? (
              <p className="px-1 text-xs text-muted" aria-live="polite">
                Thinking…
              </p>
            ) : null}
            {error ? (
              <p className="px-1 text-xs text-accent-strong" role="alert">
                {error}
              </p>
            ) : null}
          </MenuScroll>

          {suggestLogin || suggestHandoff ? (
            <div className="space-y-2 border-t border-border px-3 py-2">
              {suggestLogin ? (
                <button
                  type="button"
                  onClick={openLoginOnThisPage}
                  className="flex w-full items-center justify-center rounded-xl bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground hover:brightness-105"
                >
                  Log in to your dashboard
                </button>
              ) : null}
              {suggestHandoff ? (
                <a
                  href={handoffHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1ebe57]"
                >
                  Continue on WhatsApp
                </a>
              ) : null}
            </div>
          ) : null}

          <div className="border-t border-border p-3">
            {pendingImage ? (
              <div className="mb-2 flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={pendingImage.dataUrl} alt="" className="h-14 w-14 rounded-xl object-cover" />
                <button
                  type="button"
                  onClick={() => setPendingImage(null)}
                  className="text-xs font-semibold text-accent-strong"
                >
                  Remove screenshot
                </button>
              </div>
            ) : null}
            <form onSubmit={sendMessage} className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Capture page screenshot"
                disabled={pending || recording || transcribing || capturing}
                onClick={() => void captureScreenshot()}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted hover:bg-surface hover:text-foreground disabled:opacity-40"
              >
                <ScreenshotIcon className={`h-5 w-5 ${capturing ? "animate-pulse" : ""}`} />
              </button>
              <label className="sr-only" htmlFor={`${panelId}-input`}>
                Your question
              </label>
              <input
                ref={inputRef}
                id={`${panelId}-input`}
                value={input}
                enterKeyHint="send"
                autoComplete="off"
                onChange={(event) => {
                  markComposerEngaged();
                  setInput(event.target.value);
                }}
                onFocus={() => {
                  markComposerEngaged();
                  setComposerFocused(true);
                }}
                onBlur={() => setComposerFocused(false)}
                onPointerDown={markComposerEngaged}
                maxLength={800}
                placeholder={
                  capturing
                    ? "Capturing page…"
                    : recording
                      ? "Listening…"
                      : transcribing
                        ? "Transcribing…"
                        : "Ask about competitions…"
                }
                disabled={pending || recording || transcribing || capturing}
                className="h-[38px] min-w-0 flex-1 rounded-full border border-border bg-background px-4 text-sm text-foreground outline-none focus-visible:border-accent disabled:opacity-70"
              />
              {input.trim() || pendingImage ? (
                <button
                  type="submit"
                  disabled={pending || recording || transcribing || capturing}
                  aria-label="Send message"
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground shadow-[0_8px_18px_-8px_rgba(255,105,31,0.55)] transition-[transform,opacity] hover:brightness-105 disabled:opacity-40"
                >
                  <SendIcon className="h-5 w-5 translate-x-px -translate-y-px" />
                </button>
              ) : (
                <button
                  type="button"
                  aria-label={recording ? "Stop recording" : "Record voice question"}
                  disabled={pending || transcribing || capturing}
                  onClick={() => void toggleRecording()}
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-full transition-[transform,opacity] disabled:opacity-40 ${
                    recording
                      ? "animate-pulse bg-red-500 text-white"
                      : "bg-accent text-accent-foreground shadow-[0_8px_18px_-8px_rgba(255,105,31,0.55)] hover:brightness-105"
                  }`}
                >
                  <MicIcon className="h-5 w-5" />
                </button>
              )}
            </form>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close support chat" : "Open support chat"}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          togglePanel();
        }}
        onAnimationEnd={() => setDockPulse(false)}
        className={`group relative z-[61] flex h-11 touch-manipulation items-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
          dockPulse ? "animate-support-dock-press" : ""
        }`}
      >
        <span className="relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground shadow-[0_10px_22px_-8px_rgba(255,105,31,0.55)] transition-[transform,box-shadow] duration-300 ease-out group-hover:-translate-x-2 group-hover:shadow-[0_14px_28px_-8px_rgba(255,105,31,0.65)] group-focus-visible:-translate-x-2">
          <ChatIcon className="block h-5 w-5 translate-y-px" />
        </span>
        <span
          aria-hidden="true"
          className="-ml-11 flex h-11 max-w-11 items-center overflow-hidden rounded-full bg-accent pl-10 text-xs font-semibold whitespace-nowrap text-accent-foreground shadow-[0_10px_22px_-8px_rgba(255,105,31,0.55)] transition-[max-width,padding] duration-300 ease-out group-hover:max-w-[11rem] group-hover:pr-3.5 group-focus-visible:max-w-[11rem] group-focus-visible:pr-3.5"
        >
          Ask a question
        </span>
      </button>
    </div>
  );
}
