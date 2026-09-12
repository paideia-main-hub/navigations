"use server";

import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, signSession } from "./session";

export type ActionState = { error: string | null };

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export async function adminLogin(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!expectedUsername || !expectedPasswordHash) {
    return { error: "Admin credentials are not configured on the server." };
  }

  const usernameOk = safeEqual(username, expectedUsername);
  const passwordOk = safeEqual(sha256(password), expectedPasswordHash);

  if (!usernameOk || !passwordOk) {
    return { error: "Incorrect username or password." };
  }

  const token = signSession({ username, issuedAt: Date.now() });
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: 60 * 60 * 12,
  });

  redirect("/admin");
}

export async function adminLogout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete({ name: ADMIN_COOKIE_NAME, path: "/admin" });
  redirect("/admin/login");
}
