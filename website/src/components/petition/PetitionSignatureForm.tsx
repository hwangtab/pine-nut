"use client";

import { Loader2, Send } from "lucide-react";
import PetitionConsentFields from "@/components/petition/PetitionConsentFields";
import PetitionFormEditControls from "@/components/petition/PetitionFormEditControls";
import PetitionFormFields from "@/components/petition/PetitionFormFields";
import PetitionFormText from "@/components/petition/PetitionFormText";
import {
  koreanPetitionFormCopy,
} from "@/components/petition/petition-copy";
import type { PetitionSignatureFormProps } from "@/components/petition/signature-form/types";
import { usePetitionSignatureForm } from "@/components/petition/signature-form/usePetitionSignatureForm";

export default function PetitionSignatureForm({
  formRef,
  onSubmitted,
  onRefreshSignatures,
  copy = koreanPetitionFormCopy,
}: PetitionSignatureFormProps) {
  const form = usePetitionSignatureForm({ copy, onSubmitted, onRefreshSignatures });

  return (
    <>
      <form
        ref={formRef}
        onSubmit={form.handleSubmit}
        onFocusCapture={form.handleFocusCapture}
        noValidate
        className="bg-white border border-[var(--color-border)] rounded-[var(--radius-panel)] shadow-card p-6 sm:p-8 space-y-6"
      >
        <PetitionFormFields
          copy={copy}
          name={form.name}
          email={form.email}
          message={form.message}
          errors={form.errors}
          nameId={form.ids.nameId}
          emailId={form.ids.emailId}
          messageId={form.ids.messageId}
          messageCountId={form.ids.messageCountId}
          formNamePlaceholder={form.placeholders.formNamePlaceholder}
          formEmailPlaceholder={form.placeholders.formEmailPlaceholder}
          formMessagePlaceholder={form.placeholders.formMessagePlaceholder}
          onNameChange={form.setName}
          onEmailChange={form.setEmail}
          onMessageChange={form.setMessage}
          clearError={form.clearError}
        />

        <PetitionConsentFields
          copy={copy}
          agreePrivacy={form.agreePrivacy}
          agreeAge={form.agreeAge}
          errors={form.errors}
          privacyErrorId={form.ids.privacyErrorId}
          ageErrorId={form.ids.ageErrorId}
          showPrivacy={form.showPrivacy}
          onPrivacyChange={form.setAgreePrivacy}
          onAgeChange={form.setAgreeAge}
          onTogglePrivacy={form.togglePrivacy}
          clearError={form.clearError}
        />

        {form.submitError && (
          <p className="text-sm text-red-600 text-center" role="alert">
            {form.submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={form.submitting}
          className="w-full min-h-[52px] rounded-full bg-[var(--color-warm)] hover:bg-[var(--color-warm-light)] text-white font-bold text-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {form.submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <PetitionFormText copy={copy} text={copy.labels.submitting} />
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <PetitionFormText copy={copy} text={copy.labels.submit} />
            </>
          )}
        </button>
      </form>

      {form.isEditMode && (
        <PetitionFormEditControls copy={copy} fields={form.editFields} />
      )}
    </>
  );
}
