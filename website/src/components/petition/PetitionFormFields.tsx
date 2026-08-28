"use client";

import PetitionFormText from "@/components/petition/PetitionFormText";
import type { PetitionSignatureFormCopy } from "@/components/petition/petition-copy";
import type { SignatureFormErrors } from "@/lib/signatures/form";

interface PetitionFormFieldsProps {
  copy: PetitionSignatureFormCopy;
  name: string;
  email: string;
  message: string;
  errors: SignatureFormErrors;
  nameId: string;
  emailId: string;
  messageId: string;
  messageCountId: string;
  formNamePlaceholder: string;
  formEmailPlaceholder: string;
  formMessagePlaceholder: string;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onMessageChange: (value: string) => void;
  clearError: (key: keyof SignatureFormErrors) => void;
}

export default function PetitionFormFields({
  copy,
  name,
  email,
  message,
  errors,
  nameId,
  emailId,
  messageId,
  messageCountId,
  formNamePlaceholder,
  formEmailPlaceholder,
  formMessagePlaceholder,
  onNameChange,
  onEmailChange,
  onMessageChange,
  clearError,
}: PetitionFormFieldsProps) {
  return (
    <>
      <div>
        <label
          htmlFor={nameId}
          className="block text-[15px] font-semibold mb-2 text-[var(--color-text)]"
        >
          <PetitionFormText copy={copy} text={copy.labels.name} />{" "}
          <span className="text-[var(--color-warm)]">*</span>
        </label>
        <input
          id={nameId}
          type="text"
          required
          value={name}
          onChange={(event) => {
            onNameChange(event.target.value);
            if (errors.name) clearError("name");
          }}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? `${nameId}-error` : undefined}
          placeholder={formNamePlaceholder}
          className="paper-field min-h-[48px] focus:outline-none focus:ring-2 focus:ring-[var(--color-warm)]/30 transition"
        />
        {errors.name && (
          <p id={`${nameId}-error`} className="mt-1 text-sm text-red-600" role="alert">
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor={emailId}
          className="block text-[15px] font-semibold mb-2 text-[var(--color-text)]"
        >
          <PetitionFormText copy={copy} text={copy.labels.email} />{" "}
          <span className="text-[var(--color-warm)]">*</span>
        </label>
        <input
          id={emailId}
          type="email"
          required
          value={email}
          onChange={(event) => {
            onEmailChange(event.target.value);
            if (errors.email) clearError("email");
          }}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? `${emailId}-error` : undefined}
          placeholder={formEmailPlaceholder}
          className="paper-field min-h-[48px] focus:outline-none focus:ring-2 focus:ring-[var(--color-warm)]/30 transition"
        />
        {errors.email && (
          <p id={`${emailId}-error`} className="mt-1 text-sm text-red-600" role="alert">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor={messageId}
          className="block text-[15px] font-semibold mb-2 text-[var(--color-text)]"
        >
          <PetitionFormText copy={copy} text={copy.labels.message} />{" "}
          <PetitionFormText
            copy={copy}
            text={copy.labels.messageOptional}
            className="font-normal text-[var(--color-text-muted)]"
          />
        </label>
        <textarea
          id={messageId}
          value={message}
          onChange={(event) => {
            if (event.target.value.length <= 100) onMessageChange(event.target.value);
          }}
          maxLength={100}
          rows={3}
          placeholder={formMessagePlaceholder}
          aria-describedby={messageCountId}
          className="paper-field focus:outline-none focus:ring-2 focus:ring-[var(--color-warm)]/30 resize-none transition"
        />
        <p
          id={messageCountId}
          className="mt-1 text-right text-sm text-[var(--color-text-muted)]"
        >
          {message.length}/100
        </p>
      </div>
    </>
  );
}
