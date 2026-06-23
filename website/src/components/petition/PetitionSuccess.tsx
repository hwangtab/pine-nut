"use client";

import { Check, Copy } from "lucide-react";
import { EditableText } from "@/components/editable";

export default function PetitionSuccess({
  submittedName,
  signatureCount,
  urlCopied,
  onShareKakao,
  onShareTwitter,
  onCopyUrl,
  onReset,
}: {
  submittedName: string;
  signatureCount: number;
  urlCopied: boolean;
  onShareKakao: () => void;
  onShareTwitter: () => void;
  onCopyUrl: () => void;
  onReset: () => void;
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
        <EditableText
          contentKey="petition.success.titlePrefix"
          defaultValue="감사합니다,"
          as="span"
          page="petition"
          section="success"
        />{" "}
        {submittedName}
        <EditableText
          contentKey="petition.success.titleSuffix"
          defaultValue="님!"
          as="span"
          page="petition"
          section="success"
        />
      </h2>
      <p className="text-lg text-[var(--color-text-muted)] mb-8">
        <span className="font-bold text-[var(--color-warm)]">
          {signatureCount.toLocaleString("ko-KR")}
        </span>
        <EditableText
          contentKey="petition.success.countSuffix"
          defaultValue="번째로 함께해주셨습니다."
          as="span"
          page="petition"
          section="success"
        />
      </p>

      <div className="space-y-3">
        <p className="text-[15px] font-semibold text-[var(--color-text)] mb-4">
          <EditableText
            contentKey="petition.success.sharePrompt"
            defaultValue="더 많은 사람에게 알려주세요"
            as="span"
            page="petition"
            section="success"
          />
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={onShareKakao}
            className="min-h-[48px] px-6 py-3 rounded-xl bg-[#FEE500] text-[#191919] font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
          >
            <EditableText
              contentKey="petition.success.shareKakao"
              defaultValue="카카오톡 공유"
              as="span"
              page="petition"
              section="success"
            />
          </button>
          <button
            type="button"
            onClick={onShareTwitter}
            className="min-h-[48px] px-6 py-3 rounded-xl bg-[#1DA1F2] text-white font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
          >
            <EditableText
              contentKey="petition.success.shareTwitter"
              defaultValue="트위터 공유"
              as="span"
              page="petition"
              section="success"
            />
          </button>
          <button
            type="button"
            onClick={onCopyUrl}
            className="min-h-[48px] px-6 py-3 rounded-xl bg-[var(--color-bg)] text-[var(--color-text)] font-semibold flex items-center justify-center gap-2 transition-colors hover:bg-[var(--color-border)]"
          >
            {urlCopied ? (
              <>
                <Check className="w-4 h-4" />
                <EditableText
                  contentKey="petition.success.copied"
                  defaultValue="복사됨!"
                  as="span"
                  page="petition"
                  section="success"
                />
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <EditableText
                  contentKey="petition.success.copy"
                  defaultValue="URL 복사"
                  as="span"
                  page="petition"
                  section="success"
                />
              </>
            )}
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="mt-8 text-[var(--color-text-muted)] underline text-sm hover:text-[var(--color-text)] transition-colors min-h-[44px]"
      >
        <EditableText
          contentKey="petition.success.reset"
          defaultValue="다른 사람도 서명하기"
          as="span"
          page="petition"
          section="success"
        />
      </button>
    </section>
  );
}
