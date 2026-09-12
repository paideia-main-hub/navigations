import type { SupabaseClient } from "@supabase/supabase-js";
import {
  listRegistrationsBySchool,
  listRegistrationsByRegistrant,
} from "@/data/repositories/registrations.repository";
import type { Registration } from "./types";

export async function listSchoolRegistrations(supabase: SupabaseClient, schoolId: string): Promise<Registration[]> {
  return listRegistrationsBySchool(supabase, schoolId);
}

export async function listMyRegistrations(supabase: SupabaseClient, profileId: string): Promise<Registration[]> {
  return listRegistrationsByRegistrant(supabase, profileId);
}

export function generateRegistrationNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `FCS-${year}-${random}`;
}
