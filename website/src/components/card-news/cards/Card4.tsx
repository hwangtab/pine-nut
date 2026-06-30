"use client";

import { EditableList, EditableText } from "@/components/editable";
import { SITE_HOST } from "@/lib/site-config";
import {
  CARD_NEWS_TEXT,
  getSharePage,
  getSharePrefix,
  type CardNewsLocale,
} from "@/components/card-news/card-news-content";
import { PatternOverlay, Watermark } from "@/components/card-news/cards/CardNewsChrome";

export function Card4({ locale }: { locale: CardNewsLocale }) {
  const text = CARD_NEWS_TEXT[locale];
  const page = getSharePage(locale);
  const prefix = getSharePrefix(locale);

  return (
    <div
      className="relative w-full h-full flex flex-col items-center text-white overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #C75000 0%, #a04000 50%, #7a2000 100%)",
      }}
    >
      <PatternOverlay />

      <div className="relative z-10 flex flex-col items-center px-7 py-7 h-full w-full">
        <p className="text-xs tracking-[0.25em] text-white/50 mb-3 font-medium uppercase">
          <EditableText
            contentKey={`${prefix}.cards.card4.eyebrow`}
            defaultValue={locale === "ko" ? "지금 함께" : "Act Now"}
            as="span"
            page={page}
            section="cards"
          />
        </p>

        <EditableText
          contentKey={`${prefix}.cards.card4.title1`}
          defaultValue={text.card4Title1}
          as="h2"
          page={page}
          section="cards"
          className="text-2xl font-black leading-tight text-center mb-1"
        />
        <EditableText
          contentKey={`${prefix}.cards.card4.title2`}
          defaultValue={text.card4Title2}
          as="h2"
          page={page}
          section="cards"
          className="text-2xl font-black leading-tight text-center mb-4"
        />

        <EditableText
          contentKey={`${prefix}.cards.card4.body`}
          defaultValue={text.card4Body}
          as="p"
          page={page}
          section="cards"
          className="text-sm text-white/60 text-center max-w-[260px] mb-5 leading-relaxed whitespace-pre-line"
        />

        <EditableList
          contentKey={`${prefix}.cards.card4.actions`}
          defaultItems={[...text.card4Actions]}
          page={page}
          section="cards"
          fields={[
            { key: "num", label: locale === "ko" ? "번호" : "Number" },
            { key: "label", label: locale === "ko" ? "라벨" : "Label" },
            { key: "desc", label: locale === "ko" ? "설명" : "Description", type: "textarea" },
          ]}
        >
          {(items) => (
            <div className="space-y-2.5 w-full max-w-[280px] mb-5">
              {items.map((action) => (
                <div
                  key={`${action.num}-${action.label}`}
                  className="flex items-center gap-4 rounded-xl px-4 py-2.5"
                  style={{ background: "rgba(255,255,255,0.12)" }}
                >
                  <div className="shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-black">
                    {action.num}
                  </div>
                  <div>
                    <div className="font-bold text-sm">{action.label}</div>
                    <div className="text-[11px] text-white/50">{action.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </EditableList>

        <div
          className="rounded-xl px-5 py-2.5 text-center"
          style={{
            background: "rgba(255,255,255,0.10)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <EditableText
            contentKey={`${prefix}.cards.card4.siteLabel`}
            defaultValue={text.card4SiteLabel}
            as="div"
            page={page}
            section="cards"
            className="text-[10px] text-white/40 mb-0.5"
          />
          <div className="text-sm font-bold tracking-wide">
            {locale === "ko" ? SITE_HOST : `${SITE_HOST}/en`}
          </div>
        </div>

        <Watermark locale={locale} />
      </div>
    </div>
  );
}
