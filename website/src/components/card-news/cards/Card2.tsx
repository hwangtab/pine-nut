"use client";

import { EditableList, EditableText } from "@/components/editable";
import {
  CARD_NEWS_TEXT,
  getSharePage,
  getSharePrefix,
  type CardNewsLocale,
} from "@/components/card-news/card-news-content";
import { PatternOverlay, Watermark } from "@/components/card-news/cards/CardNewsChrome";

export function Card2({ locale }: { locale: CardNewsLocale }) {
  const text = CARD_NEWS_TEXT[locale];
  const page = getSharePage(locale);
  const prefix = getSharePrefix(locale);

  return (
    <div
      className="relative w-full h-full flex flex-col items-center text-white overflow-hidden"
      style={{
        background: "linear-gradient(170deg, #3b2f1e 0%, #2a2018 50%, #1a1510 100%)",
      }}
    >
      <PatternOverlay />

      <div className="relative z-10 flex flex-col items-center px-7 py-7 h-full w-full">
        <div className="mb-3 opacity-25">
          <svg viewBox="0 0 80 100" fill="currentColor" className="w-16 h-20 text-white">
            <polygon points="40,4 22,30 30,30 16,54 26,54 10,78 70,78 54,54 64,54 50,30 58,30" />
            <rect x="35" y="78" width="10" height="14" rx="1" />
          </svg>
        </div>

        <EditableText
          contentKey={`${prefix}.cards.card2.title1`}
          defaultValue={text.card2Title1}
          as="h2"
          page={page}
          section="cards"
          className="text-2xl font-black leading-tight text-center mb-1"
        />
        <EditableText
          contentKey={`${prefix}.cards.card2.title2`}
          defaultValue={text.card2Title2}
          as="h2"
          page={page}
          section="cards"
          className="text-2xl font-black leading-tight text-center mb-4"
        />

        <div className="flex items-center gap-3 mb-4">
          <div className="h-[1px] w-8 bg-[#d4a853]/50" />
          <EditableText
            contentKey={`${prefix}.cards.card2.metric`}
            defaultValue={locale === "ko" ? "110,000" : "110,000"}
            as="span"
            page={page}
            section="cards"
            className="text-[#d4a853] text-sm font-bold tracking-wider"
          />
          <div className="h-[1px] w-8 bg-[#d4a853]/50" />
        </div>

        <EditableList
          contentKey={`${prefix}.cards.card2.bullets`}
          defaultItems={[...text.card2Bullets]}
          page={page}
          section="cards"
          fields={[
            { key: "icon", label: locale === "ko" ? "아이콘" : "Icon" },
            { key: "text", label: locale === "ko" ? "문구" : "Text", type: "textarea" },
          ]}
        >
          {(items) => (
            <ul className="space-y-2 text-left w-full max-w-[280px]">
              {items.map((item) => (
                <li key={`${item.icon}-${item.text}`} className="flex items-start gap-3 bg-white/[0.05] rounded-lg px-4 py-2">
                  <span className="text-sm shrink-0 mt-0.5">{item.icon}</span>
                  <span className="text-sm text-white/80 leading-relaxed">{item.text}</span>
                </li>
              ))}
            </ul>
          )}
        </EditableList>

        <Watermark locale={locale} />
      </div>
    </div>
  );
}
