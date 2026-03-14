"use client";

import { useState } from "react";
import { MessageCircle, Twitter, Facebook, Link } from "lucide-react";
import { EditableText } from "@/components/editable";

interface ShareButtonsProps {
  title: string;
  url?: string;
  page?: string;
  section?: string;
  contentPrefix?: string;
}

export default function ShareButtons({
  title,
  url,
  page,
  section = "share",
  contentPrefix = "share",
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const getUrl = () => {
    if (url) return url;
    if (typeof window !== "undefined") return window.location.href;
    return "";
  };

  const handleKakao = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          url: getUrl(),
        });
      } catch {
        /* 사용자가 공유를 취소한 경우 */
      }
    } else {
      // Web Share API를 지원하지 않는 경우 URL 복사로 대체
      handleCopyUrl();
    }
  };

  const handleTwitter = () => {
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(getUrl())}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  const handleFacebook = () => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getUrl())}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(getUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = getUrl();
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const buttonBase =
    "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 min-h-[44px]";

  const editable = page
    ? {
        page,
        section,
        prefix: contentPrefix,
      }
    : null;

  return (
    <div className="relative">
      {editable ? (
        <EditableText
          contentKey={`${editable.prefix}.label`}
          defaultValue="공유하기"
          as="p"
          page={editable.page}
          section={editable.section}
          className="text-sm font-semibold text-[var(--color-text-muted)] mb-3"
        />
      ) : (
        <p className="text-sm font-semibold text-[var(--color-text-muted)] mb-3">공유하기</p>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleKakao}
          className={`${buttonBase} bg-[#FEE500] text-[#3C1E1E] hover:bg-[#FDD835]`}
          aria-label="카카오톡으로 공유"
        >
          <MessageCircle className="w-4 h-4" />
          {editable ? (
            <EditableText
              contentKey={`${editable.prefix}.kakao`}
              defaultValue="카카오톡"
              as="span"
              page={editable.page}
              section={editable.section}
            />
          ) : (
            "카카오톡"
          )}
        </button>
        <button
          onClick={handleTwitter}
          className={`${buttonBase} bg-[var(--color-text)] text-white hover:bg-[var(--color-text)]/90`}
          aria-label="트위터(X)로 공유"
        >
          <Twitter className="w-4 h-4" />
          {editable ? (
            <EditableText
              contentKey={`${editable.prefix}.twitter`}
              defaultValue="트위터(X)"
              as="span"
              page={editable.page}
              section={editable.section}
            />
          ) : (
            "트위터(X)"
          )}
        </button>
        <button
          onClick={handleFacebook}
          className={`${buttonBase} bg-[#1877F2] text-white hover:bg-[#166FE5]`}
          aria-label="페이스북으로 공유"
        >
          <Facebook className="w-4 h-4" />
          {editable ? (
            <EditableText
              contentKey={`${editable.prefix}.facebook`}
              defaultValue="페이스북"
              as="span"
              page={editable.page}
              section={editable.section}
            />
          ) : (
            "페이스북"
          )}
        </button>
        <button
          onClick={handleCopyUrl}
          className={`${buttonBase} bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)]`}
          aria-label="URL 복사"
        >
          <Link className="w-4 h-4" />
          {editable ? (
            <EditableText
              contentKey={`${editable.prefix}.copy`}
              defaultValue="URL 복사"
              as="span"
              page={editable.page}
              section={editable.section}
            />
          ) : (
            "URL 복사"
          )}
        </button>
      </div>

      {/* Toast */}
      {copied && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[var(--color-text)] text-white text-sm px-4 py-2 rounded-lg shadow-lg animate-fade-in">
          {editable ? (
            <EditableText
              contentKey={`${editable.prefix}.copied`}
              defaultValue="복사되었습니다!"
              as="span"
              page={editable.page}
              section={editable.section}
            />
          ) : (
            "복사되었습니다!"
          )}
        </div>
      )}
    </div>
  );
}
