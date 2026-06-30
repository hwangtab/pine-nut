"use client";

import { useFormStatus } from "react-dom";
import {
  adminSubmitButtonClassName,
  type AdminFormVariant,
} from "./styles";

interface AdminSubmitButtonProps {
  label: string;
  variant: AdminFormVariant;
}

export default function AdminSubmitButton({
  label,
  variant,
}: AdminSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={adminSubmitButtonClassName(variant)}
    >
      {pending ? "저장 중..." : label}
    </button>
  );
}
