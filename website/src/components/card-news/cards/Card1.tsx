"use client";

import { EditableList, EditableText } from "@/components/editable";
import {
  CARD_NEWS_TEXT,
  getSharePage,
  getSharePrefix,
  type CardNewsLocale,
} from "@/components/card-news/card-news-content";
import { PatternOverlay, Watermark } from "@/components/card-news/cards/CardNewsChrome";

export function Card1({ locale }: { locale: CardNewsLocale }) {
  const text = CARD_NEWS_TEXT[locale];
  const page = getSharePage(locale);
  const prefix = getSharePrefix(locale);

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center text-white overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #2D5016 0%, #1a3a0a 60%, #0f2506 100%)",
      }}
    >
      <PatternOverlay />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full border border-white/[0.06]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full border border-white/[0.03]" />

      <div className="relative z-10 flex flex-col items-center px-8 py-7 h-full justify-center">
        <p className="text-xs tracking-[0.3em] uppercase text-white/50 mb-4 font-medium">
          <EditableText
            contentKey={`${prefix}.cards.card1.eyebrow`}
            defaultValue={text.card1Eyebrow}
            as="span"
            page={page}
            section="cards"
          />
        </p>

        <div className="text-[72px] leading-none font-black text-[#d4a853] mb-2" style={{ fontFeatureSettings: "'tnum'" }}>
          7
        </div>

        <div className="w-12 h-[2px] bg-[#d4a853]/60 mx-auto my-3" />

        <EditableText
          contentKey={`${prefix}.cards.card1.title`}
          defaultValue={text.card1Title}
          as="h2"
          page={page}
          section="cards"
          className="text-2xl font-bold tracking-tight mb-5"
        />

        <EditableList
          contentKey={`${prefix}.cards.card1.stats`}
          defaultItems={[...text.card1Stats]}
          page={page}
          section="cards"
          fields={[
            { key: "num", label: locale === "ko" ? "숫자" : "Number" },
            { key: "label", label: locale === "ko" ? "라벨" : "Label" },
          ]}
        >
          {(items) => (
            <div className="grid grid-cols-3 gap-6 mb-6">
              {items.map((stat) => (
                <div key={`${stat.num}-${stat.label}`} className="text-center">
                  <div className="text-lg font-extrabold text-[#d4a853]">{stat.num}</div>
                  <div className="text-[10px] text-white/40 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </EditableList>

        <EditableText
          contentKey={`${prefix}.cards.card1.body`}
          defaultValue={text.card1Body}
          as="p"
          page={page}
          section="cards"
          className="text-xs text-white/40 max-w-[240px] text-center leading-relaxed"
        />

        <Watermark locale={locale} />
      </div>
    </div>
  );
}
