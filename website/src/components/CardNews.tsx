"use client";

import { useRef, useCallback } from "react";
import { toPng } from "html-to-image";
import { Download, Link, Share2 } from "lucide-react";
import { events } from "@/lib/analytics";
import { SITE_HOST, SITE_URL } from "@/lib/site-config";
import { EditableList, EditableText, EditableValue } from "@/components/editable";
import { useAdminEdit } from "@/lib/contexts/AdminEditContext";

type CardNewsLocale = "ko" | "en";

const TEXT = {
  ko: {
    brand: "풍천리를 지켜주세요",
    shareTitle: "풍천리를 지켜주세요",
    sharePath: "/share",
    downloadPrefix: "풍천리-카드",
    download: "다운로드",
    copyLink: "링크 복사",
    share: "공유",
    copySuccess: "링크가 복사되었습니다!",
    copyFailure: "링크 복사에 실패했습니다.",
    downloadFailure: "이미지 다운로드에 실패했습니다. 카드를 길게 눌러 저장해주세요.",
    card1Eyebrow: "강원도 홍천 풍천리",
    card1Title: "680번의 외침",
    card1Stats: [
      { num: "680+", label: "집회 횟수" },
      { num: "140+", label: "연대 단체" },
      { num: "11만", label: "잣나무" },
    ],
    card1Body: "양수발전소 건설에 맞서 마을과 자연을 지키기 위한 주민들의 기록",
    card2Title1: "11만 그루 잣나무가",
    card2Title2: "사라집니다",
    card2Bullets: [
      { icon: "🌲", text: "산림청 지정 100대 명품숲 파괴" },
      { icon: "📐", text: "1,800ha 국내 최대 잣나무 숲" },
      { icon: "🦌", text: "산양·까막딱따구리·수달 서식지 위협" },
      { icon: "⛏️", text: "153ha 산림 영구 훼손 예정" },
    ],
    card3Title: "70대 어르신들이\n전과자가 되었습니다",
    card3Body:
      "2024년 7월, 홍천군청에서 경찰과 대치.\n60~80대 주민 7명이 퇴거불응 혐의로 기소.",
    card3FineLabel: "벌금 구형 총액",
    card3Quote:
      "칠십 평생 남에게 해를 끼친 적 없는 사람이,\n내 땅을 지키겠다는 이유로.",
    card4Title1: "당신도",
    card4Title2: "함께해주세요",
    card4Body: "풍천리 주민들의 싸움은\n우리 모두의 싸움입니다.",
    card4Actions: [
      { num: "1", label: "서명", desc: "캠페인에 서명해주세요" },
      { num: "2", label: "후원", desc: "작은 금액도 큰 힘이 됩니다" },
      { num: "3", label: "공유", desc: "SNS에 알려주세요" },
    ],
    card4SiteLabel: "캠페인 사이트",
    card5Title: "풍천리 타임라인",
    card5Body:
      "2019년부터 2026년까지, 밀어붙인 개발과 멈추지 않은 저항",
    card5Timeline: [
      { date: "2019.03", event: "군수, 주민 반대 시 중단 약속" },
      { date: "2019.04", event: "주민설명회 강행, 철야 농성" },
      { date: "2019", event: "반대대책위 결성, 정기 집회 시작" },
      { date: "2021.05", event: "우선사업자 선정" },
      { date: "2022.02", event: "공공 예비타당성조사 통과" },
      { date: "2023.05", event: "사업예정구역 지정·고시" },
      { date: "2024.07", event: "홍천군청 경찰 대치" },
      { date: "2024.10", event: "잣나무 2,256그루 벌채 시작" },
      { date: "2025.08", event: "실시계획인가 고시" },
      { date: "2025.11", event: "주민 7명 기소" },
      { date: "2026.01", event: "본공사 착공 예정" },
    ],
    cardTitles: [
      "7년, 680번의 외침",
      "11만 그루 잣나무가 사라집니다",
      "70대 어르신이 전과자가 되었습니다",
      "당신도 함께해주세요",
      "풍천리 타임라인",
    ],
  },
  en: {
    brand: "Save Pungcheon-ri",
    shareTitle: "Save Pungcheon-ri",
    sharePath: "/en/share",
    downloadPrefix: "save-pungcheonri-card-",
    download: "Download",
    copyLink: "Copy Link",
    share: "Share",
    copySuccess: "Link copied.",
    copyFailure: "Failed to copy the link.",
    downloadFailure:
      "Download failed. Please long-press the card image to save it.",
    card1Eyebrow: "Pungcheon-ri, Hongcheon, South Korea",
    card1Title: "680 Cries of Resistance",
    card1Stats: [
      { num: "680+", label: "Weekly protests" },
      { num: "140+", label: "Allied groups" },
      { num: "110K", label: "Pine trees" },
    ],
    card1Body:
      "Residents have spent more than seven years defending their village and pine forest from a pumped-storage power plant.",
    card2Title1: "110,000 Pine Trees",
    card2Title2: "Could Be Lost",
    card2Bullets: [
      { icon: "🌲", text: "A Korea Forest Service Top 100 Forest at risk" },
      { icon: "📐", text: "1,800 hectares of pine nut forest" },
      { icon: "🦌", text: "Habitat for goral, black woodpecker, and otter" },
      { icon: "⛏️", text: "About 153 hectares threatened by permanent damage" },
    ],
    card3Title: "Elderly Residents\nNow Face Criminal Charges",
    card3Body:
      "In July 2024, residents confronted police at Hongcheon County Hall.\nSeven villagers aged 60 to 80 were indicted.",
    card3FineLabel: "Total fines sought",
    card3Quote:
      "People who never harmed anyone in their lives\nare being punished for trying to defend their land.",
    card4Title1: "Stand",
    card4Title2: "With Them",
    card4Body:
      "The struggle in Pungcheon-ri belongs\nto everyone who cares about forests and communities.",
    card4Actions: [
      { num: "1", label: "Sign", desc: "Add your name to the petition" },
      { num: "2", label: "Donate", desc: "Help cover transport and legal costs" },
      { num: "3", label: "Share", desc: "Spread the story online" },
    ],
    card4SiteLabel: "Campaign site",
    card5Title: "Pungcheon-ri Timeline",
    card5Body:
      "From 2019 to 2026: development was pushed ahead, and resistance never stopped.",
    card5Timeline: [
      { date: "2019.03", event: "Governor promises to stop if residents oppose" },
      { date: "2019.04", event: "Public briefing forced through; overnight sit-in begins" },
      { date: "2019", event: "Opposition committee formed; weekly protests begin" },
      { date: "2021.05", event: "Preferred developer selected" },
      { date: "2022.02", event: "Public feasibility review passes" },
      { date: "2023.05", event: "Project zone officially designated" },
      { date: "2024.07", event: "Police confrontation at county hall" },
      { date: "2024.10", event: "2,256 pine trees cut for relocation road" },
      { date: "2025.08", event: "Implementation approval notice issued" },
      { date: "2025.11", event: "Seven residents indicted" },
      { date: "2026.01", event: "Main construction scheduled" },
    ],
    cardTitles: [
      "680 cries of resistance",
      "110,000 pine trees at risk",
      "Elderly residents face charges",
      "Stand with Pungcheon-ri",
      "Pungcheon-ri timeline",
    ],
  },
} as const;

function getSharePage(locale: CardNewsLocale) {
  return locale === "ko" ? "share" : "en/share";
}

function getSharePrefix(locale: CardNewsLocale) {
  return locale === "ko" ? "share" : "en.share";
}

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
        defaultValue={TEXT[locale].brand}
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

function Card1({ locale }: { locale: CardNewsLocale }) {
  const text = TEXT[locale];
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

function Card2({ locale }: { locale: CardNewsLocale }) {
  const text = TEXT[locale];
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

function Card3({ locale }: { locale: CardNewsLocale }) {
  const text = TEXT[locale];
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

function Card4({ locale }: { locale: CardNewsLocale }) {
  const text = TEXT[locale];
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

function Card5({ locale }: { locale: CardNewsLocale }) {
  const text = TEXT[locale];
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

interface CardItem {
  id: number;
  title: string;
  Component: ({ locale }: { locale: CardNewsLocale }) => React.JSX.Element;
}

function buildCardList(locale: CardNewsLocale): CardItem[] {
  return [
    { id: 1, title: TEXT[locale].cardTitles[0], Component: Card1 },
    { id: 2, title: TEXT[locale].cardTitles[1], Component: Card2 },
    { id: 3, title: TEXT[locale].cardTitles[2], Component: Card3 },
    { id: 4, title: TEXT[locale].cardTitles[3], Component: Card4 },
    { id: 5, title: TEXT[locale].cardTitles[4], Component: Card5 },
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
  const text = TEXT[locale];
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
  const page = getSharePage(locale);
  const prefix = getSharePrefix(locale);
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
      {isEditMode && (
        <div className="fixed bottom-4 right-4 z-40 flex flex-wrap gap-2 rounded-2xl border border-blue-200 bg-white/95 p-3 shadow-xl backdrop-blur">
          <EditableValue
            contentKey={`${prefix}.cards.shareTitle`}
            defaultValue={TEXT[locale].shareTitle}
            page={page}
            section="cards"
            buttonLabel={locale === "ko" ? "공유 제목" : "Share title"}
            wrapperClassName="relative"
            buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
          >
            {(value, editButton) => editButton ?? <span>{value}</span>}
          </EditableValue>
          <EditableValue
            contentKey={`${prefix}.cards.copySuccess`}
            defaultValue={TEXT[locale].copySuccess}
            page={page}
            section="cards"
            buttonLabel={locale === "ko" ? "복사 성공" : "Copy success"}
            wrapperClassName="relative"
            buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
          >
            {(value, editButton) => editButton ?? <span>{value}</span>}
          </EditableValue>
          <EditableValue
            contentKey={`${prefix}.cards.copyFailure`}
            defaultValue={TEXT[locale].copyFailure}
            page={page}
            section="cards"
            buttonLabel={locale === "ko" ? "복사 실패" : "Copy failure"}
            wrapperClassName="relative"
            buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
          >
            {(value, editButton) => editButton ?? <span>{value}</span>}
          </EditableValue>
          <EditableValue
            contentKey={`${prefix}.cards.downloadFailure`}
            defaultValue={TEXT[locale].downloadFailure}
            page={page}
            section="cards"
            multiline
            buttonLabel={locale === "ko" ? "다운로드 오류" : "Download error"}
            wrapperClassName="relative"
            buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
          >
            {(value, editButton) => editButton ?? <span>{value}</span>}
          </EditableValue>
        </div>
      )}
    </section>
  );
}
