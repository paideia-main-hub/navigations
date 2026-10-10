"use client";

import type { PaymentAccount } from "@/domain/payments/types";
import { CopyButton } from "@/ui/components/CopyButton";

const ROWS = [
  ["Bank", "bankName"],
  ["Account title", "accountTitle"],
  ["Account number", "accountNumber"],
  ["IBAN", "iban"],
] as const;

/** Shown next to every fee-receipt upload. The account itself is whatever
 * an admin saved on the bank-account screen. */
export function PaymentInstructions({
  account,
  amount,
  note,
  prominent = false,
}: {
  account: PaymentAccount;
  amount: string | null;
  note?: string;
  prominent?: boolean;
}) {
  const rows = ROWS.flatMap(([label, key]) => {
    const value = account[key].trim();
    return value ? [{ label, value }] : [];
  });

  return (
    <div
      className={
        prominent
          ? "rounded-2xl border border-accent/40 bg-accent-soft p-5 text-sm shadow-sm"
          : "rounded-xl border border-border bg-background p-4 text-sm"
      }
    >
      <p className={prominent ? "font-medium leading-relaxed text-accent-foreground" : "text-foreground"}>
        Transfer {amount ? <span className="font-semibold">{amount}</span> : "the fee"} to the League bank account.
        You can transfer it online or pay in person at the bank, then upload a photo or PDF of the receipt.
      </p>
      {rows.length > 0 && (
        <div className="mt-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs font-semibold tracking-wide text-muted uppercase">Bank details</p>
            <CopyButton text={rows.map((row) => `${row.label}: ${row.value}`).join("\n")} label="bank details" />
          </div>
          <dl className="grid gap-3 sm:grid-cols-2">
            {rows.map((row) => (
              <div key={row.label}>
                <dt className="text-xs text-muted">{row.label}</dt>
                <dd className="font-semibold break-all text-foreground">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
      {note ? (
        <p
          className={
            prominent
              ? "mt-3 border-t border-accent/30 pt-3 font-medium leading-relaxed text-accent-foreground"
              : "mt-3 text-muted"
          }
        >
          {note}
        </p>
      ) : null}
    </div>
  );
}
