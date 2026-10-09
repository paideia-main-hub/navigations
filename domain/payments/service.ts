import type { SupabaseClient } from "@supabase/supabase-js";
import * as repo from "@/data/repositories/payments.repository";
import type { PaymentStatus, RegistrationPayment } from "./types";

export async function listAllPayments(admin: SupabaseClient): Promise<RegistrationPayment[]> {
  return repo.adminListAllPayments(admin);
}

export async function reviewPayment(
  admin: SupabaseClient,
  paymentId: string,
  status: Extract<PaymentStatus, "approved" | "rejected">,
  reviewedBy: string,
  reviewNote: string | null,
): Promise<{ error: string | null }> {
  return repo.reviewPayment(admin, paymentId, status, reviewedBy, reviewNote);
}

export type { InsertPaymentInput } from "@/data/repositories/payments.repository";
export const insertPaymentAndLink = repo.insertPaymentAndLink;
export const listOwnPaymentStatuses = repo.listOwnPaymentStatuses;
export const getPaymentAccount = repo.getPaymentAccount;
export const savePaymentAccount = repo.savePaymentAccount;
