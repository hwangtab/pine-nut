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
}: ShareButtonsProps) {
  const { copied, handleKakao, handleTwitter, handleFacebook, handleCopyUrl } =
    useShareButtons({ title, url });
  const editable: ShareEditableContext | null = page
    ? { page, section, contentPrefix }
    : null;

  return (
    <div className="relative">
      <ShareButtonLabel
        labelKey="label"
        editable={editable}
        as="p"
        className="text-sm font-semibold text-[var(--color-text-muted)] mb-3"
      />
      <div className="flex flex-wrap gap-2">
        <ShareButton
          onClick={handleKakao}
          className="bg-[#FEE500] text-[#3C1E1E] hover:bg-[#FDD835]"
          ariaLabel="카카오톡으로 공유"
          icon={<MessageCircle className="w-4 h-4" />}
        >
          <ShareButtonLabel labelKey="kakao" editable={editable} />
        </ShareButton>
        <ShareButton
          onClick={handleTwitter}
          className="bg-[var(--color-text)] text-white hover:bg-[var(--color-text)]/90"
          ariaLabel="트위터(X)로 공유"
          icon={<Twitter className="w-4 h-4" />}
        >
          <ShareButtonLabel labelKey="twitter" editable={editable} />
        </ShareButton>
        <ShareButton
          onClick={handleFacebook}
          className="bg-[#1877F2] text-white hover:bg-[#166FE5]"
          ariaLabel="페이스북으로 공유"
          icon={<Facebook className="w-4 h-4" />}
        >
          <ShareButtonLabel labelKey="facebook" editable={editable} />
        </ShareButton>
        <ShareButton
          onClick={handleCopyUrl}
          className="bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)]"
          ariaLabel="URL 복사"
          icon={<LinkIcon className="w-4 h-4" />}
        >
          <ShareButtonLabel labelKey="copy" editable={editable} />
        </ShareButton>
      </div>

      <ShareCopiedToast copied={copied} editable={editable} />
    </div>
  );
}
