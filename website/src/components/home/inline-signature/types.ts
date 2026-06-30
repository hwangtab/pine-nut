import type { FormEvent } from "react";

export interface HomeInlineSignatureFormProps {
  onSignatureCountChange: (count: number) => void;
}

export interface HomeInlineSignatureFieldsProps {
  name: string;
  email: string;
  namePlaceholder: string;
  emailPlaceholder: string;
  submitting: boolean;
  error: string | null;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
}

export interface HomeInlineSignatureState extends HomeInlineSignatureFieldsProps {
  success: boolean;
  isEditMode: boolean;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}
