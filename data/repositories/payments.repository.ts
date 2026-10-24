import type { SupabaseClient } from "@supabase/supabase-js";
import {
  emptyPaymentAccount,
  type PaymentAccount,
  type PaymentStatus,
  type ReceiptExemption,
  type RegistrationPayment,
} from "@/domain/payments/types";

type Row = {
  id: string;
  competition_slug: string;
  competition_title: string;
  submitted_by_name: string;
  school_name: string | null;
  entry_count: number;
  amount_expected: number | null;
  receipt_url: string | null;
  receipt_waived?: boolean | null;
  status: PaymentStatus;
  review_note: string | null;
  created_at: string;
};

const SELECT =
  "id, competition_slug, competition_title, submitted_by_name, school_name, entry_count, amount_expected, receipt_url, receipt_waived, status, review_note, created_at";

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
    receiptWaived: row.receipt_waived === true,
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
  receiptPath: string | null;
  receiptWaived?: boolean;
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
  const receiptWaived = input.receiptWaived === true;
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
      receipt_url: receiptWaived ? null : input.receiptPath,
      receipt_waived: receiptWaived,
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

export async function isSchoolReceiptWaived(supabase: SupabaseClient, schoolId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("payment_receipt_exemptions")
    .select("school_id")
    .eq("school_id", schoolId)
    .maybeSingle();
  return !error && Boolean(data);
}

export async function listReceiptExemptions(admin: SupabaseClient): Promise<ReceiptExemption[]> {
  const { data, error } = await admin
    .from("payment_receipt_exemptions")
    .select(
      "school_id, created_at, schools(official_name, school_coordinators(profiles(full_name)))",
    )
    .order("created_at", { ascending: false });
  if (error || !data) return [];

  type Link = { profiles: { full_name: string } | null } | null;
  type SchoolJoin = {
    official_name: string;
    school_coordinators: Link[] | null;
  };

  return (data as unknown as { school_id: string; created_at: string; schools: SchoolJoin | SchoolJoin[] | null }[]).map(
    (row) => {
      const school = Array.isArray(row.schools) ? row.schools[0] ?? null : row.schools;
      const coordinators = school?.school_coordinators ?? [];
      const names = coordinators
        .map((link) => link?.profiles?.full_name?.trim() ?? "")
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b));
      return {
        schoolId: row.school_id,
        schoolName: school?.official_name?.trim() || "School",
        coordinatorName: names[0] ?? null,
        createdAt: row.created_at,
      };
    },
  );
}

export async function addReceiptExemption(
  admin: SupabaseClient,
  schoolId: string,
  createdBy: string,
): Promise<{ error: string | null }> {
  const { error } = await admin.from("payment_receipt_exemptions").insert({
    school_id: schoolId,
    created_by: createdBy,
  });
  if (error?.code === "23505") return { error: "That school is already exempt from receipt upload." };
  return { error: error?.message ?? null };
}

export async function removeReceiptExemption(
  admin: SupabaseClient,
  schoolId: string,
): Promise<{ error: string | null }> {
  const { error } = await admin.from("payment_receipt_exemptions").delete().eq("school_id", schoolId);
  return { error: error?.message ?? null };
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

type AccountRow = {
  bank_name: string;
  account_title: string;
  account_number: string;
  iban: string;
  require_receipt_ocr?: boolean | null;
};

function toAccount(row: AccountRow): PaymentAccount {
  return {
    bankName: row.bank_name ?? "",
    accountTitle: row.account_title ?? "",
    accountNumber: row.account_number ?? "",
    iban: row.iban ?? "",
    requireReceiptOcr: row.require_receipt_ocr !== false,
  };
}

/** The single published bank account. A missing row reads as empty so a
 * page can still render before an admin fills the account in. */
export async function getPaymentAccount(supabase: SupabaseClient): Promise<PaymentAccount> {
  const { data, error } = await supabase
    .from("payment_account")
    .select("bank_name, account_title, account_number, iban, require_receipt_ocr")
    .eq("id", 1)
    .maybeSingle();
  if (error || !data) return emptyPaymentAccount;
  return toAccount(data as AccountRow);
}

export async function savePaymentAccount(admin: SupabaseClient, account: PaymentAccount): Promise<{ error: string | null }> {
  const { error } = await admin.from("payment_account").upsert({
    id: 1,
    bank_name: account.bankName,
    account_title: account.accountTitle,
    account_number: account.accountNumber,
    iban: account.iban,
    require_receipt_ocr: account.requireReceiptOcr,
    updated_at: new Date().toISOString(),
  });
  return { error: error?.message ?? null };
}
