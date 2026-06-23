export interface PublicSignature {
  name: string;
  message: string;
  created_at: string;
}

export interface SignatureSummary {
  count: number;
  signatures: PublicSignature[];
  demo?: boolean;
}

export interface SubmitSignatureInput {
  name: string;
  email: string;
  message?: string;
  agreePrivacy: boolean;
  agreeAge: boolean;
}

export interface SubmitSignatureResult {
  success: boolean;
  count: number;
  demo?: boolean;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value);
}

async function readApiError(response: Response, fallback: string): Promise<Error> {
  const data = await response.json().catch(() => null);
  const message =
    data && typeof data === "object" && "error" in data && typeof data.error === "string"
      ? data.error
      : fallback;

  return new Error(message);
}

export async function fetchSignatureSummary(): Promise<SignatureSummary> {
  const response = await fetch("/api/signatures");
  if (!response.ok) {
    throw await readApiError(response, "서명 현황을 불러오지 못했습니다.");
  }

  const data = await response.json();

  return {
    count: typeof data.count === "number" ? data.count : 0,
    signatures: Array.isArray(data.signatures) ? data.signatures : [],
    demo: data.demo === true,
  };
}

export async function submitSignature(
  input: SubmitSignatureInput,
): Promise<SubmitSignatureResult> {
  const response = await fetch("/api/signatures", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw await readApiError(response, "서명 제출에 실패했습니다.");
  }

  const data = await response.json();

  return {
    success: data.success === true,
    count: typeof data.count === "number" ? data.count : 0,
    demo: data.demo === true,
  };
}
