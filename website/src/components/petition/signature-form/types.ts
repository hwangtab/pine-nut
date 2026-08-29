import type { FormEvent, RefObject } from "react";
import type {
  PetitionEditableValueCopy,
  PetitionSignatureFormCopy,
} from "@/components/petition/petition-copy";
import type { SignatureFormErrors } from "@/lib/signatures/form";

export type SignatureFormErrorKey = keyof SignatureFormErrors;

export interface PetitionSignatureFormProps {
  formRef: RefObject<HTMLFormElement | null>;
  onSubmitted: (result: { name: string }) => void;
  onRefreshSignatures: () => void;
  copy?: PetitionSignatureFormCopy;
}

export interface PetitionSignatureFieldIds {
  nameId: string;
  emailId: string;
  emailNoteId: string;
  messageId: string;
  messageCountId: string;
  affiliationId: string;
  namePublicYesId: string;
  namePublicNoId: string;
  namePublicNoteId: string;
  namePublicErrorId: string;
  consentErrorId: string;
}

export interface PetitionSignaturePlaceholders {
  formNamePlaceholder: string;
  formEmailPlaceholder: string;
  formMessagePlaceholder: string;
  formAffiliationPlaceholder: string;
  regionTopPlaceholder: string;
  regionSubPlaceholder: string;
  overseasSubPlaceholder: string;
}

export interface PetitionSignatureFormState {
  isEditMode: boolean;
  submitting: boolean;
  submitError: string;
  name: string;
  email: string;
  message: string;
  regionTop: string;
  regionSub: string;
  affiliation: string;
  namePublic: boolean | null;
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
  setRegionTop: (value: string) => void;
  setRegionSub: (value: string) => void;
  setAffiliation: (value: string) => void;
  setNamePublic: (value: boolean) => void;
  /**
   * 화면에는 동의 체크박스가 1개지만 DB는 consent_privacy·consent_age 두 컬럼을
   * 모두 true로 요구한다. 이 setter 하나가 두 state를 함께 세팅한다.
   */
  setAgreeConsent: (checked: boolean) => void;
  togglePrivacy: () => void;
  clearError: (key: SignatureFormErrorKey) => void;
}
