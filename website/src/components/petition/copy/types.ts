export interface PetitionEditableTextCopy {
  contentKey: string;
  defaultValue: string;
}

export interface PetitionEditableValueCopy extends PetitionEditableTextCopy {
  buttonLabel: string;
  multiline?: boolean;
}

export interface PetitionSignatureFormCopy {
  page: string;
  fieldIdPrefix: string;
  labels: {
    name: PetitionEditableTextCopy;
    email: PetitionEditableTextCopy;
    emailOptional: PetitionEditableTextCopy;
    emailNote: PetitionEditableTextCopy;
    message: PetitionEditableTextCopy;
    messageOptional: PetitionEditableTextCopy;
    regionLabel: PetitionEditableTextCopy;
    /** 세종처럼 시·군·구가 없는 시·도를 골랐을 때 띄우는 안내. */
    regionNoSubNote: PetitionEditableTextCopy;
    affiliationLabel: PetitionEditableTextCopy;
    namePublicLabel: PetitionEditableTextCopy;
    namePublicYes: PetitionEditableTextCopy;
    namePublicNo: PetitionEditableTextCopy;
    namePublicNote: PetitionEditableTextCopy;
    privacyPrefix?: PetitionEditableTextCopy;
    privacyToggle: PetitionEditableTextCopy;
    privacySuffix: PetitionEditableTextCopy;
    age: PetitionEditableTextCopy;
    submit: PetitionEditableTextCopy;
    submitting: PetitionEditableTextCopy;
  };
  placeholders: {
    name: PetitionEditableValueCopy;
    email: PetitionEditableValueCopy;
    message: PetitionEditableValueCopy;
    affiliationPlaceholder: PetitionEditableValueCopy;
    regionTopPlaceholder: PetitionEditableValueCopy;
    regionSubPlaceholder: PetitionEditableValueCopy;
    overseasSubPlaceholder: PetitionEditableValueCopy;
  };
  errors: {
    name: PetitionEditableValueCopy;
    emailRequired: PetitionEditableValueCopy;
    emailInvalid: PetitionEditableValueCopy;
    privacy: PetitionEditableValueCopy;
    age: PetitionEditableValueCopy;
    submit: PetitionEditableValueCopy;
  };
  privacyLines: PetitionEditableTextCopy[];
}

export interface PetitionSuccessCopy {
  page: string;
  countLocale: string;
  titlePrefix: PetitionEditableTextCopy;
  titleSuffix: PetitionEditableTextCopy;
  countPrefix?: PetitionEditableTextCopy;
  countSuffix: PetitionEditableTextCopy;
  sharePrompt?: PetitionEditableTextCopy;
  primaryShare: PetitionEditableTextCopy;
  primaryShareClassName: string;
  twitterShare: PetitionEditableTextCopy;
  copyLabel: PetitionEditableTextCopy;
  copiedLabel: PetitionEditableTextCopy;
  resetLabel?: PetitionEditableTextCopy;
}

export interface PetitionShareEditField extends PetitionEditableValueCopy {
  page: string;
  section: string;
}
