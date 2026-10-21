/**
 * Pakistan phone helpers for form validation.
 *
 * Mobile (Jazz/Telenor/Zong/Ufone etc.): national `03XX XXXXXXX` (11 digits with 0)
 * or international `+92 3XX XXXXXXX`.
 * Landline: area code length varies by city, so we only enforce a sensible digit range.
 */

/** HTML `pattern` for Pakistan mobile (spaces/dashes allowed). */
export const PK_MOBILE_PATTERN = "(\\+92|0)?3[0-9]{2}[\\s\\-]?[0-9]{7}";

export const PK_MOBILE_TITLE =
  "Use a Pakistan mobile number, e.g. 0300 1234567 or +92 300 1234567.";

export const PK_MOBILE_PLACEHOLDER = "0300 1234567";

/** HTML `pattern` for school / landline-style phones (city codes vary). */
export const PK_LANDLINE_PATTERN = "[+]?[0-9\\s()\\-]{10,15}";

export const PK_LANDLINE_TITLE =
  "Use a Pakistan landline with city code, e.g. 021 34567890 or +92 21 34567890.";

/** True when value is a Pakistan mobile after stripping spaces/dashes/parentheses. */
export function isPakistanMobile(value: string): boolean {
  const digits = value.replace(/[^\d+]/g, "");
  return /^(\+92|0)?3\d{9}$/.test(digits);
}
