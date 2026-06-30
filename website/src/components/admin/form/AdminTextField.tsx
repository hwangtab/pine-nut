import {
  adminInputClassName,
  type AdminFormVariant,
} from "./styles";

interface AdminTextFieldProps {
  id: string;
  name: string;
  label: string;
  variant: AdminFormVariant;
  defaultValue?: string | number;
  helperText?: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
}

export default function AdminTextField({
  id,
  name,
  label,
  variant,
  defaultValue,
  helperText,
  placeholder,
  required = false,
  type = "text",
}: AdminTextFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-base font-medium text-[var(--color-admin-text)]"
      >
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className={adminInputClassName(variant)}
        placeholder={placeholder}
      />
      {helperText && (
        <p className="mt-1.5 text-sm text-[var(--color-admin-muted)]">
          {helperText}
        </p>
      )}
    </div>
  );
}
