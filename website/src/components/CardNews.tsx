"use client";

const cards = [
  {
    id: 1,
    title: "7년, 680번의 외침",
    bg: "bg-gradient-to-br from-[#1a3a0a] to-[#2d5016]",
    content: (
      <div className="flex flex-col items-center justify-center h-full text-white text-center px-6">
        <p className="text-lg font-medium text-white/60 mb-6">강원도 홍천 풍천리</p>
        <h2 className="text-4xl sm:text-5xl font-black leading-tight mb-8">
          7년, 680번의 외침
        </h2>
        <div className="grid grid-cols-3 gap-4 w-full max-w-xs mb-8">
          <div>
            <div className="text-3xl font-black text-[#d4a853]">7년+</div>
            <div className="text-xs text-white/50 mt-1">투쟁 기간</div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#d4a853]">680+</div>
            <div className="text-xs text-white/50 mt-1">집회 횟수</div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#d4a853]">140+</div>
            <div className="text-xs text-white/50 mt-1">연대 단체</div>
          </div>
        </div>
        <p className="text-sm text-white/60 leading-relaxed max-w-[280px]">
          양수발전소 건설에 맞서 마을과 자연을 지키기 위한 주민들의 싸움
        </p>
        <div className="mt-auto pt-6 text-xs text-white/30">풍천리를 지켜주세요</div>
      </div>
    ),
  },
  {
    id: 2,
    title: "11만 잣나무가 사라집니다",
    bg: "bg-gradient-to-br from-[#2d5016] to-[#1a5c1a]",
    content: (
      <div className="flex flex-col items-center justify-center h-full text-white text-center px-6">
        <div className="text-6xl mb-4" aria-hidden="true">
          <svg viewBox="0 0 64 96" fill="currentColor" className="w-16 h-16 mx-auto text-white/30">
            <polygon points="32,0 12,28 22,28 8,52 18,52 4,76 60,76 46,52 56,52 42,28 52,28" />
            <rect x="28" y="76" width="8" height="20" />
          </svg>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black leading-tight mb-4">
          11만 잣나무가
          <br />
          사라집니다
        </h2>
        <div className="w-16 h-0.5 bg-[#d4a853] mx-auto mb-6" />
        <ul className="text-left space-y-3 text-sm sm:text-base text-white/80 max-w-[280px]">
          <li className="flex items-start gap-2">
            <span className="text-[#d4a853] shrink-0 mt-0.5">&#9679;</span>
            <span>산림청 지정 100대 명품숲 파괴</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#d4a853] shrink-0 mt-0.5">&#9679;</span>
            <span>1,800ha 국내 최대 잣나무 숲</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#d4a853] shrink-0 mt-0.5">&#9679;</span>
            <span>산양, 까막딱다구리, 수달 서식지 파괴</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#d4a853] shrink-0 mt-0.5">&#9679;</span>
            <span>153ha 산림 영구 훼손</span>
          </li>
        </ul>
        <div className="mt-auto pt-6 text-xs text-white/30">풍천리를 지켜주세요</div>
      </div>
    ),
  },
  {
    id: 3,
    title: "70대 어르신들이 전과자가 되었습니다",
    bg: "bg-gradient-to-br from-[#4a2c2a] to-[#2a1a19]",
    content: (
      <div className="flex flex-col items-center justify-center h-full text-white text-center px-6">
        <p className="text-5xl mb-6" aria-hidden="true">&ldquo;</p>
        <h2 className="text-2xl sm:text-3xl font-black leading-tight mb-6">
          70대 어르신들이
          <br />
          전과자가 되었습니다
        </h2>
        <div className="w-16 h-0.5 bg-[#d4a853] mx-auto mb-6" />
        <p className="text-sm sm:text-base text-white/70 leading-relaxed max-w-[280px] mb-4">
          2024년 7월, 홍천군청에서 경찰과 대치.
          60~80대 주민 7명이 퇴거불응 혐의로 기소.
        </p>
        <div className="bg-white/10 rounded-xl px-6 py-4 inline-block mb-4">
          <div className="text-2xl font-black text-[#d4a853]">1,800만원</div>
          <div className="text-xs text-white/50 mt-1">벌금 총 구형액</div>
        </div>
        <p className="text-xs text-white/50 italic max-w-[260px]">
          &ldquo;70 평생 남에게 해를 끼친 적 없는 사람이, 내 땅을 지키겠다는 이유로.&rdquo;
        </p>
        <div className="mt-auto pt-6 text-xs text-white/30">풍천리를 지켜주세요</div>
      </div>
    ),
  },
  {
    id: 4,
    title: "함께해주세요",
    bg: "bg-gradient-to-br from-[#c25a3a] to-[#8b3a2a]",
    content: (
      <div className="flex flex-col items-center justify-center h-full text-white text-center px-6">
        <h2 className="text-4xl sm:text-5xl font-black leading-tight mb-4">
          함께해주세요
        </h2>
        <p className="text-base text-white/70 leading-relaxed mb-8 max-w-[280px]">
          풍천리 주민들의 싸움은 우리 모두의 싸움입니다.
          작은 관심이 큰 힘이 됩니다.
        </p>
        <div className="space-y-3 w-full max-w-[260px] mb-8">
          <div className="bg-white/15 rounded-xl px-5 py-3 text-left">
            <span className="font-bold">1.</span> 서명에 참여해주세요
          </div>
          <div className="bg-white/15 rounded-xl px-5 py-3 text-left">
            <span className="font-bold">2.</span> 후원으로 힘을 보태주세요
          </div>
          <div className="bg-white/15 rounded-xl px-5 py-3 text-left">
            <span className="font-bold">3.</span> SNS에 공유해주세요
          </div>
        </div>
        <div className="bg-white/10 border border-white/20 rounded-xl px-6 py-4 inline-block">
          <div className="text-xs text-white/50 mb-2">캠페인 사이트</div>
          <div className="text-sm font-bold text-white">풍천리를 지켜주세요</div>
        </div>
        <div className="mt-auto pt-6 text-xs text-white/30">풍천리를 지켜주세요</div>
      </div>
    ),
  },
  {
    id: 5,
    title: "풍천리 타임라인",
    bg: "bg-gradient-to-br from-[#1a2a4a] to-[#0a1a2a]",
    content: (
      <div className="flex flex-col items-center justify-center h-full text-white text-center px-6">
        <h2 className="text-3xl sm:text-4xl font-black leading-tight mb-8">
          풍천리 타임라인
        </h2>
        <div className="w-full max-w-[280px] space-y-4 text-left">
          {[
            { year: "2019", event: "홍천군 양수발전소 유치 신청" },
            { year: "2019", event: "주민 반대대책위원회 결성" },
            { year: "2020~", event: "매주 홍천군청 앞 집회 시작" },
            { year: "2024.7", event: "주민 7명 기소 (퇴거불응)" },
            { year: "2024.10", event: "잣나무 2,256그루 벌채 시작" },
            { year: "2025.8", event: "실시계획인가 고시" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="shrink-0 bg-[#d4a853] text-[#0a1a2a] text-xs font-bold px-2 py-1 rounded-md mt-0.5">
                {item.year}
              </span>
              <span className="text-sm text-white/80 leading-relaxed">{item.event}</span>
            </div>
          ))}
        </div>
        <div className="mt-auto pt-6 text-xs text-white/30">풍천리를 지켜주세요</div>
      </div>
    ),
  },
];

export default function CardNews() {
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`${card.bg} rounded-2xl shadow-lg overflow-hidden`}
              style={{ aspectRatio: "4 / 5" }}
            >
              <div className="w-full h-full flex flex-col py-8">
                {card.content}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
