import type { ShareCopiedKind, ShareEditableContext, ShareLocale } from "./types";
import { ShareButtonLabel } from "./ShareButtonLabel";

export function ShareCopiedToast({
  copied,
  editable,
  locale = "ko",
}: {
  copied: ShareCopiedKind | null;
  editable: ShareEditableContext | null;
  locale?: ShareLocale;
}) {
  // 라이브 영역은 항상 DOM에 둔다 — 내용과 함께 새로 붙는 role="status"는
  // 스크린리더가 변화로 인식하지 못해 낭독을 놓치는 경우가 있다.
  return (
    <div role="status" aria-live="polite">
      {copied && (
        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 w-max max-w-[min(90vw,24rem)] text-center bg-[var(--color-text)] text-white text-sm px-4 py-2 rounded-full shadow-lg animate-fade-in">
          <ShareButtonLabel
            labelKey={copied === "kakao" ? "copiedForKakao" : "copied"}
            editable={editable}
            locale={locale}
          />
        </div>
      )}
    </div>
  );
}
