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

export interface HomeInlineSignatureConsentProps {
  /** 개인정보 수집·이용 및 만 14세 이상 동의 여부. 서명의 법적 전제라 필수다. */
  agreed: boolean;
  onAgreedChange: (value: boolean) => void;
}

export interface HomeInlineSignatureState
  extends HomeInlineSignatureFieldsProps,
    HomeInlineSignatureConsentProps {
  success: boolean;
  isEditMode: boolean;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}
