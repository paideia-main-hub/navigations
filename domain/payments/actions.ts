"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/data/supabase/server";
import { createAdminClient } from "@/data/supabase/admin";
import { getCurrentUser } from "@/domain/auth/session";
import { requireAdminSession } from "@/domain/admin-auth/guard";
import { uploadReceiptFile, getReceiptSignedUrl } from "@/domain/storage/actions";
import {
  addReceiptExemption,
  insertPaymentAndLink,
  isSchoolReceiptWaived,
  removeReceiptExemption,
  savePaymentAccount,
} from "./service";
import { reviewPayment as reviewPaymentService } from "./service";
import type { SubmitPaymentInput } from "./types";

/** Uploads the receipt (unless waived) and records the payment against every
 * registration listed — the wizard's final step calls this once the
 * registration(s) it covers already exist. */
export async function submitPaymentAction(
  input: SubmitPaymentInput,
): Promise<{ paymentId: string | null; error: string | null }> {
  const user = await getCurrentUser();
  if (!user) return { paymentId: null, error: "You must be logged in to submit a payment." };
  if (input.registrationIds.length === 0) return { paymentId: null, error: "No registration to attach this payment to." };

  const supabase = await createClient();
  let receiptPath: string | null = null;
  let receiptWaived = false;

  if (input.receiptWaived) {
    if (!input.schoolId) return { paymentId: null, error: "Receipt waiver only applies to a school payment." };
    const waived = await isSchoolReceiptWaived(supabase, input.schoolId);
    if (!waived) {
      return { paymentId: null, error: "This school is not exempt from uploading a fee receipt." };
    }
    receiptWaived = true;
  } else {
    const file = input.receiptFile;
    if (!(file instanceof File) || file.size === 0) {
      return { paymentId: null, error: "Please attach your fee receipt." };
    }
    const { path, error: uploadError } = await uploadReceiptFile(file, user.id);
    if (uploadError || !path) return { paymentId: null, error: uploadError ?? "Failed to upload the receipt." };
    receiptPath = path;
  }

  const { id, error } = await insertPaymentAndLink(
    supabase,
    {
      competitionSlug: input.competitionSlug,
      competitionTitle: input.competitionTitle,
      submittedBy: user.id,
      submittedByName: user.fullName,
      schoolId: input.schoolId,
      schoolName: input.schoolName,
      entryCount: input.entryCount,
      amountExpected: input.amountExpected,
      receiptPath,
      receiptWaived,
    },
    input.registrationIds,
  );

  if (error || !id) return { paymentId: null, error };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/registrations");
  return { paymentId: id, error: null };
}

export async function addReceiptExemptionAction(
  schoolId: string,
): Promise<{ error: string | null }> {
  const admin = await requireAdminSession();
  const id = schoolId.trim();
  if (!id) return { error: "Choose a school to exempt." };
  const { error } = await addReceiptExemption(createAdminClient(), id, admin.id);
  if (!error) {
    revalidatePath("/admin/payment-account");
    revalidatePath("/dashboard");
  }
  return { error };
}

export async function removeReceiptExemptionAction(
  schoolId: string,
): Promise<{ error: string | null }> {
  await requireAdminSession();
  const id = schoolId.trim();
  if (!id) return { error: "Missing school." };
  const { error } = await removeReceiptExemption(createAdminClient(), id);
  if (!error) {
    revalidatePath("/admin/payment-account");
    revalidatePath("/dashboard");
  }
  return { error };
}

/** Admin-only: resolves a receipt's storage path to a short-lived viewable
 * link for the payment approvals screen. */
export async function getReceiptViewUrlAction(path: string): Promise<{ url: string | null; error: string | null }> {
  await requireAdminSession();
  return getReceiptSignedUrl(path);
}

export async function approvePaymentAction(paymentId: string): Promise<{ error: string | null }> {
  const admin = await requireAdminSession();
  const supabase = createAdminClient();
  const { error } = await reviewPaymentService(supabase, paymentId, "approved", admin.id, null);
  if (!error) {
    revalidatePath("/admin/payments");
    revalidatePath("/admin/registrations");
    revalidatePath("/admin/directory");
  }
  return { error };
}

export async function updatePaymentAccountAction(
  _prev: { error: string | null; saved: boolean },
  formData: FormData,
): Promise<{ error: string | null; saved: boolean }> {
  await requireAdminSession();
  const account = {
    bankName: String(formData.get("bank_name") ?? "").trim(),
    accountTitle: String(formData.get("account_title") ?? "").trim(),
    accountNumber: String(formData.get("account_number") ?? "").trim(),
    iban: String(formData.get("iban") ?? "").trim(),
    requireReceiptOcr: formData.get("require_receipt_ocr") === "on" || formData.get("require_receipt_ocr") === "true",
  };
  if (!account.bankName || !account.accountTitle || !account.accountNumber) {
    return { error: "Bank name, account title and account number are required.", saved: false };
  }

  const admin = createAdminClient();
  const { error } = await savePaymentAccount(admin, account);
  if (error) return { error, saved: false };

  revalidatePath("/admin/payment-account");
  revalidatePath("/dashboard/register");
  revalidatePath("/dashboard/register", "layout");
  return { error: null, saved: true };
}

export async function rejectPaymentAction(paymentId: string, note: string | null): Promise<{ error: string | null }> {
  const reason = note?.trim() ?? "";
  if (!reason) return { error: "Enter a reason for rejecting this receipt." };

  const admin = await requireAdminSession();
  const supabase = createAdminClient();
  const { error } = await reviewPaymentService(supabase, paymentId, "rejected", admin.id, reason);
  if (!error) {
    revalidatePath("/admin/payments");
    revalidatePath("/admin/registrations");
    revalidatePath("/admin/directory");
  }
  return { error };
}
