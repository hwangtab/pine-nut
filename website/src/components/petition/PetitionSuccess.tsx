"use client";

import { Check, Copy } from "lucide-react";
import { EditableText } from "@/components/editable";
import {
  koreanPetitionSuccessCopy,
  type PetitionEditableTextCopy,
  type PetitionSuccessCopy,
} from "@/components/petition/petition-copy";

function SuccessText({
  copy,
  text,
  as = "span",
  className = "",
}: {
  copy: PetitionSuccessCopy;
  text: PetitionEditableTextCopy;
  as?: string;
  className?: string;
}) {
  return (
    <EditableText
      contentKey={text.contentKey}
      defaultValue={text.defaultValue}
      as={as}
      page={copy.page}
      section="success"
      className={className}
    />
  );
}

export default function PetitionSuccess({
  submittedName,
  signatureCount,
  urlCopied,
  onPrimaryShare,
  onShareTwitter,
  onCopyUrl,
  onReset,
  copy = koreanPetitionSuccessCopy,
}: {
  submittedName: string;
  signatureCount: number;
  urlCopied: boolean;
  onPrimaryShare: () => void;
  onShareTwitter: () => void;
  onCopyUrl: () => void;
  onReset?: () => void;
  copy?: PetitionSuccessCopy;
}) {
  return (
    <section
      className="bg-white border border-[var(--color-border)] rounded-2xl p-8 sm:p-10 text-center"
      aria-live="polite"
    >
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--color-forest)]/10 flex items-center justify-center">
        <Check className="w-8 h-8 text-[var(--color-forest)]" />
      </div>
      <h2 className="text-2xl sm:text-3xl font-black text-[var(--color-text)] mb-2">
        <SuccessText copy={copy} text={copy.titlePrefix} />{" "}
        {submittedName}
        <SuccessText copy={copy} text={copy.titleSuffix} />
      </h2>
      <p className="text-lg text-[var(--color-text-muted)] mb-8">
        {copy.countPrefix && (
          <>
            <SuccessText copy={copy} text={copy.countPrefix} />{" "}
          </>
        )}
        <span className="font-bold text-[var(--color-warm)]">
          {signatureCount.toLocaleString(copy.countLocale)}
        </span>
        <SuccessText copy={copy} text={copy.countSuffix} />
      </p>

      <div className="space-y-3">
        {copy.sharePrompt && (
          <p className="text-[15px] font-semibold text-[var(--color-text)] mb-4">
            <SuccessText copy={copy} text={copy.sharePrompt} />
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={onPrimaryShare}
            className={copy.primaryShareClassName}
          >
            <SuccessText copy={copy} text={copy.primaryShare} />
          </button>
          <button
            type="button"
            onClick={onShareTwitter}
            className="min-h-[48px] px-6 py-3 rounded-xl bg-[#1DA1F2] text-white font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
          >
            <SuccessText copy={copy} text={copy.twitterShare} />
          </button>
          <button
            type="button"
            onClick={onCopyUrl}
            className="min-h-[48px] px-6 py-3 rounded-xl bg-[var(--color-bg)] text-[var(--color-text)] font-semibold flex items-center justify-center gap-2 transition-colors hover:bg-[var(--color-border)]"
          >
            {urlCopied ? (
              <>
                <Check className="w-4 h-4" />
                <SuccessText copy={copy} text={copy.copiedLabel} />
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <SuccessText copy={copy} text={copy.copyLabel} />
              </>
            )}
          </button>
        </div>
      </div>

      {copy.resetLabel && onReset && (
        <button
          type="button"
          onClick={onReset}
          className="mt-8 text-[var(--color-text-muted)] underline text-sm hover:text-[var(--color-text)] transition-colors min-h-[44px]"
        >
          <SuccessText copy={copy} text={copy.resetLabel} />
        </button>
      )}
    </section>
  );
}
