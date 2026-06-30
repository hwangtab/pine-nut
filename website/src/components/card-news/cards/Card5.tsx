"use client";

import { EditableList, EditableText } from "@/components/editable";
import {
  CARD_NEWS_TEXT,
  getSharePage,
  getSharePrefix,
  type CardNewsLocale,
} from "@/components/card-news/card-news-content";
import { PatternOverlay, Watermark } from "@/components/card-news/cards/CardNewsChrome";

export function Card5({ locale }: { locale: CardNewsLocale }) {
  const text = CARD_NEWS_TEXT[locale];
  const page = getSharePage(locale);
  const prefix = getSharePrefix(locale);

  return (
    <div
      className="relative w-full h-full flex flex-col items-center text-white overflow-hidden"
      style={{
        background: "linear-gradient(170deg, #1B4965 0%, #14354d 50%, #0c2236 100%)",
      }}
    >
      <PatternOverlay />

      <div className="relative z-10 flex flex-col items-center px-6 py-6 h-full w-full">
        <p className="text-[11px] tracking-[0.25em] text-white/40 mb-2 font-medium uppercase">
          <EditableText
            contentKey={`${prefix}.cards.card5.eyebrow`}
            defaultValue={locale === "ko" ? "연표" : "Timeline"}
            as="span"
            page={page}
            section="cards"
          />
        </p>

        <EditableText
          contentKey={`${prefix}.cards.card5.title`}
          defaultValue={text.card5Title}
          as="h2"
          page={page}
          section="cards"
          className="text-[22px] font-black leading-tight text-center mb-2"
        />

        <EditableText
          contentKey={`${prefix}.cards.card5.body`}
          defaultValue={text.card5Body}
          as="p"
          page={page}
          section="cards"
          className="text-[11px] text-white/50 text-center mb-4"
        />

        <div className="relative w-full max-w-[312px] flex-1">
          <div className="absolute left-[52px] top-1 bottom-1 w-[1px] bg-white/10" />

          <EditableList
            contentKey={`${prefix}.cards.card5.timeline`}
            defaultItems={[...text.card5Timeline]}
            page={page}
            section="cards"
            fields={[
              { key: "date", label: locale === "ko" ? "날짜" : "Date" },
              { key: "event", label: locale === "ko" ? "내용" : "Event", type: "textarea" },
            ]}
          >
            {(items) => (
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={`${item.date}-${item.event}`} className="flex items-start gap-2.5">
                    <span className="shrink-0 w-[52px] text-right text-[10px] font-bold text-[#d4a853] pt-[2px] leading-[1.3] tabular-nums">
                      {item.date}
                    </span>
                    <span className="shrink-0 mt-[5px] w-[7px] h-[7px] rounded-full bg-[#d4a853] relative z-10 ring-[3px] ring-[#14354d]" />
                    <span className="flex-1 text-[11px] text-white/75 leading-[1.35]">{item.event}</span>
                  </div>
                ))}
              </div>
            )}
          </EditableList>
        </div>

        <Watermark locale={locale} />
      </div>
    </div>
  );
}
