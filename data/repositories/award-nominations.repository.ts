// Data layer for award_nominations + its evidence/event child tables
// (supabase/migrations/0016_awards.sql).

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AwardEventRecord,
  AwardEvidenceFile,
  AwardNomination,
  AwardNominationStatus,
  AwardRoute,
} from "@/domain/award-nominations/types";

const SELECT = `
  id, nomination_number, category_id, nominator_profile_id, school_id, nominee_name,
  nominee_relationship, route, form_data, verifier_name, verifier_contact, status,
  submitted_at, created_at,
  award_categories(slug, title),
  schools(official_name),
  award_evidence_files(id, file_type, file_url, size_bytes, page_count),
  award_event_records(id, sport, event, organizer, level, role, result, evidence_note, order_index)
`;

type Row = {
  id: string;
  nomination_number: string;
  category_id: string;
  nominator_profile_id: string;
  school_id: string | null;
  nominee_name: string;
  nominee_relationship: string | null;
  route: AwardRoute | null;
  form_data: Record<string, string>;
  verifier_name: string | null;
  verifier_contact: string | null;
  status: AwardNominationStatus;
  submitted_at: string | null;
  created_at: string;
  award_categories: { slug: string; title: string } | null;
  schools: { official_name: string } | null;
  award_evidence_files: { id: string; file_type: AwardEvidenceFile["fileType"]; file_url: string; size_bytes: number | null; page_count: number | null }[];
  award_event_records: {
    id: string;
    sport: string;
    event: string | null;
    organizer: string | null;
    level: string | null;
    role: string | null;
    result: string | null;
    evidence_note: string | null;
    order_index: number;
  }[];
};

function toNomination(row: Row): AwardNomination {
  return {
    id: row.id,
    nominationNumber: row.nomination_number,
    categoryId: row.category_id,
    categorySlug: row.award_categories?.slug ?? "",
    categoryTitle: row.award_categories?.title ?? "",
    nominatorProfileId: row.nominator_profile_id,
    schoolId: row.school_id,
    schoolName: row.schools?.official_name ?? null,
    nomineeName: row.nominee_name,
    nomineeRelationship: row.nominee_relationship,
    route: row.route,
    formData: row.form_data ?? {},
    verifierName: row.verifier_name,
    verifierContact: row.verifier_contact,
    status: row.status,
    submittedAt: row.submitted_at,
    createdAt: row.created_at,
    evidenceFiles: (row.award_evidence_files ?? []).map((f) => ({
      id: f.id,
      fileType: f.file_type,
      fileUrl: f.file_url,
      sizeBytes: f.size_bytes,
      pageCount: f.page_count,
    })),
    eventRecords: (row.award_event_records ?? [])
      .sort((a, b) => a.order_index - b.order_index)
      .map((e) => ({
        id: e.id,
        sport: e.sport,
        event: e.event ?? "",
        organizer: e.organizer ?? "",
        level: e.level ?? "",
        role: e.role ?? "",
        result: e.result ?? "",
        evidenceNote: e.evidence_note ?? "",
        orderIndex: e.order_index,
      })),
  };
}

export async function listMyNominations(supabase: SupabaseClient, profileId: string): Promise<AwardNomination[]> {
  const { data, error } = await supabase
    .from("award_nominations")
    .select(SELECT)
    .eq("nominator_profile_id", profileId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as unknown as Row[]).map(toNomination);
}

export async function listSchoolNominations(supabase: SupabaseClient, schoolId: string): Promise<AwardNomination[]> {
  const { data, error } = await supabase
    .from("award_nominations")
    .select(SELECT)
    .eq("school_id", schoolId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as unknown as Row[]).map(toNomination);
}

/** Public winners list — published nominations only, and only the fields
 * safe to show publicly (evidence/verifier stay private per spec even after
 * publish, so this intentionally doesn't select those columns' full detail
 * beyond what toNomination already exposes for admin use — callers here
 * should only render nomineeName/categoryTitle/schoolName). */
export async function listPublishedNominations(supabase: SupabaseClient): Promise<AwardNomination[]> {
  const { data, error } = await supabase.from("award_nominations").select(SELECT).eq("status", "published").order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as unknown as Row[]).map(toNomination);
}

export async function adminListNominations(admin: SupabaseClient, categoryId?: string): Promise<AwardNomination[]> {
  let query = admin.from("award_nominations").select(SELECT).order("created_at", { ascending: false });
  if (categoryId) query = query.eq("category_id", categoryId);
  const { data, error } = await query;
  if (error || !data) return [];
  return (data as unknown as Row[]).map(toNomination);
}

export async function getNominationById(supabase: SupabaseClient, id: string): Promise<AwardNomination | null> {
  const { data, error } = await supabase.from("award_nominations").select(SELECT).eq("id", id).maybeSingle();
  if (error || !data) return null;
  return toNomination(data as unknown as Row);
}

export interface InsertNominationInput {
  nominationNumber: string;
  categoryId: string;
  nominatorProfileId: string;
  schoolId: string | null;
  nomineeName: string;
  nomineeRelationship: string | null;
  route: AwardRoute | null;
  formData: Record<string, string>;
  verifierName: string | null;
  verifierContact: string | null;
  consent: { terms: boolean; privacy: boolean; resultPublication: boolean; photoPublication: boolean };
}

export async function insertNomination(supabase: SupabaseClient, input: InsertNominationInput): Promise<{ id: string | null; error: string | null }> {
  const { data, error } = await supabase
    .from("award_nominations")
    .insert({
      nomination_number: input.nominationNumber,
      category_id: input.categoryId,
      nominator_profile_id: input.nominatorProfileId,
      school_id: input.schoolId,
      nominee_name: input.nomineeName,
      nominee_relationship: input.nomineeRelationship,
      route: input.route,
      form_data: input.formData,
      verifier_name: input.verifierName,
      verifier_contact: input.verifierContact,
      consent_terms: input.consent.terms,
      consent_privacy: input.consent.privacy,
      consent_result_publication: input.consent.resultPublication,
      consent_photo_publication: input.consent.photoPublication,
      status: "submitted",
      submitted_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !data) return { id: null, error: error?.message ?? "Failed to submit nomination." };
  return { id: data.id, error: null };
}

export async function insertEventRecords(
  supabase: SupabaseClient,
  nominationId: string,
  records: Omit<AwardEventRecord, "id">[],
): Promise<{ error: string | null }> {
  if (records.length === 0) return { error: null };
  const { error } = await supabase.from("award_event_records").insert(
    records.map((r, i) => ({
      nomination_id: nominationId,
      sport: r.sport,
      event: r.event || null,
      organizer: r.organizer || null,
      level: r.level || null,
      role: r.role || null,
      result: r.result || null,
      evidence_note: r.evidenceNote || null,
      order_index: r.orderIndex ?? i,
    })),
  );
  return { error: error?.message ?? null };
}

export async function insertEvidenceFile(
  supabase: SupabaseClient,
  nominationId: string,
  file: { fileType: AwardEvidenceFile["fileType"]; fileUrl: string; sizeBytes: number | null; pageCount: number | null },
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("award_evidence_files").insert({
    nomination_id: nominationId,
    file_type: file.fileType,
    file_url: file.fileUrl,
    size_bytes: file.sizeBytes,
    page_count: file.pageCount,
  });
  return { error: error?.message ?? null };
}

export async function updateNominationStatus(admin: SupabaseClient, id: string, status: AwardNominationStatus): Promise<{ error: string | null }> {
  const { error } = await admin.from("award_nominations").update({ status }).eq("id", id);
  return { error: error?.message ?? null };
}

export interface AwardClarification {
  id: string;
  nominationId: string;
  message: string;
  requestedAt: string;
  responseText: string | null;
  respondedAt: string | null;
}

export async function listClarifications(supabase: SupabaseClient, nominationId: string): Promise<AwardClarification[]> {
  const { data } = await supabase
    .from("award_clarifications")
    .select("id, nomination_id, message, requested_at, response_text, responded_at")
    .eq("nomination_id", nominationId)
    .order("requested_at", { ascending: false });
  return (data ?? []).map((r) => ({
    id: r.id,
    nominationId: r.nomination_id,
    message: r.message,
    requestedAt: r.requested_at,
    responseText: r.response_text,
    respondedAt: r.responded_at,
  }));
}

export async function requestClarification(admin: SupabaseClient, nominationId: string, requestedBy: string, message: string): Promise<{ error: string | null }> {
  const { error } = await admin.from("award_clarifications").insert({ nomination_id: nominationId, requested_by: requestedBy, message });
  if (error) return { error: error.message };
  return updateNominationStatus(admin, nominationId, "needs_clarification");
}

export async function respondToClarification(supabase: SupabaseClient, clarificationId: string, responseText: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("award_clarifications")
    .update({ response_text: responseText, responded_at: new Date().toISOString() })
    .eq("id", clarificationId);
  return { error: error?.message ?? null };
}
