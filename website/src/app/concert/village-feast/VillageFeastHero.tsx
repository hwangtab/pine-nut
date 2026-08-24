"use client";

import Link from "next/link";
import {
  FEAST_DATE_LABEL,
  FEAST_PLACE,
  FEAST_START,
  FEAST_TIME_LABEL,
} from "@/lib/concert";
import { useDday } from "@/lib/use-concert-status";
import { ContourBackground, RidgeDivider } from "@/components/visuals/ForestLetterMotifs";

/* 포스터의 연둣빛과 먹색. 이 히어로에서만 쓰는 값이라 전역 팔레트에 올리지 않는다.
   앞선 「베어지기 전에 풍천리」 히어로가 어두운 잣나무 숲 사진이라, 같은 결의 숲
   사진을 쓰면 두 공연 페이지가 한 화면처럼 보인다. 그래서 잔치는 포스터 자체의
   정체성으로 연다 — 포스터를 보고 찾아온 사람이 같은 색을 만난다.
   먹색 위 연둣빛 대비는 14:1 로 AAA 를 넘는다. */
const POSTER_LIME = "#BFFF64";
const POSTER_INK = "#12200C";

export default function VillageFeastHero() {
  const dday = useDday(FEAST_START)?.label ?? null;

  return (
    <section
      className="relative flex min-h-[88svh] flex-col items-center justify-center overflow-hidden px-4 pt-32 pb-24 text-center sm:px-6"
      style={{ backgroundColor: POSTER_LIME, color: POSTER_INK }}
    >
      <ContourBackground className="opacity-70" />
      <RidgeDivider className="absolute bottom-0 left-0 z-[2] text-[var(--color-bg)]" />

      <div className="relative z-[3] mx-auto w-full max-w-4xl">
        <p className="rise-in mb-6 inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm font-bold sm:text-base">
          <span>{FEAST_DATE_LABEL}</span>
          <span aria-hidden>·</span>
          <span>{FEAST_PLACE}</span>
          <span aria-hidden>·</span>
          <span>{FEAST_TIME_LABEL}</span>
        </p>

        <h1 className="rise-in rise-in-1 font-sans text-5xl font-black leading-[1.05] tracking-tight sm:text-7xl md:text-8xl">
          <span className="block">풍천리</span>
          <span className="mt-2 block">잣나무 마을 잔치</span>
        </h1>

        <p className="rise-in rise-in-2 mx-auto mt-6 max-w-2xl text-balance break-keep text-base font-medium leading-relaxed sm:text-xl">
          이번엔 음악가들이 마을로 내려옵니다. 7년을 싸워온 사람들이 하루쯤은 웃고, 먹고,
          춤추는 날입니다.
        </p>

        <div
          className="rise-in rise-in-3 mt-8 flex items-center justify-center"
          aria-label="잔치까지 남은 날"
        >
          <span
            className="rounded-2xl px-8 py-3 text-4xl font-black tracking-tight sm:text-6xl"
            style={{ backgroundColor: POSTER_INK, color: POSTER_LIME }}
          >
            {dday ?? "9·5"}
          </span>
        </div>

        <div className="rise-in rise-in-3 mx-auto mt-10 flex w-full max-w-xs flex-col items-stretch justify-center gap-3 sm:max-w-none sm:flex-row sm:items-center">
          <a
            href="#lineup"
            className="inline-flex min-h-[52px] items-center justify-center rounded-full px-8 py-3.5 text-base font-bold transition-opacity hover:opacity-85 sm:text-lg"
            style={{ backgroundColor: POSTER_INK, color: POSTER_LIME }}
          >
            함께하는 음악가 보기
          </a>
          <Link
            href="/petition"
            className="inline-flex min-h-[52px] items-center justify-center rounded-full border-2 px-8 py-3.5 text-base font-bold transition-colors hover:bg-black/5 sm:text-lg"
            style={{ borderColor: POSTER_INK, color: POSTER_INK }}
          >
            서명으로 함께하기
          </Link>
        </div>
      </div>
    </section>
  );
}
