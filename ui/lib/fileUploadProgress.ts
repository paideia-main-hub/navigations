export type UploadProgressState = {
  phase: "uploading" | "saving";
  percent: number;
};

type ProgressListener = (state: UploadProgressState) => void;

let depth = 0;
let originalFetch: typeof window.fetch | null = null;
let listener: ProgressListener | null = null;

function report(state: UploadProgressState) {
  listener?.(state);
}

function headerEntries(headers: HeadersInit | undefined): [string, string][] {
  if (!headers) return [];
  if (headers instanceof Headers) return [...headers.entries()];
  if (Array.isArray(headers)) return headers;
  return Object.entries(headers);
}

function responseHeaders(raw: string): Headers {
  const headers = new Headers();
  // XHR already decoded the body, so encoding headers must not be replayed.
  const skip = new Set(["content-encoding", "content-length", "transfer-encoding"]);
  for (const line of raw.trim().split(/[\r\n]+/)) {
    const splitAt = line.indexOf(":");
    if (splitAt <= 0) continue;
    const name = line.slice(0, splitAt).trim();
    if (skip.has(name.toLowerCase())) continue;
    headers.append(name, line.slice(splitAt + 1).trim());
  }
  return headers;
}

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  return input.url;
}

/** Sends a multipart body with XMLHttpRequest so byte progress is visible.
 * Falls back to fetch when the body is not a file upload. */
function trackedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const body = init?.body;
  if (!(body instanceof FormData) || !originalFetch) return originalFetch!(input, init);

  const method = (init?.method ?? "POST").toUpperCase();
  if (method === "GET" || method === "HEAD") return originalFetch(input, init);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, requestUrl(input));
    xhr.withCredentials = init?.credentials === "include";
    xhr.responseType = "text";

    for (const [key, value] of headerEntries(init?.headers)) {
      if (key.toLowerCase() === "content-type") continue;
      try {
        xhr.setRequestHeader(key, value);
      } catch {
        /* Browser-managed headers are left to XHR. */
      }
    }

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || event.total === 0) return;
      report({ phase: "uploading", percent: Math.min(88, Math.round((event.loaded / event.total) * 88)) });
    };
    xhr.upload.onload = () => {
      report({ phase: "saving", percent: 92 });
    };
    xhr.onload = () => {
      report({ phase: "saving", percent: 100 });
      resolve(
        new Response(xhr.responseText, {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: responseHeaders(xhr.getAllResponseHeaders()),
        }),
      );
    };
    xhr.onerror = () => reject(new TypeError("Network request failed"));
    xhr.onabort = () => reject(new DOMException("Aborted", "AbortError"));
    if (init?.signal) {
      if (init.signal.aborted) {
        xhr.abort();
        return;
      }
      init.signal.addEventListener("abort", () => xhr.abort(), { once: true });
    }
    xhr.send(body);
  });
}

/** Tracks the next file-bearing request. Upload bytes fill the bar to 88%;
 * the server finishing the write fills the rest as Saving. */
export function beginFileUploadTracking(onProgress: ProgressListener) {
  listener = onProgress;
  onProgress({ phase: "uploading", percent: 0 });
  if (depth === 0) {
    originalFetch = window.fetch.bind(window);
    window.fetch = trackedFetch;
  }
  depth += 1;
}

export function endFileUploadTracking() {
  if (depth === 0) return;
  depth -= 1;
  if (depth > 0) return;
  if (originalFetch) window.fetch = originalFetch;
  originalFetch = null;
  listener = null;
}

export async function withFileUploadProgress<T>(onProgress: ProgressListener, task: () => Promise<T>): Promise<T> {
  beginFileUploadTracking(onProgress);
  try {
    return await task();
  } finally {
    endFileUploadTracking();
  }
}

export function formHasFile(form: HTMLFormElement): boolean {
  return [...new FormData(form).values()].some((value) => value instanceof File && value.size > 0);
}
