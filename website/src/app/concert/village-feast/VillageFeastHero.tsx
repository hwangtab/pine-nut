"use client";

import Image from "next/image";
import Link from "next/link";
import {
  FEAST_DATE_LABEL,
  FEAST_PLACE,
  FEAST_START,
  FEAST_TIME_LABEL,
} from "@/lib/concert";
import { useDday } from "@/lib/use-concert-status";
import { RidgeDivider } from "@/components/visuals/ForestLetterMotifs";

// 포스터의 연둣빛. 잔치 페이지에서만 쓰는 강조색이라 전역 팔레트에 올리지 않는다.
const POSTER_LIME = "#BFFF64";

export default function VillageFeastHero() {
  const dday = useDday(FEAST_START)?.label ?? null;

  return (
    <section className="relative flex min-h-[88svh] flex-col items-center justify-center overflow-hidden px-4 pt-28 pb-20 text-center text-white sm:px-6">
      <Image
        src="/images/concert/real-canopy.jpg"
        alt="풍천리 잣나무 숲을 아래에서 올려다본 실제 모습"
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 object-cover"
      />
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(180deg, rgba(12,20,12,0.66) 0%, rgba(12,20,12,0.42) 55%, rgba(12,20,12,0.28) 100%)",
        }}
        aria-hidden="true"
      />
      <RidgeDivider className="absolute bottom-0 left-0 z-[2] text-[var(--color-bg)]" />

      <div className="relative z-[3] mx-auto w-full max-w-4xl">
        <p className="rise-in mb-6 inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm font-semibold text-white/90 [text-shadow:0_1px_12px_rgba(0,0,0,0.6)] sm:text-base">
          <span>{FEAST_DATE_LABEL}</span>
          <span aria-hidden>·</span>
          <span>{FEAST_PLACE}</span>
          <span aria-hidden>·</span>
          <span>{FEAST_TIME_LABEL}</span>
        </p>

        <h1 className="rise-in rise-in-1 font-sans text-5xl font-black leading-[1.05] tracking-tight sm:text-7xl md:text-8xl">
          <span className="block" style={{ color: POSTER_LIME }}>
            풍천리
          </span>
          <span className="mt-2 block text-white">좋은 마을 잔치</span>
        </h1>

        <p className="rise-in rise-in-2 mx-auto mt-6 max-w-2xl text-balance break-keep text-base leading-relaxed text-white/85 sm:text-xl">
          이번엔 음악가들이 마을로 내려옵니다. 7년을 싸워온 사람들이 하루쯤은 웃고, 먹고,
          춤추는 날입니다.
        </p>

        <div
          className="rise-in rise-in-3 mt-8 flex items-center justify-center"
          aria-label="잔치까지 남은 날"
        >
          <span
            className="rounded-2xl border-2 bg-black/40 px-8 py-3 text-4xl font-black tracking-tight sm:text-6xl"
            style={{ color: POSTER_LIME, borderColor: "rgba(191,255,100,0.6)" }}
          >
            {dday ?? "9·5"}
          </span>
        </div>

        <div className="rise-in rise-in-3 mx-auto mt-10 flex w-full max-w-xs flex-col items-stretch justify-center gap-3 sm:max-w-none sm:flex-row sm:items-center">
          <a
            href="#lineup"
            className="inline-flex min-h-[52px] items-center justify-center rounded-full px-8 py-3.5 text-base font-bold text-[#12200C] transition-opacity hover:opacity-85 sm:text-lg"
            style={{ backgroundColor: POSTER_LIME }}
          >
            함께하는 음악가 보기
          </a>
          <Link
            href="/petition"
            className="inline-flex min-h-[52px] items-center justify-center rounded-full border-2 border-white/60 px-8 py-3.5 text-base font-bold text-white transition-colors hover:bg-white/10 sm:text-lg"
          >
            서명으로 함께하기
          </Link>
        </div>
      </div>
    </section>
  );
}
