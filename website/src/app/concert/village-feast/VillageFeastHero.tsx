"use client";

import Link from "next/link";
import {
  FEAST_DATE_LABEL,
  FEAST_PLACE,
  FEAST_START,
  FEAST_TIME_LABEL,
} from "@/lib/concert";
import { useDday } from "@/lib/use-concert-status";
import { RidgeDivider } from "@/components/visuals/ForestLetterMotifs";
import { PosterFlower, PosterGrain, TornStrip } from "./VillageFeastMotifs";

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
      {/* 포스터의 꽃 — 연한 잎 위에 먹색 꽃이 겹친 2겹 구조를 그대로 옮겼다.
          좁은 폭에서는 제목이 화면을 꽉 채우므로 꽃을 글자 밖(위·아래 모서리)으로 뺀다.
          가운데에 두면 「잣나무」를 덮는다. */}
      <PosterFlower
        className="pointer-events-none absolute -left-28 -top-16 h-72 w-72 text-[#8FD94A] opacity-90 sm:-left-16 sm:top-[14%] sm:h-[34rem] sm:w-[34rem]"
        petals={7}
        rotate={-8}
      />
      <PosterFlower
        className="pointer-events-none absolute -left-6 bottom-6 h-32 w-32 text-[#12200C] opacity-90 sm:bottom-auto sm:left-24 sm:top-[30%] sm:h-56 sm:w-56"
        petals={9}
        rotate={14}
      />
      <PosterFlower
        className="pointer-events-none absolute -right-28 bottom-[18%] hidden h-[22rem] w-[22rem] text-[#A8E85C] opacity-80 lg:block"
        petals={8}
        rotate={22}
      />

      <PosterGrain className="z-[1] opacity-[0.38]" />
      <RidgeDivider className="absolute bottom-0 left-0 z-[2] text-[var(--color-bg)]" />

      <div className="relative z-[3] mx-auto w-full max-w-4xl">
        <div className="rise-in mb-8 flex justify-center">
          <span className="relative inline-block px-8 py-3">
            <TornStrip className="absolute inset-0 h-full w-full text-[#F3EEDF]" />
            <span className="relative inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm font-bold sm:text-base">
              <span>{FEAST_DATE_LABEL}</span>
              <span aria-hidden>·</span>
              <span>{FEAST_PLACE}</span>
              <span aria-hidden>·</span>
              <span>{FEAST_TIME_LABEL}</span>
            </span>
          </span>
        </div>

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
