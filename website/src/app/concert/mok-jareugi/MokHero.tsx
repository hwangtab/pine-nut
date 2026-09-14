"use client";

import Link from "next/link";
import {
  MOK_DATE_LABEL,
  MOK_PLACE,
  MOK_START,
  MOK_SUBTITLE_LINES,
  MOK_TIME_LABEL,
  MOK_TITLE,
  MOK_TITLE_HANJA,
} from "@/lib/concert";
import { useDday } from "@/lib/use-concert-status";
import { RidgeDivider } from "@/components/visuals/ForestLetterMotifs";
import { PosterGrain, SawEdge } from "./MokMotifs";

/* 대표 포스터(붉은 목)의 색. 이 히어로에서만 쓰는 값이라 전역 팔레트에 올리지 않는다.
   앞선 두 공연과 같은 이유다 — 포스터를 보고 찾아온 사람이 같은 색을 만나야 한다.
   마을 잔치가 연둣빛이었으니 세 공연 페이지가 나란히 놓여도 서로 구분된다.
   먹빛 숲 위 흰 글자는 대비 15:1 이 넘고, 붉은색은 큰 글자·장식에만 쓴다. */
const POSTER_INK = "#0E1A0B";
const POSTER_RED = "#D93A2B";

export default function MokHero() {
  const dday = useDday(MOK_START)?.label ?? null;

  return (
    <section
      className="relative flex min-h-[88svh] flex-col items-center justify-center overflow-hidden px-4 pt-32 pb-24 text-center sm:px-6"
      style={{ backgroundColor: POSTER_INK, color: "#F5F3EC" }}
    >
      {/* 포스터를 가로지르던 붉은 띠. 포스터에서 그랬듯 제목 글자를 가로지르게 둔다.
          부제 높이로 내리면 띠 위에 본문 크기 글자가 얹혀 읽기 어려워지므로,
          큰 글자만 걸치는 높이에 세운다. 색을 안 주면 섹션의 크림색을 물려받아
          띠가 사라지므로 붉은색을 직접 박는다. */}
      <SawEdge
        className="pointer-events-none absolute left-0 top-[30%] z-[1] h-32 w-[130%] -translate-x-[6%] text-[#D93A2B] sm:h-40"
        teeth={2}
      />

      <PosterGrain className="z-[2] opacity-[0.22]" />
      <RidgeDivider className="absolute bottom-0 left-0 z-[3] text-[var(--color-bg)]" />

      <div className="relative z-[4] mx-auto w-full max-w-4xl">
        <div className="rise-in mb-8 flex justify-center">
          <span
            className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-full border px-6 py-2.5 text-sm font-bold sm:text-base"
            style={{ borderColor: "rgba(245,243,236,0.45)" }}
          >
            <span>{MOK_DATE_LABEL}</span>
            <span aria-hidden>·</span>
            <span>{MOK_TIME_LABEL}</span>
            <span aria-hidden>·</span>
            <span>{MOK_PLACE}</span>
          </span>
        </div>

        {/* 대형 타이포만 한자로 쓴다. 그대로 두면 스크린리더가 「나무 자르기」로 읽어
            말장난이 무너지므로 aria-label 로 「목자르기」를 읽히고 글자는 숨긴다. */}
        <h1
          className="rise-in rise-in-1 font-sans text-[3.5rem] font-black leading-[0.95] tracking-tight sm:text-8xl md:text-9xl"
          aria-label={MOK_TITLE}
        >
          <span aria-hidden>{MOK_TITLE_HANJA}</span>
        </h1>

        {/* 포스터에서 두 줄이 어긋나게 놓여 있던 문장. 그 어긋남이 말장난의
            타이밍을 만든다 — 둘째 줄을 오른쪽으로 밀어 그대로 옮겼다. */}
        <p className="rise-in rise-in-2 mx-auto mt-8 max-w-2xl font-serif-display text-lg leading-relaxed break-keep sm:text-2xl">
          <span className="block">{MOK_SUBTITLE_LINES[0]}</span>
          <span className="mt-1 block sm:ml-[3.5em]">{MOK_SUBTITLE_LINES[1]}</span>
        </p>

        <div
          className="rise-in rise-in-3 mt-10 flex items-center justify-center"
          aria-label="공연까지 남은 날"
        >
          <span
            className="rounded-2xl px-8 py-3 text-4xl font-black tracking-tight sm:text-6xl"
            style={{ backgroundColor: POSTER_RED, color: "#FFFFFF" }}
          >
            {dday ?? "10·10"}
          </span>
        </div>

        <div className="rise-in rise-in-3 mx-auto mt-10 flex w-full max-w-xs flex-col items-stretch justify-center gap-3 sm:max-w-none sm:flex-row sm:items-center">
          <a
            href="#lineup"
            className="inline-flex min-h-[52px] items-center justify-center rounded-full px-8 py-3.5 text-base font-bold text-white transition-opacity hover:opacity-85 sm:text-lg"
            style={{ backgroundColor: POSTER_RED }}
          >
            함께하는 음악가 보기
          </a>
          <Link
            href="/petition"
            className="inline-flex min-h-[52px] items-center justify-center rounded-full border-2 px-8 py-3.5 text-base font-bold transition-colors hover:bg-white/10 sm:text-lg"
            style={{ borderColor: "#F5F3EC", color: "#F5F3EC" }}
          >
            서명으로 함께하기
          </Link>
        </div>
      </div>
    </section>
  );
}
