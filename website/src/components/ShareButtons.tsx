"use client";

import { Facebook, Link as LinkIcon, MessageCircle, Twitter } from "lucide-react";
import { ShareButton } from "@/components/share-buttons/ShareButton";
import { ShareButtonLabel } from "@/components/share-buttons/ShareButtonLabel";
import { ShareCopiedToast } from "@/components/share-buttons/ShareCopiedToast";
import type { ShareButtonsProps, ShareEditableContext } from "@/components/share-buttons/types";
import { useShareButtons } from "@/components/share-buttons/useShareButtons";

export default function ShareButtons({
  title,
  url,
  page,
  section = "share",
  contentPrefix = "share",
  locale = "ko",
}: ShareButtonsProps) {
  const { copied, handleKakao, handleTwitter, handleFacebook, handleCopyUrl } =
    useShareButtons({ title, url });
  const editable: ShareEditableContext | null = page
    ? { page, section, contentPrefix }
    : null;
  // aria-label도 화면 문구와 같은 언어여야 스크린리더 사용자가 이해할 수 있다.
  const aria =
    locale === "en"
      ? { kakao: "Share", twitter: "Share on Twitter (X)", facebook: "Share on Facebook", copy: "Copy link" }
      : { kakao: "카카오톡으로 공유", twitter: "트위터(X)로 공유", facebook: "페이스북으로 공유", copy: "URL 복사" };

  return (
    <div className="relative">
      <ShareButtonLabel
        labelKey="label"
        editable={editable}
        locale={locale}
        as="p"
        className="text-sm font-semibold text-[var(--color-text-muted)] mb-3"
      />
      <div className="flex flex-wrap gap-2">
        <ShareButton
          onClick={handleKakao}
          className="rounded-full bg-[#FEE500] text-[#3C1E1E] hover:bg-[#FDD835]"
          ariaLabel={aria.kakao}
          icon={<MessageCircle className="w-4 h-4" />}
        >
          <ShareButtonLabel labelKey="kakao" editable={editable} locale={locale} />
        </ShareButton>
        <ShareButton
          onClick={handleTwitter}
          className="rounded-full bg-[var(--color-text)] text-white hover:bg-[var(--color-text)]/90"
          ariaLabel={aria.twitter}
          icon={<Twitter className="w-4 h-4" />}
        >
          <ShareButtonLabel labelKey="twitter" editable={editable} locale={locale} />
        </ShareButton>
        <ShareButton
          onClick={handleFacebook}
          className="rounded-full bg-[#1877F2] text-white hover:bg-[#166FE5]"
          ariaLabel={aria.facebook}
          icon={<Facebook className="w-4 h-4" />}
        >
          <ShareButtonLabel labelKey="facebook" editable={editable} locale={locale} />
        </ShareButton>
        <ShareButton
          onClick={handleCopyUrl}
          className="rounded-full bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)]"
          ariaLabel={aria.copy}
          icon={<LinkIcon className="w-4 h-4" />}
        >
          <ShareButtonLabel labelKey="copy" editable={editable} locale={locale} />
        </ShareButton>
      </div>

      <ShareCopiedToast copied={copied} editable={editable} locale={locale} />
    </div>
  );
}
