import { isValidRegionPair } from "@/lib/regions";
import {
  AFFILIATION_MAX_LENGTH,
  EMAIL_PATTERN,
  INVALID_NAME_PUBLIC_MESSAGE,
  INVALID_REGION_MESSAGE,
  MESSAGE_MAX_LENGTH,
  NAME_MAX_LENGTH,
} from "./config";

export interface SignatureSubmissionBody {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  regionTop?: unknown;
  regionSub?: unknown;
  affiliation?: unknown;
  namePublic?: unknown;
  agreePrivacy?: unknown;
  agreeAge?: unknown;
}

export interface ValidSignatureSubmission {
  name: string;
  email: string | null;
  normalizedEmail: string | null;
  messageText: string;
  regionTop: string;
  regionSub: string;
  affiliation: string | null;
  namePublic: boolean;
  agreePrivacy: true;
  agreeAge: true;
}

interface SignatureSubmissionValidationError {
  ok: false;
  error: string;
  status: 400;
}

interface SignatureSubmissionValidationSuccess {
  ok: true;
  value: ValidSignatureSubmission;
}

type SignatureSubmissionValidationResult =
  | SignatureSubmissionValidationError
  | SignatureSubmissionValidationSuccess;

function validationError(error: string): SignatureSubmissionValidationError {
  return { ok: false, error, status: 400 };
}

function asOptionalString(value: unknown): string | undefined {
  return value === undefined || value === null || typeof value === "string"
    ? value ?? ""
    : undefined;
}

export function validateSignatureSubmission(
  body: SignatureSubmissionBody,
): SignatureSubmissionValidationResult {
  const name = asOptionalString(body.name);
  if (!name?.trim()) {
    return validationError("이름을 입력해주세요.");
  }
  if (name.trim().length > NAME_MAX_LENGTH) {
    return validationError("이름이 너무 깁니다.");
  }

  const regionTop = asOptionalString(body.regionTop)?.trim() ?? "";
  const regionSub = asOptionalString(body.regionSub)?.trim() ?? "";
  if (!regionTop || !isValidRegionPair(regionTop, regionSub)) {
    return validationError(INVALID_REGION_MESSAGE);
  }

  const affiliationText = asOptionalString(body.affiliation)?.trim() ?? "";
  if (affiliationText.length > AFFILIATION_MAX_LENGTH) {
    return validationError(`소속은 ${AFFILIATION_MAX_LENGTH}자 이내로 입력해주세요.`);
  }

  const emailText = asOptionalString(body.email)?.trim() ?? "";
  if (emailText && !EMAIL_PATTERN.test(emailText)) {
    return validationError("올바른 이메일을 입력해주세요.");
  }

  const message = asOptionalString(body.message);
  if (message === undefined || message.length > MESSAGE_MAX_LENGTH) {
    return validationError(`메시지는 ${MESSAGE_MAX_LENGTH}자 이내로 입력해주세요.`);
  }

  if (typeof body.namePublic !== "boolean") {
    return validationError(INVALID_NAME_PUBLIC_MESSAGE);
  }

  if (body.agreePrivacy !== true) {
    return validationError("개인정보 수집·이용 동의가 필요합니다.");
  }
  if (body.agreeAge !== true) {
    return validationError("만 14세 이상 확인이 필요합니다.");
  }

  return {
    ok: true,
    value: {
      name: name.trim(),
      email: emailText ? emailText : null,
      normalizedEmail: emailText ? emailText.toLowerCase() : null,
      messageText: message.trim(),
      regionTop,
      regionSub,
      affiliation: affiliationText ? affiliationText : null,
      namePublic: body.namePublic,
      agreePrivacy: true,
      agreeAge: true,
    },
  };
}
