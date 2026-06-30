import {
  submitSignature,
  isValidEmail,
  type SubmitSignatureInput,
} from "@/lib/signatures/client";

export type SignatureFormErrorKey = "name" | "email" | "agreePrivacy" | "agreeAge";
export type SignatureFormErrors = Partial<Record<SignatureFormErrorKey, string>>;

export interface SignatureFormValues {
  name: string;
  email: string;
  message?: string;
  agreePrivacy?: boolean;
  agreeAge?: boolean;
}

export interface SignatureValidationMessages {
  name: string;
  emailRequired: string;
  emailInvalid: string;
  privacy: string;
  age: string;
}

export interface SignatureValidationOptions {
  requirePrivacy?: boolean;
  requireAge?: boolean;
}

export function validateSignatureForm(
  values: SignatureFormValues,
  messages: SignatureValidationMessages,
  options: SignatureValidationOptions = {},
): { valid: boolean; errors: SignatureFormErrors } {
  const requirePrivacy = options.requirePrivacy ?? true;
  const requireAge = options.requireAge ?? true;
  const errors: SignatureFormErrors = {};
  const email = values.email.trim();

  if (!values.name.trim()) {
    errors.name = messages.name;
  }
  if (!email) {
    errors.email = messages.emailRequired;
  } else if (!isValidEmail(email)) {
    errors.email = messages.emailInvalid;
  }
  if (requirePrivacy && !values.agreePrivacy) {
    errors.agreePrivacy = messages.privacy;
  }
  if (requireAge && !values.agreeAge) {
    errors.agreeAge = messages.age;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

function toSubmitSignatureInput(values: SignatureFormValues): SubmitSignatureInput {
  return {
    name: values.name.trim(),
    email: values.email.trim(),
    message: (values.message ?? "").trim(),
    agreePrivacy: values.agreePrivacy === true,
    agreeAge: values.agreeAge === true,
  };
}

export async function submitSignatureForm(
  values: SignatureFormValues,
): Promise<{ name: string; count: number }> {
  const input = toSubmitSignatureInput(values);
  const result = await submitSignature(input);

  return {
    name: input.name,
    count: result.count,
  };
}
