# Receipt Waiver Exemptions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let admins exempt schools one-at-a-time (many allowed) so those coordinators skip bank details, receipt upload, and OCR; payments still appear in Directory for approval with a status note.

**Architecture:** Join table `payment_receipt_exemptions` keyed by `school_id`. Checkout reads waiver for the coordinator’s school. Waived submits create `registration_payments` with `receipt_waived=true` and null `receipt_url`. Admin Bank page manages add/remove; PaymentsTable shows waiver copy under Status.

**Tech Stack:** Next.js App Router, Supabase Postgres/RLS, existing payments domain (`domain/payments`, `data/repositories/payments.repository.ts`).

## Global Constraints

- Many schools can be exempt; UI adds/removes **one school per action**.
- Exempt coordinator hamper: **no bank details, no receipt upload, no OCR**.
- Non-exempt: full frontend checks (bank + receipt + OCR if global toggle on).
- Do not auto-approve waived payments.
- Students unchanged.
- Commits only if the user explicitly asks.

## File map

| File | Role |
|------|------|
| `supabase/migrations/0037_payment_receipt_exemptions.sql` | Table + nullable receipt + `receipt_waived` |
| `domain/payments/types.ts` | `receiptWaived`, exemption types; nullable `receiptPath` |
| `data/repositories/payments.repository.ts` | CRUD exemptions; map waived payments |
| `domain/payments/service.ts` | Re-export exemption helpers |
| `domain/payments/actions.ts` | Add/remove exemption; waived `submitPaymentAction` |
| `domain/registrations/actions.ts` | `submitSchoolEntriesAction` waived path |
| `ui/components/admin/ReceiptExemptionPanel.tsx` | Bank-page picker + list |
| `ui/components/admin/PaymentAccountForm.tsx` | Mount panel (or page mounts separately) |
| `app/admin/(protected)/payment-account/page.tsx` | Load schools + exemptions |
| `app/dashboard/layout.tsx` | Pass `receiptWaived` into school hamper |
| `ui/components/registration/SchoolHamperList.tsx` | Thread prop |
| `ui/components/registration/SchoolEntryPayment.tsx` | Hide bank/receipt when waived |
| `ui/components/registration/RegistrationWizard.tsx` | Same for school-mode payment step if used |
| `ui/components/admin/PaymentsTable.tsx` | Status note + no View receipt when waived |

---

### Task 1: Migration + repository types

**Files:**
- Create: `supabase/migrations/0037_payment_receipt_exemptions.sql`
- Modify: `domain/payments/types.ts`, `data/repositories/payments.repository.ts`, `domain/payments/service.ts`

- [ ] **Step 1: Add migration**

```sql
create table payment_receipt_exemptions (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null unique references schools(id) on delete cascade,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table payment_receipt_exemptions enable row level security;

alter table registration_payments
  alter column receipt_url drop not null;

alter table registration_payments
  add column if not exists receipt_waived boolean not null default false;

comment on column registration_payments.receipt_waived is
  'True when the payer school was exempt from uploading a fee receipt.';
```

- [ ] **Step 2: Extend types**

- `RegistrationPayment.receiptPath: string | null`
- `RegistrationPayment.receiptWaived: boolean`
- `InsertPaymentInput.receiptPath: string | null` + `receiptWaived?: boolean`
- `ReceiptExemption { schoolId, schoolName, coordinatorName, createdAt }`

- [ ] **Step 3: Repository**

- Map `receipt_waived` / nullable `receipt_url` in `toPayment` + SELECT.
- `insertPaymentAndLink`: write `receipt_waived`, allow null `receipt_url`.
- `listReceiptExemptions(admin)`, `addReceiptExemption(admin, schoolId, createdBy)`, `removeReceiptExemption(admin, schoolId)`, `isSchoolReceiptWaived(client, schoolId)`.

---

### Task 2: Admin bank UI

**Files:**
- Create: `ui/components/admin/ReceiptExemptionPanel.tsx`
- Modify: `app/admin/(protected)/payment-account/page.tsx`, `domain/payments/actions.ts`

- [ ] **Step 1: Server actions** `addReceiptExemptionAction(schoolId)`, `removeReceiptExemptionAction(schoolId)` — require admin; revalidate `/admin/payment-account`.

- [ ] **Step 2: Panel** — select (schools not yet exempt, label `School — Coordinator`) + Add; list with Remove.

- [ ] **Step 3: Page** — `adminListSchools` + exemptions; render panel under `PaymentAccountForm`.

---

### Task 3: Checkout UI + submit

**Files:**
- Modify: `app/dashboard/layout.tsx`, `SchoolHamperList.tsx`, `SchoolEntryPayment.tsx`, `RegistrationWizard.tsx` (school payment), `domain/payments/actions.ts`, `domain/registrations/actions.ts`

- [ ] **Step 1:** Layout computes `receiptWaived` via `isSchoolReceiptWaived` for coordinator school; pass into `SchoolEntryListProvider`.

- [ ] **Step 2:** `SchoolEntryPayment`: when `receiptWaived`, omit `PaymentInstructions` + `ReceiptFileField`; enable Submit without file; send `receipt_waived=on` (no `receipt` file).

- [ ] **Step 3:** `submitSchoolEntriesAction`: if waived flag and school exempt, call payment without file; else require receipt as today.

- [ ] **Step 4:** `submitPaymentAction`: accept optional `receiptFile` + `receiptWaived`; if waived, verify school exempt and insert with null path; else require file.

- [ ] **Step 5:** Mirror waive UI in `RegistrationWizard` school payment step when applicable.

---

### Task 4: Directory PaymentsTable

**Files:**
- Modify: `ui/components/admin/PaymentsTable.tsx`

- [ ] **Step 1:** Status cell: if `receiptWaived`, show note `Receipt waived — no upload required for this coordinator.` under badge.

- [ ] **Step 2:** Receipt column / modal: if waived, show “No receipt”; skip signed URL / print.

---

### Task 5: Verify

- [ ] Typecheck / lint touched files.
- [ ] Manual: add exemption → coordinator hamper has no bank/upload → payment pending with note → remove exemption → checks return.
- [ ] Remind: apply `0037` on live DB (and `0036` if not yet).
