"use client";

import { useRef } from "react";
import { Download, Link, Share2 } from "lucide-react";
import { EditableText } from "@/components/editable";
import { CardActionButton } from "@/components/card-news/CardActionButton";
import type { CardNewsItem } from "@/components/card-news/card-list";
import type { CardNewsLocale } from "@/components/card-news/card-news-content";
import { useCardNewsActions } from "@/components/card-news/useCardNewsActions";

export function CardWithActions({
  card,
  locale,
}: {
  card: CardNewsItem;
  locale: CardNewsLocale;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { text, page, prefix, handleDownload, handleCopyLink, handleShare } =
    useCardNewsActions({ cardId: card.id, cardRef, locale });

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
        <CardActionButton
          onClick={handleDownload}
          className="px-4 bg-[var(--color-forest,#2D5016)] text-white hover:opacity-90 transition-opacity"
        >
          <Download size={14} />
          <EditableText
            contentKey={`${prefix}.cards.download`}
            defaultValue={text.download}
            as="span"
            page={page}
            section="cards"
          />
        </CardActionButton>
        <CardActionButton
          onClick={handleCopyLink}
          className="bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)]"
        >
          <Link size={14} />
          <EditableText
            contentKey={`${prefix}.cards.copyLink`}
            defaultValue={text.copyLink}
            as="span"
            page={page}
            section="cards"
          />
        </CardActionButton>
        <CardActionButton
          onClick={handleShare}
          className="bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)]"
        >
          <Share2 size={14} />
          <EditableText
            contentKey={`${prefix}.cards.share`}
            defaultValue={text.share}
            as="span"
            page={page}
            section="cards"
          />
        </CardActionButton>
      </div>
    </div>
  );
}
