"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/data/supabase/server";
import { createAdminClient } from "@/data/supabase/admin";
import { getCurrentUser } from "@/domain/auth/session";
import { requireAdminSession } from "@/domain/admin-auth/guard";
import { uploadReceiptFile, getReceiptSignedUrl } from "@/domain/storage/actions";
import { insertPaymentAndLink, savePaymentAccount } from "./service";
import { reviewPayment as reviewPaymentService } from "./service";
import type { SubmitPaymentInput } from "./types";

/** Uploads the receipt and records the payment against every registration
 * listed — the wizard's final step calls this once the registration(s) it
 * covers already exist. */
export async function submitPaymentAction(
  input: Omit<SubmitPaymentInput, "receiptFile"> & { receiptFile: File },
): Promise<{ paymentId: string | null; error: string | null }> {
  const user = await getCurrentUser();
  if (!user) return { paymentId: null, error: "You must be logged in to submit a payment." };
  if (input.registrationIds.length === 0) return { paymentId: null, error: "No registration to attach this payment to." };

  const { path, error: uploadError } = await uploadReceiptFile(input.receiptFile, user.id);
  if (uploadError || !path) return { paymentId: null, error: uploadError ?? "Failed to upload the receipt." };

  const supabase = await createClient();
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
      receiptPath: path,
    },
    input.registrationIds,
  );

  if (error || !id) return { paymentId: null, error };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/registrations");
  return { paymentId: id, error: null };
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
  };
  if (!account.bankName || !account.accountTitle || !account.accountNumber || !account.iban) {
    return { error: "Bank name, account title, account number and IBAN are all required.", saved: false };
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
  }
  return { error };
}
