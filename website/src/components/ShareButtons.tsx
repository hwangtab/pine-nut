"use client";

import { useState } from "react";
import { MessageCircle, Twitter, Facebook, Link } from "lucide-react";

interface ShareButtonsProps {
  title: string;
  url?: string;
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
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

  return (
    <div className="relative">
      <p className="text-sm font-semibold text-[var(--color-text-muted)] mb-3">공유하기</p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleKakao}
          className={`${buttonBase} bg-[#FEE500] text-[#3C1E1E] hover:bg-[#FDD835]`}
          aria-label="카카오톡으로 공유"
        >
          <MessageCircle className="w-4 h-4" />
          카카오톡
        </button>
        <button
          onClick={handleTwitter}
          className={`${buttonBase} bg-[var(--color-text)] text-white hover:bg-[var(--color-text)]/90`}
          aria-label="트위터(X)로 공유"
        >
          <Twitter className="w-4 h-4" />
          트위터(X)
        </button>
        <button
          onClick={handleFacebook}
          className={`${buttonBase} bg-[#1877F2] text-white hover:bg-[#166FE5]`}
          aria-label="페이스북으로 공유"
        >
          <Facebook className="w-4 h-4" />
          페이스북
        </button>
        <button
          onClick={handleCopyUrl}
          className={`${buttonBase} bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)]`}
          aria-label="URL 복사"
        >
          <Link className="w-4 h-4" />
          URL 복사
        </button>
      </div>

      {/* Toast */}
      {copied && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[var(--color-text)] text-white text-sm px-4 py-2 rounded-lg shadow-lg animate-fade-in">
          복사되었습니다!
        </div>
      )}
    </div>
  );
}
