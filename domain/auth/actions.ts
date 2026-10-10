"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/data/supabase/server";
import { createAdminClient } from "@/data/supabase/admin";
import { uploadOwnPhoto } from "@/domain/storage/actions";

export type ActionState = { error: string | null };

/** Absolute origin of the current request — needed because Supabase's email
 * links (reset-password, invite, etc.) require a full redirect URL, and this
 * app has no NEXT_PUBLIC_SITE_URL env var to hardcode one. */
async function currentOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (process.env.NODE_ENV === "production" ? "https" : "http");
  return `${proto}://${host}`;
}

export async function login(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
  });

  if (error) return { error: error.message };

  // Admin has its own dedicated login at /admin/login (see
  // domain/admin-auth/actions.ts) — reject an admin credential here rather
  // than silently letting it through, so that's the only door in for admins.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };

  if (profile?.role === "admin") {
    await supabase.auth.signOut();
    return { error: "Admin accounts sign in at /admin/login, not here." };
  }

  const next = String(formData.get("next") ?? "").trim();
  // Only same-origin relative paths — never protocol-relative or absolute URLs.
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  redirect(safeNext);
}

/** Pages that send an anonymous visitor away. After logout, leave these for the homepage. */
function requiresSignIn(pathname: string): boolean {
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) return true;
  if (pathname === "/reset-password") return true;
  if (pathname === "/admin") return true;
  if (pathname.startsWith("/admin/") && pathname !== "/admin/login") return true;
  return false;
}

function safeRelativePath(raw: string): string {
  const value = raw.trim();
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/";
  const pathname = value.split("?")[0]?.split("#")[0] || "/";
  return pathname || "/";
}

/** Auth-only pages go home. Public pages stay where the visitor already is. */
function destinationAfterLogout(from: string): string {
  const path = safeRelativePath(from);
  return requiresSignIn(path) ? "/" : path;
}

export async function logout(formData: FormData) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(destinationAfterLogout(String(formData.get("from") ?? "")));
}

/** Step 1 of the forgot-password flow: email a recovery link. Supabase never
 * reveals whether the address is registered, so the caller should always show
 * the same generic confirmation regardless of the result. */
export async function requestPasswordReset(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "");
  if (!email) return { error: "Enter your email address." };

  const supabase = await createClient();
  const origin = await currentOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=/reset-password`,
  });

  // Surface only unexpected/service errors — "user not found" is not an error
  // Supabase actually returns here, but stay defensive in case a project's
  // rate limits or misconfiguration ever does throw one.
  if (error) return { error: error.message };
  return { error: null };
}

/** Step 2, and also plain "change my password" for an already-logged-in user
 * — both cases just need an active session, which either a normal login or a
 * verified recovery link (see app/auth/confirm/route.ts) already establishes. */
export async function updatePassword(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== confirmPassword) return { error: "Passwords do not match." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session has expired — request a new reset link." };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  redirect(profile?.role === "admin" ? "/admin" : "/dashboard");
}

/** Creates the auth user via the Admin API (pre-confirmed) instead of the
 * public signUp() call. signUp() always tries to send a confirmation email
 * synchronously when "Confirm email" is on in Supabase, which is what was
 * hitting the free-tier email rate limit. admin.createUser() never sends
 * mail at all, so sign-up no longer depends on Supabase's email sender. */
async function createConfirmedUserAndSignIn(
  supabase: Awaited<ReturnType<typeof createClient>>,
  email: string,
  password: string,
  metadata: Record<string, string>,
): Promise<{ userId: string } | { error: string }> {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata,
  });

  if (error) return { error: error.message };
  if (!data.user) return { error: "Account creation did not return a user." };

  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) return { error: signInError.message };

  return { userId: data.user.id };
}

export async function signUpStudent(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();

  const fullName = String(formData.get("full_name"));
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  const result = await createConfirmedUserAndSignIn(supabase, email, password, {
    full_name: fullName,
    role: "student",
  });
  if ("error" in result) return { error: result.error };

  const { data: student, error: studentError } = await supabase
    .from("students")
    .insert({
      profile_id: result.userId,
      full_name: fullName,
      date_of_birth: String(formData.get("date_of_birth")) || null,
      gender: String(formData.get("gender")) || null,
      grade: String(formData.get("grade")) || null,
      school_name_input: String(formData.get("school_name")) || null,
      guardian_name: String(formData.get("guardian_name")) || null,
      guardian_relationship: String(formData.get("guardian_relationship")) || null,
      guardian_email: String(formData.get("guardian_email")) || null,
      guardian_mobile: String(formData.get("guardian_mobile")) || null,
    })
    .select("id")
    .single();

  if (studentError || !student) {
    return { error: `Account created, but saving your student profile failed: ${studentError?.message ?? "unknown error"}` };
  }

  // Photo is optional — a missing or failed upload doesn't block account
  // creation, it just means the photo prompt appears again on the student's
  // own dashboard until they add one.
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    const { url } = await uploadOwnPhoto(photo, student.id);
    if (url) await supabase.from("students").update({ photo_url: url }).eq("id", student.id);
  }

  redirect("/dashboard");
}

export async function signUpJudge(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();

  const fullName = String(formData.get("full_name"));
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  const result = await createConfirmedUserAndSignIn(supabase, email, password, {
    full_name: fullName,
    role: "judge",
  });
  if ("error" in result) return { error: result.error };

  const { error: judgeError } = await supabase.from("judges").insert({
    profile_id: result.userId,
    bio: String(formData.get("bio")) || null,
  });

  if (judgeError) {
    return { error: `Account created, but saving your judge profile failed: ${judgeError.message}` };
  }

  redirect("/dashboard");
}

/** Independent nominators — the only submitters for Idea of the Year, Story
 * of the Year and Young Changemaker who don't need a school account (see
 * domain/awards). Deliberately minimal: no grade/DOB/guardian fields, since
 * an independent nomination can come from any walk of life, not just a
 * student. */
export async function signUpNominator(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();

  const fullName = String(formData.get("full_name"));
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  const result = await createConfirmedUserAndSignIn(supabase, email, password, {
    full_name: fullName,
    role: "nominator",
  });
  if ("error" in result) return { error: result.error };

  redirect("/dashboard");
}

export async function signUpSchool(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();

  const coordinatorName = String(formData.get("coordinator_name"));
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  const result = await createConfirmedUserAndSignIn(supabase, email, password, {
    full_name: coordinatorName,
    role: "school_coordinator",
  });
  if ("error" in result) return { error: result.error };

  const { data: school, error: schoolError } = await supabase
    .from("schools")
    .insert({
      created_by: result.userId,
      official_name: String(formData.get("school_name")),
      school_type: String(formData.get("school_type")) || null,
      city: String(formData.get("city")) || null,
      country: String(formData.get("country")) || null,
      principal_name: String(formData.get("principal_name")) || null,
      school_phone: String(formData.get("school_phone")) || null,
      website: String(formData.get("website")) || null,
    })
    .select("id")
    .single();

  if (schoolError || !school) {
    return { error: `Account created, but saving your school profile failed: ${schoolError?.message}` };
  }

  const { error: coordinatorError } = await supabase.from("school_coordinators").insert({
    school_id: school.id,
    profile_id: result.userId,
    designation: String(formData.get("designation")) || null,
    official_email: email,
    mobile: String(formData.get("mobile")) || null,
    is_primary: true,
  });

  if (coordinatorError) {
    return { error: `School created, but linking your coordinator account failed: ${coordinatorError.message}` };
  }

  redirect("/dashboard");
}
