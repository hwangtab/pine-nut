"use client";

import PetitionFormText from "@/components/petition/PetitionFormText";
import RegionSelect from "@/components/petition/RegionSelect";
import type { PetitionSignatureFormCopy } from "@/components/petition/petition-copy";
import type {
  PetitionSignatureFieldIds,
  PetitionSignaturePlaceholders,
  SignatureFormErrorKey,
} from "@/components/petition/signature-form/types";
import { OVERSEAS_REGION, subsFor } from "@/lib/regions";
import {
  AFFILIATION_MAX_LENGTH,
  MESSAGE_MAX_LENGTH,
  NAME_MAX_LENGTH,
} from "@/lib/signatures/api/config";
import type { SignatureFormErrors } from "@/lib/signatures/form";

const LABEL_CLASS = "block text-[15px] font-semibold mb-2 text-[var(--color-text)]";
const FIELD_CLASS =
  "paper-field min-h-[48px] focus:outline-none focus:ring-2 focus:ring-[var(--color-warm)]/30 transition";
const NOTE_CLASS = "mb-2 text-sm text-[var(--color-text-muted)] leading-relaxed";
const ERROR_CLASS = "mt-1 text-sm text-red-600";

interface PetitionFormFieldsProps {
  copy: PetitionSignatureFormCopy;
  name: string;
  email: string;
  message: string;
  regionTop: string;
  regionSub: string;
  affiliation: string;
  namePublic: boolean | null;
  errors: SignatureFormErrors;
  ids: PetitionSignatureFieldIds;
  placeholders: PetitionSignaturePlaceholders;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onMessageChange: (value: string) => void;
  onRegionTopChange: (value: string) => void;
  onRegionSubChange: (value: string) => void;
  onAffiliationChange: (value: string) => void;
  onNamePublicChange: (value: boolean) => void;
  clearError: (key: SignatureFormErrorKey) => void;
}

export default function PetitionFormFields({
  copy,
  name,
  email,
  message,
  regionTop,
  regionSub,
  affiliation,
  namePublic,
  errors,
  ids,
  placeholders,
  onNameChange,
  onEmailChange,
  onMessageChange,
  onRegionTopChange,
  onRegionSubChange,
  onAffiliationChange,
  onNamePublicChange,
  clearError,
}: PetitionFormFieldsProps) {
  // 세종특별자치시처럼 하위 행정구역이 없는 시·도를 고르면 RegionSelect가
  // 시·군·구 셀렉트를 잠근다(빈 sub가 유효한 조합이라서). 안내가 없으면
  // "고장난 화면"으로 읽히므로, 잠긴 이유를 그 자리에서 알려준다.
  const regionHasNoSubs =
    regionTop !== "" && regionTop !== OVERSEAS_REGION && subsFor(regionTop).length === 0;

  const emailDescribedBy = [ids.emailNoteId, errors.email ? `${ids.emailId}-error` : ""]
    .filter(Boolean)
    .join(" ");
  const namePublicDescribedBy = [
    ids.namePublicNoteId,
    errors.namePublic ? ids.namePublicErrorId : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <div>
        <label htmlFor={ids.nameId} className={LABEL_CLASS}>
          <PetitionFormText copy={copy} text={copy.labels.name} />{" "}
          <span className="text-[var(--color-warm)]">*</span>
        </label>
        <input
          id={ids.nameId}
          type="text"
          required
          maxLength={NAME_MAX_LENGTH}
          value={name}
          onChange={(event) => {
            onNameChange(event.target.value);
            if (errors.name) clearError("name");
          }}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? `${ids.nameId}-error` : undefined}
          placeholder={placeholders.formNamePlaceholder}
          className={FIELD_CLASS}
        />
        {errors.name && (
          <p id={`${ids.nameId}-error`} className={ERROR_CLASS} role="alert">
            {errors.name}
          </p>
        )}
      </div>

      <fieldset>
        <legend className={LABEL_CLASS}>
          <PetitionFormText copy={copy} text={copy.labels.regionLabel} />{" "}
          <span className="text-[var(--color-warm)]">*</span>
        </legend>
        <RegionSelect
          top={regionTop}
          sub={regionSub}
          onTopChange={(value) => {
            onRegionTopChange(value);
            // RegionSelect도 top 변경 시 onSubChange("")를 부르지만, 시·도가 바뀌면
            // 이전 시·군·구는 어떤 경우에도 유효하지 않다 — 그 초기화를 하위
            // 컴포넌트의 내부 동작에 기대지 않고 여기서 확정한다.
            onRegionSubChange("");
            if (errors.region) clearError("region");
          }}
          onSubChange={(value) => {
            onRegionSubChange(value);
            if (errors.region) clearError("region");
          }}
          error={errors.region}
          idPrefix={copy.fieldIdPrefix}
          labels={{
            top: placeholders.regionTopPlaceholder,
            sub: placeholders.regionSubPlaceholder,
            overseasPlaceholder: placeholders.overseasSubPlaceholder,
          }}
        />
        {regionHasNoSubs && (
          <PetitionFormText
            copy={copy}
            text={copy.labels.regionNoSubNote}
            as="p"
            className="mt-2 text-sm text-[var(--color-text-muted)] leading-relaxed"
          />
        )}
      </fieldset>

      <div>
        <label htmlFor={ids.affiliationId} className={LABEL_CLASS}>
          <PetitionFormText copy={copy} text={copy.labels.affiliationLabel} />
        </label>
        <input
          id={ids.affiliationId}
          type="text"
          maxLength={AFFILIATION_MAX_LENGTH}
          value={affiliation}
          onChange={(event) => {
            onAffiliationChange(event.target.value);
            if (errors.affiliation) clearError("affiliation");
          }}
          aria-invalid={!!errors.affiliation}
          aria-describedby={errors.affiliation ? `${ids.affiliationId}-error` : undefined}
          placeholder={placeholders.formAffiliationPlaceholder}
          className={FIELD_CLASS}
        />
        {errors.affiliation && (
          <p id={`${ids.affiliationId}-error`} className={ERROR_CLASS} role="alert">
            {errors.affiliation}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={ids.emailId} className={LABEL_CLASS}>
          <PetitionFormText copy={copy} text={copy.labels.email} />{" "}
          <PetitionFormText
            copy={copy}
            text={copy.labels.emailOptional}
            className="font-normal text-[var(--color-text-muted)]"
          />
        </label>
        <p id={ids.emailNoteId} className={NOTE_CLASS}>
          <PetitionFormText copy={copy} text={copy.labels.emailNote} />
        </p>
        <input
          id={ids.emailId}
          type="email"
          value={email}
          onChange={(event) => {
            onEmailChange(event.target.value);
            if (errors.email) clearError("email");
          }}
          aria-invalid={!!errors.email}
          aria-describedby={emailDescribedBy}
          placeholder={placeholders.formEmailPlaceholder}
          className={FIELD_CLASS}
        />
        {errors.email && (
          <p id={`${ids.emailId}-error`} className={ERROR_CLASS} role="alert">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={ids.messageId} className={LABEL_CLASS}>
          <PetitionFormText copy={copy} text={copy.labels.message} />{" "}
          <PetitionFormText
            copy={copy}
            text={copy.labels.messageOptional}
            className="font-normal text-[var(--color-text-muted)]"
          />
        </label>
        <textarea
          id={ids.messageId}
          value={message}
          onChange={(event) => {
            if (event.target.value.length <= MESSAGE_MAX_LENGTH) {
              onMessageChange(event.target.value);
            }
            if (errors.message) clearError("message");
          }}
          maxLength={MESSAGE_MAX_LENGTH}
          rows={4}
          placeholder={placeholders.formMessagePlaceholder}
          aria-invalid={!!errors.message}
          aria-describedby={ids.messageCountId}
          className="paper-field focus:outline-none focus:ring-2 focus:ring-[var(--color-warm)]/30 resize-none transition"
        />
        <p id={ids.messageCountId} className="mt-1 text-right text-sm text-[var(--color-text-muted)]">
          {message.length}/{MESSAGE_MAX_LENGTH}
        </p>
        {errors.message && (
          <p id={`${ids.messageId}-error`} className={ERROR_CLASS} role="alert">
            {errors.message}
          </p>
        )}
      </div>

      <fieldset>
        <legend className={LABEL_CLASS}>
          <PetitionFormText copy={copy} text={copy.labels.namePublicLabel} />{" "}
          <span className="text-[var(--color-warm)]">*</span>
        </legend>
        <p id={ids.namePublicNoteId} className={NOTE_CLASS}>
          <PetitionFormText copy={copy} text={copy.labels.namePublicNote} />
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          <label
            htmlFor={ids.namePublicYesId}
            className="flex items-center gap-2 cursor-pointer min-h-[48px] text-[15px] text-[var(--color-text)]"
          >
            <input
              id={ids.namePublicYesId}
              type="radio"
              name={`${copy.fieldIdPrefix}-name-public`}
              checked={namePublic === true}
              onChange={() => {
                onNamePublicChange(true);
                if (errors.namePublic) clearError("namePublic");
              }}
              aria-describedby={namePublicDescribedBy}
              className="w-5 h-5 shrink-0 accent-[var(--color-warm)] cursor-pointer"
            />
            <PetitionFormText copy={copy} text={copy.labels.namePublicYes} />
          </label>
          <label
            htmlFor={ids.namePublicNoId}
            className="flex items-center gap-2 cursor-pointer min-h-[48px] text-[15px] text-[var(--color-text)]"
          >
            <input
              id={ids.namePublicNoId}
              type="radio"
              name={`${copy.fieldIdPrefix}-name-public`}
              checked={namePublic === false}
              onChange={() => {
                onNamePublicChange(false);
                if (errors.namePublic) clearError("namePublic");
              }}
              aria-describedby={namePublicDescribedBy}
              className="w-5 h-5 shrink-0 accent-[var(--color-warm)] cursor-pointer"
            />
            <PetitionFormText copy={copy} text={copy.labels.namePublicNo} />
          </label>
        </div>
        {errors.namePublic && (
          <p id={ids.namePublicErrorId} className={ERROR_CLASS} role="alert">
            {errors.namePublic}
          </p>
        )}
      </fieldset>
    </>
  );
}
