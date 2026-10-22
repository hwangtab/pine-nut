"use client";

import { useCallback, useState } from "react";
import { events } from "@/lib/analytics";
import type { ShareCopiedKind } from "./types";

export function useShareButtons({ title, url }: { title: string; url?: string }) {
  // null이면 토스트 없음. "kakao"는 데스크톱처럼 navigator.share가 없어 카카오톡
  // 버튼이 링크 복사로 대신한 경우 — 말없이 복사만 하면 아무 일도 안 일어난 것처럼 보인다.
  const [copied, setCopied] = useState<ShareCopiedKind | null>(null);

  const getUrl = useCallback(() => {
    if (url) return url;
    if (typeof window !== "undefined") return window.location.href;
    return "";
  }, [url]);

  const markCopied = useCallback((kind: ShareCopiedKind) => {
    setCopied(kind);
    setTimeout(() => setCopied(null), kind === "kakao" ? 3500 : 2000);
  }, []);

  const copyUrl = useCallback(async (kind: ShareCopiedKind) => {
    const shareUrl = getUrl();

    try {
      await navigator.clipboard.writeText(shareUrl);
      events.shareClick(kind === "kakao" ? "clipboard_share" : "copy_url");
      markCopied(kind);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = shareUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      events.shareClick(kind === "kakao" ? "clipboard_share" : "copy_url");
      markCopied(kind);
    }
  }, [getUrl, markCopied]);

  const handleCopyUrl = useCallback(() => copyUrl("link"), [copyUrl]);

  const handleKakao = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          url: getUrl(),
        });
        events.shareClick("native");
      } catch {
        // 사용자가 공유를 취소한 경우
      }
      return;
    }

    copyUrl("kakao");
  }, [getUrl, copyUrl, title]);

  const handleTwitter = useCallback(() => {
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      title,
    )}&url=${encodeURIComponent(getUrl())}`;
    events.shareClick("twitter");
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  }, [getUrl, title]);

  const handleFacebook = useCallback(() => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      getUrl(),
    )}`;
    events.shareClick("facebook");
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
