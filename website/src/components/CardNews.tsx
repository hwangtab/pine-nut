"use client";

import { useRef, useCallback } from "react";
import { toPng } from "html-to-image";
import { Download, Link, Share2 } from "lucide-react";
import { events } from "@/lib/analytics";
import { SITE_URL } from "@/lib/site-config";
import { EditableText } from "@/components/editable";
import CardNewsEditControls from "@/components/card-news/CardNewsEditControls";
import {
  Card1,
  Card2,
  Card3,
  Card4,
  Card5,
  type CardNewsCardComponent,
} from "@/components/card-news/CardNewsCards";
import {
  CARD_NEWS_TEXT,
  getSharePage,
  getSharePrefix,
  type CardNewsLocale,
} from "@/components/card-news/card-news-content";
import { useAdminEdit } from "@/lib/contexts/AdminEditContext";

interface CardItem {
  id: number;
  title: string;
  Component: CardNewsCardComponent;
}

function buildCardList(locale: CardNewsLocale): CardItem[] {
  return [
    { id: 1, title: CARD_NEWS_TEXT[locale].cardTitles[0], Component: Card1 },
    { id: 2, title: CARD_NEWS_TEXT[locale].cardTitles[1], Component: Card2 },
    { id: 3, title: CARD_NEWS_TEXT[locale].cardTitles[2], Component: Card3 },
    { id: 4, title: CARD_NEWS_TEXT[locale].cardTitles[3], Component: Card4 },
    { id: 5, title: CARD_NEWS_TEXT[locale].cardTitles[4], Component: Card5 },
  ];
}

function CardWithActions({
  card,
  locale,
}: {
  card: CardItem;
  locale: CardNewsLocale;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const text = CARD_NEWS_TEXT[locale];
  const page = getSharePage(locale);
  const prefix = getSharePrefix(locale);
  const { getContent } = useAdminEdit();
  const shareTitle = getContent(`${prefix}.cards.shareTitle`) ?? text.shareTitle;
  const cardShareTitle =
    getContent(`${prefix}.cards.card${card.id}.shareTitle`) ?? text.cardTitles[card.id - 1];
  const copySuccess = getContent(`${prefix}.cards.copySuccess`) ?? text.copySuccess;
  const copyFailure = getContent(`${prefix}.cards.copyFailure`) ?? text.copyFailure;
  const downloadFailure = getContent(`${prefix}.cards.downloadFailure`) ?? text.downloadFailure;

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `${text.downloadPrefix}${card.id}.png`;
      link.href = dataUrl;
      link.click();
      events.cardNewsDownload(`card_${card.id}`);
    } catch (err) {
      console.error("Download failed:", err);
      alert(downloadFailure);
    }
  }, [card.id, downloadFailure, text.downloadPrefix]);

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
    } else {
      handleCopyLink();
    }
  }, [cardShareTitle, handleCopyLink, shareTitle, text.sharePath]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-full max-w-[400px] overflow-hidden rounded-2xl shadow-xl aspect-[4/5] [container-type:inline-size]">
        <div
          className="absolute top-0 left-0 origin-top-left"
          style={{
            width: "400px",
            height: "500px",
            transform: "scale(calc(100cqw / 400px))",
          }}
        >
          <div ref={cardRef} className="w-[400px] h-[500px]">
            <card.Component locale={locale} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-xl bg-[var(--color-forest,#2D5016)] text-white text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
        >
          <Download size={14} />
          <EditableText
            contentKey={`${prefix}.cards.download`}
            defaultValue={text.download}
            as="span"
            page={page}
            section="cards"
          />
        </button>
        <button
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl bg-[var(--color-bg)] text-[var(--color-text-muted)] text-xs font-semibold hover:bg-[var(--color-border)] transition-colors cursor-pointer"
        >
          <Link size={14} />
          <EditableText
            contentKey={`${prefix}.cards.copyLink`}
            defaultValue={text.copyLink}
            as="span"
            page={page}
            section="cards"
          />
        </button>
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl bg-[var(--color-bg)] text-[var(--color-text-muted)] text-xs font-semibold hover:bg-[var(--color-border)] transition-colors cursor-pointer"
        >
          <Share2 size={14} />
          <EditableText
            contentKey={`${prefix}.cards.share`}
            defaultValue={text.share}
            as="span"
            page={page}
            section="cards"
          />
        </button>
      </div>
    </div>
  );
}

export default function CardNews({
  locale = "ko",
}: {
  locale?: CardNewsLocale;
}) {
  const { isEditMode } = useAdminEdit();
  const cardList = buildCardList(locale);

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {cardList.map((card) => (
            <CardWithActions key={card.id} card={card} locale={locale} />
          ))}
        </div>
      </div>
      {isEditMode && <CardNewsEditControls locale={locale} />}
    </section>
  );
}
