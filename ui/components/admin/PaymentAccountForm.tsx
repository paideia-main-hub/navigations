"use client";

import { useActionState } from "react";
import { updatePaymentAccountAction } from "@/domain/payments/actions";
import type { PaymentAccount } from "@/domain/payments/types";
import { FormField } from "@/ui/components/FormField";

const initialState = { error: null as string | null, saved: false };

export function PaymentAccountForm({ account }: { account: PaymentAccount }) {
  const [state, formAction, pending] = useActionState(updatePaymentAccountAction, initialState);

  return (
    <form action={formAction} className="max-w-xl space-y-4 rounded-xl border border-border bg-surface p-5">
      <div>
        <h2 className="text-lg font-bold text-foreground">Bank account</h2>
        <p className="mt-1 text-sm text-muted">
          These details are shown wherever a student or coordinator uploads a fee receipt, so they know where to
          transfer the amount. A transfer can be made online or in person at the bank.
        </p>
      </div>
      <FormField label="Bank name" name="bank_name" required defaultValue={account.bankName} autoComplete="off" />
      <FormField label="Account title" name="account_title" required defaultValue={account.accountTitle} autoComplete="off" />
      <FormField
        label="Account number"
        name="account_number"
        required
        defaultValue={account.accountNumber}
        autoComplete="off"
        inputMode="numeric"
      />
      <FormField label="IBAN" name="iban" required defaultValue={account.iban} autoComplete="off" />
      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      {state.saved && (
        <p className="text-sm text-emerald-700 dark:text-emerald-400">Saved. These details now appear on every receipt upload.</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save bank account"}
      </button>
    </form>
  );
}
