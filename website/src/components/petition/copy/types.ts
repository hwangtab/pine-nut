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
    affiliationOptional: PetitionEditableTextCopy;
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
    /** 제출 실패 폴백 문구. 필드 검증 문구는 src/lib/signatures/form.ts가
     *  소유한다 — 예전엔 여기에도 name/email/privacy/age가 있었지만 읽는
     *  쪽이 사라져 편집해도 화면이 바뀌지 않는 죽은 카피였다. */
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
  /**
   * 같은 이메일로 다시 서명해 기존 서명이 갱신된 경우에만 뜨는 안내.
   * 이때는 총 서명 수가 늘지 않으므로 서수 문장(countSuffix)을 대신한다.
   */
  updatedNote: PetitionEditableTextCopy;
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
