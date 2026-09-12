// Hardcoded-credential admin session — deliberately NOT Supabase Auth (there's
// no auth.uid() for a shared admin login, so the is_admin() RLS helper used
// everywhere else can never apply to it). Authorization instead rests on a
// self-issued, HMAC-signed cookie, verified with plain Node crypto (no new
// dependency). See domain/admin-auth/guard.ts for where this is enforced.

import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE_NAME = "fcs_admin_session";
const MAX_SESSION_AGE_MS = 12 * 60 * 60 * 1000; // 12 hours

interface SessionPayload {
  username: string;
  issuedAt: number;
}

function sign(payloadB64: string): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not set.");
  return createHmac("sha256", secret).update(payloadB64).digest("base64url");
}

export function signSession(payload: SessionPayload): string {
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${payloadB64}.${sign(payloadB64)}`;
}

export function verifySession(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return null;

  let expectedSignature: string;
  try {
    expectedSignature = sign(payloadB64);
  } catch {
    return null;
  }

  const a = Buffer.from(signature);
  const b = Buffer.from(expectedSignature);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8")) as SessionPayload;
    if (Date.now() - payload.issuedAt > MAX_SESSION_AGE_MS) return null;
    return payload;
  } catch {
    return null;
  }
}
