"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/data/supabase/server";
import { createAdminClient } from "@/data/supabase/admin";
import { getCurrentUser } from "@/domain/auth/session";
import { requireAdminSession } from "@/domain/admin-auth/guard";
import { uploadReceiptFile, getReceiptSignedUrl } from "@/domain/storage/actions";
import { insertPaymentAndLink } from "./service";
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

export async function rejectPaymentAction(paymentId: string, note: string | null): Promise<{ error: string | null }> {
  const admin = await requireAdminSession();
  const supabase = createAdminClient();
  const { error } = await reviewPaymentService(supabase, paymentId, "rejected", admin.id, note);
  if (!error) {
    revalidatePath("/admin/payments");
    revalidatePath("/admin/registrations");
  }
  return { error };
}
