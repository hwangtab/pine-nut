"use client";

import { ChevronDown } from "lucide-react";
import { EditableImage, EditableList, EditableText } from "@/components/editable";
import HomeConcertBanner from "@/components/home/HomeConcertBanner";
import { AnimatedCounter } from "@/components/home/HomeMotion";
import { RidgeDivider } from "@/components/visuals/ForestLetterMotifs";

export default function HomeHeroSection({
  onScrollToStory,
}: {
  onScrollToStory: () => void;
}) {
  return (
    <>
      <EditableImage
        contentKey="home.hero.bgImage"
        defaultSrc="https://hxcoeowfjanltwrsqhyz.supabase.co/storage/v1/object/public/images/press/ie003535387_std.jpg"
        fallbackSrc="/images/forest-aerial.jpg"
        alt="풍천리 마을과 잣나무 숲 드론 항공 사진"
        page="home"
        section="hero"
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 object-cover"
      />
      {/* 사진을 살리는 얇은 잉크 그라디언트 — 하단은 한지 배경으로 이어진다 */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(180deg, rgba(12,20,12,0.55) 0%, rgba(12,20,12,0.32) 48%, rgba(12,20,12,0.18) 72%, rgba(12,20,12,0.05) 88%, transparent 100%)",
        }}
        aria-hidden="true"
      />
      <RidgeDivider className="absolute bottom-0 left-0 z-[2] text-[var(--color-bg)]" />

      <div className="relative z-10 w-full max-w-3xl mx-auto">
        <div className="rise-in">
          <HomeConcertBanner />
        </div>

        <div className="rise-in">
          <EditableText
            contentKey="home.hero.title"
            defaultValue="8년째, 705번의 외침"
            as="h1"
            page="home"
            section="hero"
            className="font-serif-display font-bold text-4xl sm:text-6xl md:text-7xl tracking-tight leading-[1.16] mb-5 sm:mb-6 [text-shadow:0_2px_28px_rgba(0,0,0,0.55)]"
          />
        </div>

        <div className="rise-in rise-in-1">
          <EditableText
            contentKey="home.hero.subtitle"
            defaultValue="강원도 홍천, 잣나무 숲이 품은 작은 마을 풍천리. 주민들은 8년째 양수발전소 건설에 맞서 삶의 터전과 숲을 지켜오고 있습니다"
            as="p"
            page="home"
            section="hero"
            className="text-balance text-base sm:text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-10 md:mb-12 [text-shadow:0_1px_14px_rgba(0,0,0,0.55)]"
          />
        </div>

        <div className="rise-in rise-in-2 grid w-full max-w-[22rem] grid-cols-3 items-start gap-3 mx-auto mb-8 sm:max-w-2xl sm:gap-6 sm:mb-12 md:mb-14">
          <EditableList
            contentKey="home.hero.counters"
            defaultItems={[
              { target: "7", suffix: "년+", label: "투쟁 기간" },
              { target: "705", suffix: "회+", label: "집회 횟수" },
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
                  <span className="font-serif-display whitespace-nowrap text-2xl sm:text-4xl md:text-5xl font-bold leading-none text-white [text-shadow:0_2px_16px_rgba(0,0,0,0.5)]">
                    <AnimatedCounter target={Number(item.target)} suffix={item.suffix} />
                  </span>
                  <span className="mt-2 text-[11px] leading-tight text-white/70 sm:text-base">
                    {item.label}
                  </span>
                </div>
              ))
            }
          </EditableList>
        </div>

        <div className="rise-in rise-in-3 flex justify-center">
          <button
            type="button"
            onClick={onScrollToStory}
            className="letter-btn letter-btn--outline text-base sm:text-lg"
          >
            <EditableText
              contentKey="home.story.cta"
              defaultValue="이야기 보기 ↓"
              as="span"
              page="home"
              section="hero"
            />
          </button>
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

      <button
        type="button"
        onClick={onScrollToStory}
        aria-label="이야기로 스크롤"
        className="chevron-bounce absolute bottom-8 z-10 hidden p-1.5 sm:block cursor-pointer"
      >
        <ChevronDown className="w-8 h-8 text-white/50" />
      </button>
    </>
  );
}
