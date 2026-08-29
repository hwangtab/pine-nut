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
  /**
   * 확정된 서명 수. 요약 조회가 실패해 카운트를 모를 때는 `null`을 넘긴다 —
   * 그 경우 서수 문장("N번째로 함께해주셨습니다")을 통째로 감춘다. 0을 넘겨
   * "0번째로 함께해주셨습니다"를 렌더하는 일은 절대 없어야 한다.
   * (home/HomeCtaSection의 `signatureCount: number | null`과 같은 관례.)
   */
  signatureCount: number | null;
  urlCopied: boolean;
  onPrimaryShare: () => void;
  onShareTwitter: () => void;
  onCopyUrl: () => void;
  onReset?: () => void;
  copy?: PetitionSuccessCopy;
}) {
  return (
    <section
      className="paper p-8 sm:p-10 text-center"
      aria-live="polite"
    >
      <div className="relative z-[1]">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--color-forest)]/10 flex items-center justify-center">
          <Check className="w-8 h-8 text-[var(--color-forest)]" />
        </div>
        <h2 className="font-serif-display font-bold text-2xl sm:text-3xl text-[var(--color-text)] mb-2">
          <SuccessText copy={copy} text={copy.titlePrefix} />{" "}
          {submittedName}
          <SuccessText copy={copy} text={copy.titleSuffix} />
        </h2>
        {signatureCount !== null && (
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
        )}

        {/* 카운트 문단이 숨겨지면 그 mb-8 여백도 함께 사라지므로 여기서 보충한다. */}
        <div className={signatureCount !== null ? "space-y-3" : "space-y-3 mt-8"}>
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
              className="min-h-[48px] px-6 py-3 rounded-full bg-[#1DA1F2] text-white font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
            >
              <SuccessText copy={copy} text={copy.twitterShare} />
            </button>
            <button
              type="button"
              onClick={onCopyUrl}
              className="letter-btn letter-btn--outline-light min-h-[48px] font-semibold"
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
      </div>
    </section>
  );
}
