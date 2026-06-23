"use client";

import { EditableList, EditableText } from "@/components/editable";
import { SITE_HOST } from "@/lib/site-config";
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

function Watermark({ locale }: { locale: CardNewsLocale }) {
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

function PatternOverlay() {
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
