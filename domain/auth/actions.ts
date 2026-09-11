"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/data/supabase/server";

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

export async function signUpStudent(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();

  const fullName = String(formData.get("full_name"));
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, role: "student" } },
  });

  if (error) return { error: error.message };
  if (!data.user) return { error: "Sign-up did not return a user — check your Supabase auth settings." };

  const { error: studentError } = await supabase.from("students").insert({
    profile_id: data.user.id,
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
    // Most likely cause: Supabase email confirmation is enabled, so there's no
    // session yet and RLS blocks the insert until the student confirms their email.
    return {
      error:
        "Account created — check your email to confirm it, then complete your student profile from your dashboard.",
    };
  }

  redirect("/dashboard");
}

export async function signUpSchool(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();

  const coordinatorName = String(formData.get("coordinator_name"));
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: coordinatorName, role: "school_coordinator" } },
  });

  if (error) return { error: error.message };
  if (!data.user) return { error: "Sign-up did not return a user — check your Supabase auth settings." };

  const { data: school, error: schoolError } = await supabase
    .from("schools")
    .insert({
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
    return {
      error:
        "Account created — check your email to confirm it, then complete your school profile from your dashboard.",
    };
  }

  const { error: coordinatorError } = await supabase.from("school_coordinators").insert({
    school_id: school.id,
    profile_id: data.user.id,
    designation: String(formData.get("designation")) || null,
    official_email: email,
    mobile: String(formData.get("mobile")) || null,
    is_primary: true,
  });

  if (coordinatorError) {
    return { error: "School created but linking your coordinator account failed — contact support." };
  }

  redirect("/dashboard");
}
