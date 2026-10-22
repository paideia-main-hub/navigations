-- Toggle: when true, checkout hard-blocks Submit until OCR finds the
-- hamper amount, Paideia Ventures (Private), and account suffix 1953
-- on the uploaded receipt image/PDF.

alter table payment_account
  add column if not exists require_receipt_ocr boolean not null default true;

comment on column payment_account.require_receipt_ocr is
  'When true, fee-receipt upload must pass OCR checks before Submit is enabled.';
