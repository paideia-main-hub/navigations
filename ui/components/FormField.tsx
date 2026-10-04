import { PasswordInput } from "@/ui/components/PasswordInput";

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
}) {
  const resolvedAutoComplete =
    autoComplete ?? (type === "password" ? "new-password" : undefined);

  return (
    <div>
      <label className="text-sm font-medium text-foreground">{label}</label>
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
      ) : (
        <input
          type={type}
          name={name}
          required={required}
          defaultValue={defaultValue}
          autoComplete={resolvedAutoComplete}
          pattern={pattern}
          minLength={minLength}
          maxLength={maxLength}
          min={min}
          max={max}
          inputMode={inputMode}
          placeholder={placeholder}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
        />
      )}
    </div>
  );
}
