import { DateField } from "@/ui/components/DateField";
import { PasswordInput } from "@/ui/components/PasswordInput";
import { RequiredMark } from "@/ui/components/RequiredMark";
import {
  PK_LANDLINE_PATTERN,
  PK_LANDLINE_TITLE,
  PK_MOBILE_PATTERN,
  PK_MOBILE_PLACEHOLDER,
  PK_MOBILE_TITLE,
} from "@/domain/phone";

/** Digits plus common phone punctuation. Used for type="tel" input filtering. */
const PHONE_CHARS = /[^+\d\s()\-]/g;

export function FormField({
  label,
  name,
  type = "text",
  required = false,
  defaultValue,
  autoComplete,
  pattern,
  minLength,
  maxLength,
  min,
  max,
  inputMode,
  placeholder,
  title,
  phoneKind,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  autoComplete?: string;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  min?: string;
  max?: string;
  inputMode?: "text" | "email" | "tel" | "url" | "numeric" | "decimal" | "search";
  placeholder?: string;
  title?: string;
  /** When set with type="tel", applies Pakistan mobile or landline format rules. */
  phoneKind?: "pk-mobile" | "pk-landline";
}) {
  const resolvedAutoComplete =
    autoComplete ?? (type === "password" ? "new-password" : undefined);
  const isTel = type === "tel";
  const resolvedPattern =
    pattern ??
    (phoneKind === "pk-mobile"
      ? PK_MOBILE_PATTERN
      : phoneKind === "pk-landline"
        ? PK_LANDLINE_PATTERN
        : undefined);
  const resolvedTitle =
    title ??
    (phoneKind === "pk-mobile"
      ? PK_MOBILE_TITLE
      : phoneKind === "pk-landline"
        ? PK_LANDLINE_TITLE
        : isTel
          ? "Use a phone number with digits only (you can include +, spaces, or dashes)."
          : undefined);
  const resolvedPlaceholder =
    placeholder ?? (phoneKind === "pk-mobile" ? PK_MOBILE_PLACEHOLDER : undefined);

  return (
    <div>
      <label className="text-sm font-medium text-foreground">
        {label}
        {required ? <RequiredMark /> : null}
      </label>
      {type === "password" ? (
        <PasswordInput
          name={name}
          required={required}
          defaultValue={defaultValue}
          autoComplete={
            resolvedAutoComplete === "current-password" || resolvedAutoComplete === "new-password"
              ? resolvedAutoComplete
              : "new-password"
          }
          minLength={minLength}
        />
      ) : type === "date" ? (
        <DateField
          name={name}
          label={label}
          required={required}
          defaultValue={defaultValue}
          min={min}
          max={max}
          className="mt-1"
        />
      ) : (
        <input
          type={type}
          name={name}
          required={required}
          defaultValue={defaultValue}
          autoComplete={resolvedAutoComplete}
          pattern={resolvedPattern}
          title={resolvedTitle}
          minLength={minLength}
          maxLength={maxLength ?? (phoneKind === "pk-mobile" ? 16 : undefined)}
          min={min}
          max={max}
          inputMode={inputMode ?? (isTel ? "tel" : undefined)}
          placeholder={resolvedPlaceholder}
          onInput={
            isTel
              ? (event) => {
                  const input = event.currentTarget;
                  const cleaned = input.value.replace(PHONE_CHARS, "");
                  if (cleaned !== input.value) input.value = cleaned;
                }
              : undefined
          }
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
        />
      )}
    </div>
  );
}
