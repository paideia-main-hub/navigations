import type { SupabaseClient } from "@supabase/supabase-js";
import type { PaymentStatus, RegistrationPayment } from "@/domain/payments/types";

type Row = {
  id: string;
  competition_slug: string;
  competition_title: string;
  submitted_by_name: string;
  school_name: string | null;
  entry_count: number;
  amount_expected: number | null;
  receipt_url: string;
  status: PaymentStatus;
  review_note: string | null;
  created_at: string;
};

const SELECT =
  "id, competition_slug, competition_title, submitted_by_name, school_name, entry_count, amount_expected, receipt_url, status, review_note, created_at";

function toPayment(row: Row): RegistrationPayment {
  return {
    id: row.id,
    competitionSlug: row.competition_slug,
    competitionTitle: row.competition_title,
    submittedByName: row.submitted_by_name,
    schoolName: row.school_name,
    entryCount: row.entry_count,
    amountExpected: row.amount_expected,
    receiptPath: row.receipt_url,
    status: row.status,
    reviewNote: row.review_note,
    createdAt: row.created_at,
  };
}

export interface InsertPaymentInput {
  competitionSlug: string;
  competitionTitle: string;
  submittedBy: string;
  submittedByName: string;
  schoolId: string | null;
  schoolName: string | null;
  entryCount: number;
  amountExpected: number | null;
  receiptPath: string;
}

/** Inserts the payment row and links every listed registration to it in one
 * round trip — the two are always created together, so a caller never ends
 * up with a payment nothing points at or a registration pointing at a
 * payment that doesn't exist. */
export async function insertPaymentAndLink(
  supabase: SupabaseClient,
  input: InsertPaymentInput,
  registrationIds: string[],
): Promise<{ id: string | null; error: string | null }> {
  const { data, error } = await supabase
    .from("registration_payments")
    .insert({
      competition_slug: input.competitionSlug,
      competition_title: input.competitionTitle,
      submitted_by: input.submittedBy,
      submitted_by_name: input.submittedByName,
      school_id: input.schoolId,
      school_name: input.schoolName,
      entry_count: input.entryCount,
      amount_expected: input.amountExpected,
      receipt_url: input.receiptPath,
    })
    .select("id")
    .single();

  if (error || !data) return { id: null, error: error?.message ?? "Failed to record the payment." };

  if (registrationIds.length > 0) {
    const { error: linkError } = await supabase.from("registrations").update({ payment_id: data.id }).in("id", registrationIds);
    if (linkError) return { id: data.id, error: `Payment saved, but linking it to your registration(s) failed: ${linkError.message}` };
  }

  return { id: data.id, error: null };
}

/** Admin overview: every payment across every school/student, unscoped. */
export async function adminListAllPayments(admin: SupabaseClient): Promise<RegistrationPayment[]> {
  const { data, error } = await admin.from("registration_payments").select(SELECT).order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as Row[]).map(toPayment);
}

export async function reviewPayment(
  admin: SupabaseClient,
  paymentId: string,
  status: Extract<PaymentStatus, "approved" | "rejected">,
  reviewedBy: string,
  reviewNote: string | null,
): Promise<{ error: string | null }> {
  const { error } = await admin
    .from("registration_payments")
    .update({ status, reviewed_by: reviewedBy, reviewed_at: new Date().toISOString(), review_note: reviewNote })
    .eq("id", paymentId);
  return { error: error?.message ?? null };
}

/** A signed-in user's own payment history, for the dashboard registrations
 * list to show "payment under review" instead of the raw registration
 * status until it clears. */
export async function listOwnPaymentStatuses(supabase: SupabaseClient, submittedBy: string): Promise<Map<string, PaymentStatus>> {
  const { data, error } = await supabase.from("registration_payments").select("id, status").eq("submitted_by", submittedBy);
  if (error || !data) return new Map();
  return new Map((data as { id: string; status: PaymentStatus }[]).map((r) => [r.id, r.status]));
}
