"use client";

import { useRef, useCallback } from "react";
import { toPng } from "html-to-image";
import { Download, Link, Share2 } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Shared sub-components                                              */
/* ------------------------------------------------------------------ */

function Watermark() {
  return (
    <div className="mt-auto pt-4 flex items-center justify-center gap-1.5 opacity-40">
      <svg viewBox="0 0 16 24" fill="currentColor" className="w-3 h-4 text-white">
        <polygon points="8,0 3,7 5.5,7 2,13 4.5,13 1,19 15,19 11.5,13 14,13 10.5,7 13,7" />
        <rect x="6.5" y="19" width="3" height="5" />
      </svg>
      <span className="text-[10px] text-white tracking-wider font-medium">
        풍천리를 지켜주세요
      </span>
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

/* ------------------------------------------------------------------ */
/*  Card 1: Hero — "7년, 680번의 외침"                                  */
/* ------------------------------------------------------------------ */

function Card1() {
  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center text-white overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #2D5016 0%, #1a3a0a 60%, #0f2506 100%)",
      }}
    >
      <PatternOverlay />
      {/* Decorative ring */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full border border-white/[0.06]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full border border-white/[0.03]" />

      <div className="relative z-10 flex flex-col items-center px-8 py-10 h-full justify-center">
        <p className="text-xs tracking-[0.3em] uppercase text-white/50 mb-6 font-medium">
          강원도 홍천 풍천리
        </p>

        <div className="text-[80px] leading-none font-black text-[#d4a853] mb-2" style={{ fontFeatureSettings: "'tnum'" }}>
          7년
        </div>

        <div className="w-12 h-[2px] bg-[#d4a853]/60 mx-auto my-4" />

        <h2 className="text-2xl font-bold tracking-tight mb-6">
          680번의 외침
        </h2>

        <div className="grid grid-cols-3 gap-6 mb-8">
          {[
            { num: "680+", label: "집회 횟수" },
            { num: "140+", label: "연대 단체" },
            { num: "11만", label: "잣나무" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-lg font-extrabold text-[#d4a853]">{s.num}</div>
              <div className="text-[10px] text-white/40 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <p className="text-xs text-white/40 max-w-[240px] text-center leading-relaxed">
          양수발전소 건설에 맞서 마을과 자연을 지키기 위한 주민들의 기록
        </p>

        <Watermark />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Card 2: "11만 그루 잣나무가 사라집니다"                               */
/* ------------------------------------------------------------------ */

function Card2() {
  return (
    <div
      className="relative w-full h-full flex flex-col items-center text-white overflow-hidden"
      style={{
        background: "linear-gradient(170deg, #3b2f1e 0%, #2a2018 50%, #1a1510 100%)",
      }}
    >
      <PatternOverlay />

      <div className="relative z-10 flex flex-col items-center px-7 py-10 h-full w-full">
        {/* Pine tree silhouette */}
        <div className="mb-5 opacity-25">
          <svg viewBox="0 0 80 100" fill="currentColor" className="w-20 h-24 text-white">
            <polygon points="40,4 22,30 30,30 16,54 26,54 10,78 70,78 54,54 64,54 50,30 58,30" />
            <rect x="35" y="78" width="10" height="14" rx="1" />
          </svg>
        </div>

        <h2 className="text-3xl font-black leading-tight text-center mb-2">
          11만 그루 잣나무가
        </h2>
        <h2 className="text-3xl font-black leading-tight text-center mb-5">
          사라집니다
        </h2>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-[1px] w-8 bg-[#d4a853]/50" />
          <span className="text-[#d4a853] text-sm font-bold tracking-wider">110,000</span>
          <div className="h-[1px] w-8 bg-[#d4a853]/50" />
        </div>

        <ul className="space-y-3 text-left w-full max-w-[280px]">
          {[
            { icon: "🌲", text: "산림청 지정 100대 명품숲 파괴" },
            { icon: "📐", text: "1,800ha 국내 최대 잣나무 숲" },
            { icon: "🦌", text: "산양·까막딱따구리·수달 서식지 위협" },
            { icon: "⛏️", text: "153ha 산림 영구 훼손 예정" },
          ].map((item) => (
            <li key={item.text} className="flex items-start gap-3 bg-white/[0.05] rounded-lg px-4 py-2.5">
              <span className="text-sm shrink-0 mt-0.5">{item.icon}</span>
              <span className="text-sm text-white/80 leading-relaxed">{item.text}</span>
            </li>
          ))}
        </ul>

        <Watermark />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Card 3: "70대 어르신이 전과자가 되었습니다"                           */
/* ------------------------------------------------------------------ */

function Card3() {
  return (
    <div
      className="relative w-full h-full flex flex-col items-center text-white overflow-hidden"
      style={{
        background: "linear-gradient(170deg, #4a2c2a 0%, #3a1e1c 50%, #2a1410 100%)",
      }}
    >
      <PatternOverlay />

      <div className="relative z-10 flex flex-col items-center px-7 py-10 h-full w-full">
        {/* Large quote mark */}
        <div className="text-[#d4a853]/30 text-[72px] leading-none font-serif -mb-4">&ldquo;</div>

        <h2 className="text-[22px] font-black leading-snug text-center mb-5 max-w-[280px]">
          70대 어르신들이
          <br />
          전과자가 되었습니다
        </h2>

        <div className="w-10 h-[2px] bg-[#d4a853]/50 mx-auto mb-5" />

        <p className="text-sm text-white/60 leading-relaxed text-center max-w-[260px] mb-5">
          2024년 7월, 홍천군청에서 경찰과 대치.
          <br />
          60~80대 주민 7명이 퇴거불응 혐의로 기소.
        </p>

        <div
          className="rounded-xl px-6 py-4 text-center mb-5"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          <div className="text-3xl font-black text-[#d4a853]">1,800만원</div>
          <div className="text-[11px] text-white/40 mt-1.5">벌금 총 구형액</div>
        </div>

        <p className="text-[13px] text-white/45 italic text-center max-w-[260px] leading-relaxed">
          &ldquo;70 평생 남에게 해를 끼친 적 없는 사람이,
          <br />
          내 땅을 지키겠다는 이유로.&rdquo;
        </p>

        <Watermark />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Card 4: CTA — "당신도 함께해주세요"                                  */
/* ------------------------------------------------------------------ */

function Card4() {
  const actions = [
    { num: "1", label: "서명", desc: "캠페인에 서명해주세요" },
    { num: "2", label: "후원", desc: "작은 금액도 큰 힘이 됩니다" },
    { num: "3", label: "공유", desc: "SNS에 알려주세요" },
  ];

  return (
    <div
      className="relative w-full h-full flex flex-col items-center text-white overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #C75000 0%, #a04000 50%, #7a2000 100%)",
      }}
    >
      <PatternOverlay />

      <div className="relative z-10 flex flex-col items-center px-7 py-10 h-full w-full">
        <p className="text-xs tracking-[0.25em] text-white/50 mb-4 font-medium uppercase">
          Act Now
        </p>

        <h2 className="text-3xl font-black leading-tight text-center mb-2">
          당신도
        </h2>
        <h2 className="text-3xl font-black leading-tight text-center mb-6">
          함께해주세요
        </h2>

        <p className="text-sm text-white/60 text-center max-w-[260px] mb-7 leading-relaxed">
          풍천리 주민들의 싸움은
          <br />
          우리 모두의 싸움입니다.
        </p>

        <div className="space-y-3 w-full max-w-[280px] mb-7">
          {actions.map((a) => (
            <div
              key={a.num}
              className="flex items-center gap-4 rounded-xl px-4 py-3"
              style={{ background: "rgba(255,255,255,0.12)" }}
            >
              <div className="shrink-0 w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-sm font-black">
                {a.num}
              </div>
              <div>
                <div className="font-bold text-sm">{a.label}</div>
                <div className="text-[11px] text-white/50">{a.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div
          className="rounded-xl px-5 py-3 text-center"
          style={{
            background: "rgba(255,255,255,0.10)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <div className="text-[10px] text-white/40 mb-1">캠페인 사이트</div>
          <div className="text-sm font-bold tracking-wide">pungcheonri.vercel.app</div>
        </div>

        <Watermark />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Card 5: Timeline — "풍천리 타임라인"                                 */
/* ------------------------------------------------------------------ */

function Card5() {
  const events = [
    { year: "2019", event: "홍천군 양수발전소 유치 신청" },
    { year: "2019", event: "주민 반대대책위원회 결성" },
    { year: "2020~", event: "매주 홍천군청 앞 집회 시작" },
    { year: "2024.7", event: "주민 7명 기소 (퇴거불응)" },
    { year: "2024.10", event: "잣나무 2,256그루 벌채 시작" },
    { year: "2025.8", event: "실시계획인가 고시" },
  ];

  return (
    <div
      className="relative w-full h-full flex flex-col items-center text-white overflow-hidden"
      style={{
        background: "linear-gradient(170deg, #1B4965 0%, #14354d 50%, #0c2236 100%)",
      }}
    >
      <PatternOverlay />

      <div className="relative z-10 flex flex-col items-center px-7 py-10 h-full w-full">
        <p className="text-xs tracking-[0.25em] text-white/40 mb-3 font-medium uppercase">
          Timeline
        </p>

        <h2 className="text-2xl font-black leading-tight text-center mb-7">
          풍천리 타임라인
        </h2>

        {/* Timeline */}
        <div className="relative w-full max-w-[300px]">
          {/* Vertical line */}
          <div className="absolute left-[42px] top-1 bottom-1 w-[1px] bg-white/10" />

          <div className="space-y-3.5">
            {events.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="shrink-0 w-[76px] text-right text-xs font-bold text-[#d4a853] mt-0.5 tabular-nums">
                  {item.year}
                </span>
                <span className="shrink-0 mt-1.5 w-2 h-2 rounded-full bg-[#d4a853] relative z-10 ring-2 ring-[#14354d]" />
                <span className="text-sm text-white/75 leading-relaxed">{item.event}</span>
              </div>
            ))}
          </div>
        </div>

        <Watermark />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Card wrapper with download / share actions                         */
/* ------------------------------------------------------------------ */

interface CardItem {
  id: number;
  title: string;
  Component: React.FC;
}

const cardList: CardItem[] = [
  { id: 1, title: "7년, 680번의 외침", Component: Card1 },
  { id: 2, title: "11만 잣나무가 사라집니다", Component: Card2 },
  { id: 3, title: "70대 어르신이 전과자가 되었습니다", Component: Card3 },
  { id: 4, title: "당신도 함께해주세요", Component: Card4 },
  { id: 5, title: "풍천리 타임라인", Component: Card5 },
];

function CardWithActions({ card }: { card: CardItem }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      // Generate at 2x for retina quality
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `풍천리-카드${card.id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
      alert("이미지 다운로드에 실패했습니다. 카드를 길게 눌러 저장해주세요.");
    }
  }, [card.id]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText("https://pungcheonri.vercel.app/share");
      alert("링크가 복사되었습니다!");
    } catch {
      alert("링크 복사에 실패했습니다.");
    }
  }, []);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "풍천리를 지켜주세요",
          text: card.title,
          url: "https://pungcheonri.vercel.app/share",
        });
      } catch {
        // user cancelled
      }
    } else {
      handleCopyLink();
    }
  }, [card.title, handleCopyLink]);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Card */}
      <div
        ref={cardRef}
        className="w-full max-w-[400px] overflow-hidden rounded-2xl shadow-xl"
        style={{ aspectRatio: "4 / 5" }}
      >
        <card.Component />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--color-forest,#2D5016)] text-white text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
        >
          <Download size={14} />
          다운로드
        </button>
        <button
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
        >
          <Link size={14} />
          링크 복사
        </button>
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
        >
          <Share2 size={14} />
          공유
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Export                                                              */
/* ------------------------------------------------------------------ */

export default function CardNews() {
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {cardList.map((card) => (
            <CardWithActions key={card.id} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}
