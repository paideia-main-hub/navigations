import { PasswordInput } from "@/ui/components/PasswordInput";

export function FormField({
  label,
  name,
  type = "text",
  required = false,
  defaultValue,
  autoComplete = "new-password",
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  /** Only read when type="password" — every FormField password field so far
   * is a login (current-password) or a signup/change (new-password), so
   * that's the default; pass "current-password" for a login form. */
  autoComplete?: "current-password" | "new-password";
}) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground">{label}</label>
      {type === "password" ? (
        <PasswordInput name={name} required={required} defaultValue={defaultValue} autoComplete={autoComplete} />
      ) : (
        <input
          type={type}
          name={name}
          required={required}
          defaultValue={defaultValue}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
        />
      )}
    </div>
  );
}
