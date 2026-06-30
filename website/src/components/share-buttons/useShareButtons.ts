"use client";

import { useCallback, useState } from "react";

export function useShareButtons({ title, url }: { title: string; url?: string }) {
  const [copied, setCopied] = useState(false);

  const getUrl = useCallback(() => {
    if (url) return url;
    if (typeof window !== "undefined") return window.location.href;
    return "";
  }, [url]);

  const markCopied = useCallback(() => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleCopyUrl = useCallback(async () => {
    const shareUrl = getUrl();

    try {
      await navigator.clipboard.writeText(shareUrl);
      markCopied();
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = shareUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      markCopied();
    }
  }, [getUrl, markCopied]);

  const handleKakao = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          url: getUrl(),
        });
      } catch {
        // 사용자가 공유를 취소한 경우
      }
      return;
    }

    handleCopyUrl();
  }, [getUrl, handleCopyUrl, title]);

  const handleTwitter = useCallback(() => {
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      title,
    )}&url=${encodeURIComponent(getUrl())}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  }, [getUrl, title]);

  const handleFacebook = useCallback(() => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      getUrl(),
    )}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  }, [getUrl]);

  return {
    copied,
    handleKakao,
    handleTwitter,
    handleFacebook,
    handleCopyUrl,
  };
}
