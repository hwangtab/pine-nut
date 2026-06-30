"use client";

import { useCallback, type RefObject } from "react";
import { toPng } from "html-to-image";
import { events } from "@/lib/analytics";
import { SITE_URL } from "@/lib/site-config";
import { useAdminEdit } from "@/lib/contexts/AdminEditContext";
import {
  CARD_NEWS_TEXT,
  getSharePage,
  getSharePrefix,
  type CardNewsLocale,
} from "@/components/card-news/card-news-content";

export function useCardNewsActions({
  cardId,
  cardRef,
  locale,
}: {
  cardId: number;
  cardRef: RefObject<HTMLDivElement | null>;
  locale: CardNewsLocale;
}) {
  const text = CARD_NEWS_TEXT[locale];
  const page = getSharePage(locale);
  const prefix = getSharePrefix(locale);
  const { getContent } = useAdminEdit();
  const shareTitle = getContent(`${prefix}.cards.shareTitle`) ?? text.shareTitle;
  const cardShareTitle =
    getContent(`${prefix}.cards.card${cardId}.shareTitle`) ??
    text.cardTitles[cardId - 1];
  const copySuccess = getContent(`${prefix}.cards.copySuccess`) ?? text.copySuccess;
  const copyFailure = getContent(`${prefix}.cards.copyFailure`) ?? text.copyFailure;
  const downloadFailure =
    getContent(`${prefix}.cards.downloadFailure`) ?? text.downloadFailure;

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `${text.downloadPrefix}${cardId}.png`;
      link.href = dataUrl;
      link.click();
      events.cardNewsDownload(`card_${cardId}`);
    } catch (err) {
      console.error("Download failed:", err);
      alert(downloadFailure);
    }
  }, [cardId, cardRef, downloadFailure, text.downloadPrefix]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`${SITE_URL}${text.sharePath}`);
      events.shareClick("copy_link");
      alert(copySuccess);
    } catch {
      alert(copyFailure);
    }
  }, [copyFailure, copySuccess, text.sharePath]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: cardShareTitle,
          url: `${SITE_URL}${text.sharePath}`,
        });
        events.shareClick("web_share");
      } catch {
        // user cancelled
      }
      return;
    }

    handleCopyLink();
  }, [cardShareTitle, handleCopyLink, shareTitle, text.sharePath]);

  return {
    text,
    page,
    prefix,
    handleDownload,
    handleCopyLink,
    handleShare,
  };
}
