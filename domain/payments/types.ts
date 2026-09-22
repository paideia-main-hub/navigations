// Domain types for competition fee payments. A payment is created once a
// student or school coordinator uploads a receipt, and can cover more than
// one registration — a coordinator registering several students into the
// same competition pays once (fee x number of students) and uploads a
// single receipt, rather than one receipt per student.

export type PaymentStatus = "pending_review" | "approved" | "rejected";

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  pending_review: "Payment under review",
  approved: "Payment approved",
  rejected: "Payment rejected",
};

export interface RegistrationPayment {
  id: string;
  competitionSlug: string;
  competitionTitle: string;
  submittedByName: string;
  schoolName: string | null;
  entryCount: number;
  amountExpected: number | null;
  /** Storage path in the private `fee-receipts` bucket, not a viewable URL —
   * resolve with getReceiptSignedUrl() when an admin needs to look at it. */
  receiptPath: string;
  status: PaymentStatus;
  reviewNote: string | null;
  createdAt: string;
}

export interface SubmitPaymentInput {
  competitionSlug: string;
  competitionTitle: string;
  schoolId: string | null;
  schoolName: string | null;
  /** Number of registrations this one receipt covers — 1 for a student or a
   * single team entry, N for a coordinator paying for N individual entries
   * at once. */
  entryCount: number;
  /** competition.feeAmount * entryCount, snapshot at submission time so a
   * later fee change doesn't rewrite history. */
  amountExpected: number | null;
  /** The registrations this payment applies to — every id gets its
   * payment_id set to the new payment's id. */
  registrationIds: string[];
  receiptFile: File;
}
