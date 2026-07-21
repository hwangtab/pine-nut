"use client";

import { ChevronDown } from "lucide-react";
import { EditableImage, EditableList, EditableText } from "@/components/editable";
import HomeConcertBanner from "@/components/home/HomeConcertBanner";
import { AnimatedCounter } from "@/components/home/HomeMotion";
import { MountainSilhouette } from "@/components/home/HomeVisuals";

export default function HomeHeroSection({
  onScrollToStory,
}: {
  onScrollToStory: () => void;
}) {
  return (
    <>
      <EditableImage
        contentKey="home.hero.bgImage"
        defaultSrc="https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/1016/IE003535387_STD.jpg"
        alt="풍천리 마을과 잣나무 숲 드론 항공 사진"
        page="home"
        section="hero"
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/55 to-black/75 z-[1]" />
      <MountainSilhouette />

      <div className="relative z-10 w-full max-w-3xl mx-auto">
       <div className="glass rounded-[var(--radius-panel)] px-6 py-9 sm:px-12 sm:py-12">
        <div className="relative z-[1]">
        <div className="rise-in">
          <HomeConcertBanner />
        </div>

        <div className="rise-in">
          <EditableText
            contentKey="home.hero.title"
            defaultValue="7년, 680번의 외침"
            as="h1"
            page="home"
            section="hero"
            className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-[1.14] mb-5 sm:mb-6"
          />
        </div>

        <div className="rise-in rise-in-1">
          <EditableText
            contentKey="home.hero.subtitle"
            defaultValue="강원도 홍천, 잣나무 숲이 품은 작은 마을 풍천리. 주민들은 7년 넘게 양수발전소 건설에 맞서 삶의 터전과 숲을 지켜오고 있습니다"
            as="p"
            page="home"
            section="hero"
            className="text-balance text-base sm:text-xl md:text-2xl text-white/84 max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-10 md:mb-12"
          />
        </div>

        <div className="rise-in rise-in-2 grid w-full max-w-[22rem] grid-cols-3 items-start gap-3 mx-auto mb-8 sm:max-w-2xl sm:gap-6 sm:mb-12 md:mb-14">
          <EditableList
            contentKey="home.hero.counters"
            defaultItems={[
              { target: "7", suffix: "년+", label: "투쟁 기간" },
              { target: "680", suffix: "회+", label: "집회 횟수" },
              { target: "140", suffix: "개+", label: "연대 단체" },
            ]}
            page="home"
            section="hero"
            fields={[
              { key: "target", label: "숫자" },
              { key: "suffix", label: "접미사" },
              { key: "label", label: "라벨" },
            ]}
          >
            {(items) =>
              items.map((item) => (
                <div key={item.label} className="flex min-w-0 flex-col items-center">
                  <span className="whitespace-nowrap text-2xl sm:text-4xl md:text-5xl font-black leading-none text-white">
                    <AnimatedCounter target={Number(item.target)} suffix={item.suffix} />
                  </span>
                  <span className="mt-2 text-[11px] leading-tight text-white/64 sm:text-base">
                    {item.label}
                  </span>
                </div>
              ))
            }
          </EditableList>
        </div>

        <button
          type="button"
          onClick={onScrollToStory}
          className="rise-in rise-in-3 glass-btn glass-btn--glass text-base sm:text-lg cursor-pointer"
        >
          <EditableText contentKey="home.story.cta" defaultValue="이야기 보기 ↓" as="span" page="home" section="hero" />
        </button>
        </div>
       </div>
      </div>

      <div className="absolute bottom-4 right-4 z-10 sm:bottom-16 sm:right-6">
        <EditableText
          contentKey="home.hero.photoCredit"
          defaultValue="사진: 오마이뉴스"
          as="p"
          page="home"
          section="hero"
          className="text-[10px] text-white/45 sm:text-xs"
        />
      </div>

      <div className="chevron-bounce absolute bottom-8 z-10 hidden sm:block">
        <ChevronDown className="w-8 h-8 text-white/40" />
      </div>
    </>
  );
}
