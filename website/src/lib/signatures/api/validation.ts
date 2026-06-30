import { MESSAGE_MAX_LENGTH } from "./config";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface SignatureSubmissionBody {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  agreePrivacy?: unknown;
  agreeAge?: unknown;
}

export interface ValidSignatureSubmission {
  name: string;
  email: string;
  normalizedEmail: string;
  messageText: string;
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
  if (name.trim().length > 50) {
    return validationError("이름이 너무 깁니다.");
  }

  const email = asOptionalString(body.email);
  const emailText = email?.trim() ?? "";
  if (!emailText || !EMAIL_PATTERN.test(emailText)) {
    return validationError("올바른 이메일을 입력해주세요.");
  }

  const message = asOptionalString(body.message);
  if (message === undefined || message.length > MESSAGE_MAX_LENGTH) {
    return validationError(`메시지는 ${MESSAGE_MAX_LENGTH}자 이내로 입력해주세요.`);
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
      email: emailText,
      normalizedEmail: emailText.toLowerCase(),
      messageText: message.trim(),
      agreePrivacy: true,
      agreeAge: true,
    },
  };
}
