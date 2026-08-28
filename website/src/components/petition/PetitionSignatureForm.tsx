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
        className="paper p-8 md:p-12"
      >
        <div className="relative z-[1] space-y-6">
          <PetitionFormFields
            copy={copy}
            name={form.name}
            email={form.email}
            message={form.message}
            regionTop={form.regionTop}
            regionSub={form.regionSub}
            affiliation={form.affiliation}
            namePublic={form.namePublic}
            errors={form.errors}
            ids={form.ids}
            placeholders={form.placeholders}
            onNameChange={form.setName}
            onEmailChange={form.setEmail}
            onMessageChange={form.setMessage}
            onRegionTopChange={form.setRegionTop}
            onRegionSubChange={form.setRegionSub}
            onAffiliationChange={form.setAffiliation}
            onNamePublicChange={form.setNamePublic}
            clearError={form.clearError}
          />

          <PetitionConsentFields
            copy={copy}
            agreePrivacy={form.agreePrivacy}
            agreeAge={form.agreeAge}
            errors={form.errors}
            consentErrorId={form.ids.consentErrorId}
            showPrivacy={form.showPrivacy}
            onConsentChange={form.setAgreeConsent}
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
            className="letter-btn letter-btn--primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
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
        </div>
      </form>

      {form.isEditMode && (
        <PetitionFormEditControls copy={copy} fields={form.editFields} />
      )}
    </>
  );
}
