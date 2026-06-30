"use client";

import { EditableText } from "@/components/editable";
import {
  CARD_NEWS_TEXT,
  getSharePage,
  getSharePrefix,
  type CardNewsLocale,
} from "@/components/card-news/card-news-content";

export type CardNewsCardComponent = ({
  locale,
}: {
  locale: CardNewsLocale;
}) => React.JSX.Element;

export function Watermark({ locale }: { locale: CardNewsLocale }) {
  const page = getSharePage(locale);
  const prefix = getSharePrefix(locale);
  return (
    <div className="mt-auto pt-4 flex items-center justify-center gap-1.5 opacity-40">
      <svg viewBox="0 0 16 24" fill="currentColor" className="w-3 h-4 text-white">
        <polygon points="8,0 3,7 5.5,7 2,13 4.5,13 1,19 15,19 11.5,13 14,13 10.5,7 13,7" />
        <rect x="6.5" y="19" width="3" height="5" />
      </svg>
      <EditableText
        contentKey={`${prefix}.cards.brand`}
        defaultValue={CARD_NEWS_TEXT[locale].brand}
        as="span"
        page={page}
        section="cards"
        className="text-[10px] text-white tracking-wider font-medium"
      />
    </div>
  );
}

export function PatternOverlay() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
        backgroundSize: "24px 24px",
      }}
    />
  );
}
