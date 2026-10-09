import type { PaymentAccount } from "@/domain/payments/types";

const ROWS = [
  ["Bank", "bankName"],
  ["Account title", "accountTitle"],
  ["Account number", "accountNumber"],
  ["IBAN", "iban"],
] as const;

/** Shown next to every fee-receipt upload. The account itself is whatever
 * an admin saved on the bank-account screen. */
export function PaymentInstructions({ account, amount }: { account: PaymentAccount; amount: string | null }) {
  const rows = ROWS.flatMap(([label, key]) => {
    const value = account[key].trim();
    return value ? [{ label, value }] : [];
  });

  return (
    <div className="rounded-xl border border-border bg-background p-4 text-sm">
      <p className="text-foreground">
        Transfer {amount ? <span className="font-semibold">{amount}</span> : "the fee"} to the League bank account.
        You can transfer it online or pay in person at the bank, then upload a photo or PDF of the receipt.
      </p>
      {rows.length > 0 && (
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          {rows.map((row) => (
            <div key={row.label}>
              <dt className="text-xs text-muted">{row.label}</dt>
              <dd className="font-semibold break-all text-foreground">{row.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
