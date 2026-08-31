import { isValidRegionPair } from "@/lib/regions";
import {
  AFFILIATION_MAX_LENGTH,
  EMAIL_PATTERN,
  MESSAGE_MAX_LENGTH,
  NAME_MAX_LENGTH,
} from "@/lib/signatures/api/config";
import {
  submitSignature,
  type SignaturePayload,
  type SignatureSubmitMode,
} from "@/lib/signatures/client";

export interface SignatureFormValues {
  name: string;
  email: string;
  message: string;
  regionTop: string;
  regionSub: string;
  affiliation: string;
  namePublic: boolean | null;
  agreePrivacy: boolean;
  agreeAge: boolean;
}

export interface SignatureFormErrors {
  name?: string;
  email?: string;
  message?: string;
  region?: string;
  affiliation?: string;
  namePublic?: string;
  agreePrivacy?: string;
  agreeAge?: string;
}

export function validateSignatureForm(values: SignatureFormValues): SignatureFormErrors {
  const errors: SignatureFormErrors = {};

  const name = values.name.trim();
  if (!name) {
    errors.name = "이름 또는 닉네임을 입력해주세요.";
  } else if (name.length > NAME_MAX_LENGTH) {
    errors.name = "이름이 너무 깁니다.";
  }

  if (!values.regionTop || !isValidRegionPair(values.regionTop, values.regionSub)) {
    errors.region = "거주 지역을 선택해주세요.";
  }

  if (values.affiliation.trim().length > AFFILIATION_MAX_LENGTH) {
    errors.affiliation = `소속은 ${AFFILIATION_MAX_LENGTH}자 이내로 입력해주세요.`;
  }

  const email = values.email.trim();
  if (email && !EMAIL_PATTERN.test(email)) {
    errors.email = "올바른 이메일을 입력해주세요.";
  }

  if (values.message.length > MESSAGE_MAX_LENGTH) {
    errors.message = `제안은 ${MESSAGE_MAX_LENGTH}자 이내로 입력해주세요.`;
  }

  if (values.namePublic === null) {
    errors.namePublic = "이름 공개 여부를 선택해주세요.";
  }

  if (!values.agreePrivacy) {
    errors.agreePrivacy = "개인정보 수집·이용 동의가 필요합니다.";
  }

  if (!values.agreeAge) {
    errors.agreeAge = "만 14세 이상만 서명할 수 있습니다.";
  }

  return errors;
}

function toSignaturePayload(values: SignatureFormValues): SignaturePayload {
  return {
    name: values.name.trim(),
    email: values.email.trim(),
    message: values.message.trim(),
    regionTop: values.regionTop,
    regionSub: values.regionSub.trim(),
    affiliation: values.affiliation.trim(),
    namePublic: values.namePublic === true,
    agreePrivacy: values.agreePrivacy,
    agreeAge: values.agreeAge,
  };
}

export async function submitSignatureForm(
  values: SignatureFormValues,
): Promise<{ ok: true; mode: SignatureSubmitMode } | { ok: false; error: string }> {
  const errors = validateSignatureForm(values);
  if (Object.keys(errors).length > 0) {
    return { ok: false, error: "입력값을 다시 확인해주세요." };
  }

  return submitSignature(toSignaturePayload(values));
}
