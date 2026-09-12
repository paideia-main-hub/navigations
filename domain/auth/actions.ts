"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/data/supabase/server";
import { createAdminClient } from "@/data/supabase/admin";

export type ActionState = { error: string | null };

export async function login(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
  });

  if (error) return { error: error.message };

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
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

  const { error: studentError } = await supabase.from("students").insert({
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
  });

  if (studentError) {
    return { error: `Account created, but saving your student profile failed: ${studentError.message}` };
  }

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
