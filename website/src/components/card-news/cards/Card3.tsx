"use client";

import { EditableText } from "@/components/editable";
import {
  CARD_NEWS_TEXT,
  getSharePage,
  getSharePrefix,
  type CardNewsLocale,
} from "@/components/card-news/card-news-content";
import { PatternOverlay, Watermark } from "@/components/card-news/cards/CardNewsChrome";

export function Card3({ locale }: { locale: CardNewsLocale }) {
  const text = CARD_NEWS_TEXT[locale];
  const page = getSharePage(locale);
  const prefix = getSharePrefix(locale);

  return (
    <div
      className="relative w-full h-full flex flex-col items-center text-white overflow-hidden"
      style={{
        background: "linear-gradient(170deg, #4a2c2a 0%, #3a1e1c 50%, #2a1410 100%)",
      }}
    >
      <PatternOverlay />

      <div className="relative z-10 flex flex-col items-center px-7 py-7 h-full w-full">
        <div className="text-[#d4a853]/30 text-[60px] leading-none font-serif -mb-3">{"\u201C"}</div>

        <EditableText
          contentKey={`${prefix}.cards.card3.title`}
          defaultValue={text.card3Title}
          as="h2"
          page={page}
          section="cards"
          className="text-[22px] font-black leading-snug text-center mb-4 max-w-[280px] whitespace-pre-line"
        />

        <div className="w-10 h-[2px] bg-[#d4a853]/50 mx-auto mb-4" />

        <EditableText
          contentKey={`${prefix}.cards.card3.body`}
          defaultValue={text.card3Body}
          as="p"
          page={page}
          section="cards"
          className="text-sm text-white/60 leading-relaxed text-center max-w-[260px] mb-4 whitespace-pre-line"
        />

        <div
          className="rounded-xl px-6 py-3 text-center mb-4"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          <EditableText
            contentKey={`${prefix}.cards.card3.fineValue`}
            defaultValue={locale === "ko" ? "1,800만원" : "18M KRW"}
            as="div"
            page={page}
            section="cards"
            className="text-3xl font-black text-[#d4a853]"
          />
          <EditableText
            contentKey={`${prefix}.cards.card3.fineLabel`}
            defaultValue={text.card3FineLabel}
            as="div"
            page={page}
            section="cards"
            className="text-[11px] text-white/40 mt-1"
          />
        </div>

        <EditableText
          contentKey={`${prefix}.cards.card3.quote`}
          defaultValue={text.card3Quote}
          as="p"
          page={page}
          section="cards"
          className="text-[13px] text-white/45 italic text-center max-w-[260px] leading-relaxed whitespace-pre-line"
        />

        <Watermark locale={locale} />
      </div>
    </div>
  );
}
