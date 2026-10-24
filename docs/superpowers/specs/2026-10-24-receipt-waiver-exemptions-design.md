# Per-coordinator fee receipt waiver (design)

**Date:** 2026-10-24  
**Status:** Approved — implemented  
**Approach:** Join table of exempt schools (Option B)

## Problem

Some school coordinators must complete hamper / fee checkout **without** seeing bank details, uploading a receipt, or running OCR. Admin must still see those payments in Directory → Payment approval and approve/reject them, with a clear status note that no receipt was required.

## Goals

- Admin can exempt **many** schools; each exemption is added **one school at a time** (single picker + Add), not a multi-select.
- Exempt coordinator checkout: hide bank details, hide receipt upload, skip OCR; still create a payment for admin review.
- Non-exempt (or exemption removed): full frontend checks apply again (bank details + required receipt + OCR when the global OCR toggle is on).
- Directory payment row looks the same (Approve / Reject); Status column shows an extra message when receipt was waived.

## Non-goals

- Auto-approving waived payments.
- Exempting students / independent payers.
- Changing the global “Require OCR checks on fee receipts” toggle semantics for non-exempt users.
- Multi-select bulk add of exemptions.

## Data model

### `payment_receipt_exemptions`

| Column | Type | Notes |
|--------|------|--------|
| `id` | uuid PK | |
| `school_id` | uuid UNIQUE NOT NULL | FK → `schools(id)` ON DELETE CASCADE |
| `created_by` | uuid | FK → `profiles(id)` (admin who added) |
| `created_at` | timestamptz | default now() |

Keyed by **school** so the waiver applies to that school’s coordinator checkout (current model: coordinator ↔ school via `school_coordinators`).

Admin-only writes via service-role; no public insert.

### `registration_payments` changes

- `receipt_path` (or current receipt column): **nullable**.
- `receipt_waived` boolean NOT NULL default `false`.

Waived payments: `receipt_waived = true`, `receipt_path` null, `status = pending_review` until admin reviews.

## Admin UI — Bank account (`/admin/payment-account`)

Keep existing bank fields + OCR checkbox.

New section: **Receipt upload exemptions**

1. Dropdown of schools (label: school name + coordinator name when available).
2. **Add exemption** — inserts one row; ignore / error if already exempt.
3. List of current exemptions with **Remove**.

Many schools may appear in the list at once; the control only adds one per action.

## Checkout behavior (coordinator / school hamper & school entry payment)

**If coordinator’s school is in `payment_receipt_exemptions`:**

- Do not show bank account details.
- Do not show receipt file field.
- Do not run OCR.
- Submit creates payment with `receipt_waived = true` and no file upload.

**If not exempt (or exemption removed later):**

- Show bank details as today.
- Require receipt upload.
- Apply OCR when `payment_account.require_receipt_ocr` is true.

**Server enforcement:** waived submit path must verify the caller is a school coordinator whose school is currently exempt; otherwise reject. Non-waived path still requires a receipt file.

Students and any payer without an exempt school are unchanged.

## Directory → Payment approval

- Same table columns and Approve / Reject actions.
- When `receipt_waived`:
  - **Status:** existing badge + note under it, e.g.  
    `Receipt waived — no upload required for this coordinator.`
  - **Receipt:** show “No receipt” (no “View receipt”); review modal does not load a file.
- When not waived: unchanged (View receipt + OCR-unrelated review flow).

## Domain / API sketch

- `listReceiptExemptions`, `addReceiptExemption(schoolId)`, `removeReceiptExemption(schoolId)` — admin actions; revalidate `/admin/payment-account`.
- `isSchoolReceiptWaived(schoolId)` (or by coordinator profile id) — used by checkout pages and submit action.
- `submitPaymentAction`: accept optional waived path (`receiptFile` optional when waived + server-confirmed).
- Map `receipt_waived` onto `RegistrationPayment` for `PaymentsTable`.

## Migration

- New migration after `0036_payment_account_receipt_ocr.sql` (e.g. `0037_payment_receipt_exemptions.sql`).
- Must be applied on live DB before relying on the feature in production.

## Success criteria

1. Admin can add school A, then school B; both stay exempt until removed individually.
2. Exempt coordinator sees no bank block, no upload, no OCR on hamper/fee step; payment still appears under Directory payments as pending.
3. Status column shows the waiver message; Approve/Reject still work without a receipt file.
4. After Remove, that coordinator’s next checkout shows bank + receipt (+ OCR if enabled) again.
