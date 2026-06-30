import {
  adminSurfaceInputClassName,
  type AdminFormVariant,
} from "./styles";

interface AdminSelectFieldProps {
  id: string;
  name: string;
  label: string;
  options: readonly string[];
  variant: AdminFormVariant;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
}

export default function AdminSelectField({
  id,
  name,
  label,
  options,
  variant,
  defaultValue,
  placeholder = "-- 선택하세요 --",
  required = false,
}: AdminSelectFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-base font-medium text-[var(--color-admin-text)]"
      >
        {label}
      </label>
      <select
        id={id}
        name={name}
        required={required}
        defaultValue={defaultValue}
        className={adminSurfaceInputClassName(variant)}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
