import type { FormEvent, RefObject } from "react";
import type {
  PetitionEditableValueCopy,
  PetitionSignatureFormCopy,
} from "@/components/petition/petition-copy";
import type {
  SignatureFormErrorKey,
  SignatureFormErrors,
} from "@/lib/signatures/form";

export interface PetitionSignatureFormProps {
  formRef: RefObject<HTMLFormElement | null>;
  onSubmitted: (result: { name: string; count: number }) => void;
  onRefreshSignatures: () => void;
  copy?: PetitionSignatureFormCopy;
}

export interface PetitionSignatureFieldIds {
  nameId: string;
  emailId: string;
  messageId: string;
  messageCountId: string;
  privacyErrorId: string;
  ageErrorId: string;
}

export interface PetitionSignaturePlaceholders {
  formNamePlaceholder: string;
  formEmailPlaceholder: string;
  formMessagePlaceholder: string;
}

export interface PetitionSignatureFormState {
  isEditMode: boolean;
  submitting: boolean;
  submitError: string;
  name: string;
  email: string;
  message: string;
  agreePrivacy: boolean;
  agreeAge: boolean;
  errors: SignatureFormErrors;
  showPrivacy: boolean;
  ids: PetitionSignatureFieldIds;
  placeholders: PetitionSignaturePlaceholders;
  editFields: PetitionEditableValueCopy[];
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  handleFocusCapture: () => void;
  setName: (value: string) => void;
  setEmail: (value: string) => void;
  setMessage: (value: string) => void;
  setAgreePrivacy: (checked: boolean) => void;
  setAgreeAge: (checked: boolean) => void;
  togglePrivacy: () => void;
  clearError: (key: SignatureFormErrorKey) => void;
}
