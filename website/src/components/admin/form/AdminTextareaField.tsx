import {
  adminInputClassName,
  type AdminFormVariant,
} from "./styles";

interface AdminTextareaFieldProps {
  id: string;
  name: string;
  label: string;
  variant: AdminFormVariant;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  rows: number;
}

export default function AdminTextareaField({
  id,
  name,
  label,
  variant,
  defaultValue,
  placeholder,
  required = false,
  rows,
}: AdminTextareaFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-base font-medium text-[var(--color-admin-text)]"
      >
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        required={required}
        rows={rows}
        defaultValue={defaultValue}
        className={`${adminInputClassName(variant)} resize-y`}
        placeholder={placeholder}
      />
    </div>
  );
}
