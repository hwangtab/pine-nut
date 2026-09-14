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
import { PosterGrain, SawBoundary, StumpFace } from "./MokMotifs";

/* 포스터(붉은 목)의 색. 이 히어로에서만 쓰는 값이라 전역 팔레트에 올리지 않는다.
   앞선 두 공연과 같은 이유다 — 포스터를 보고 찾아온 사람이 같은 색을 만나야 한다.
   마을 잔치가 연둣빛이었으니 세 공연 페이지가 나란히 놓여도 서로 구분된다. */
const INK = "#0B160A"; // 먹빛 숲
const BONE = "#F5F3EC"; // 글자
const RED = "#D93A2B"; // 톱자국

export default function MokHero() {
  const dday = useDday(MOK_START)?.label ?? null;

  return (
    <section
      className="relative flex min-h-[88svh] items-center overflow-hidden pt-28 pb-28 sm:pt-32 sm:pb-32"
      style={{ backgroundColor: INK, color: BONE }}
    >
      {/* 그루터기. 오른쪽 화면 밖으로 잘려나가게 둔다 — 단면 전체를 보여주면
          도표가 되고, 잘려 나가야 '더 큰 것의 일부'로 읽힌다.
          좁은 화면에서는 글 뒤로 들어가므로 톤을 낮춰 본문을 방해하지 않게 한다. */}
      <StumpFace
        className="pointer-events-none absolute right-[-38%] top-[38%] h-[34rem] w-[34rem] -translate-y-1/2 opacity-25 sm:right-[-16%] sm:top-1/2 sm:h-[40rem] sm:w-[40rem] sm:opacity-65 lg:right-[-4%] lg:h-[42rem] lg:w-[42rem] lg:opacity-90"
        split={9}
      />

      {/* 톱자국. 그루터기의 어긋난 지점과 같은 높이를 지나 화면을 끝에서 끝까지 가른다.
          높이 값은 위 StumpFace 와 반드시 함께 움직여야 한다 — 어긋나면 잘린 자리가
          두 곳이 되어 둘 다 뜻을 잃는다. 좁은 화면에서 가운데에 두면 부제를 관통해
          취소선처럼 보이므로, 제목을 가로지르는 높이로 올린다. */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-0 top-[38%] h-[3px] w-full -translate-y-[3px] sm:top-1/2"
        style={{ backgroundColor: RED }}
      />

      <PosterGrain className="opacity-[0.18]" />

      {/* 어둠이 끝나는 자리도 톱자국이다. 이 페이지에서 어둠→밝음 전환은
          전부 '잘린 자리'로 통일한다 — 능선(RidgeDivider)을 쓰면 다른 페이지와
          같은 말이 되어 이 페이지만의 형태 언어가 흐려진다. */}
      <SawBoundary className="absolute bottom-0 left-0 z-[1] h-10 w-full sm:h-14" teeth={5} />

      <div className="relative z-[2] mx-auto w-full max-w-6xl px-6">
        <div className="max-w-xl">
          {/* 날짜는 이 페이지에서 가장 급한 정보다. 알약 안에 가두지 않고
              한 줄로 세워 제목 바로 위에 붙인다. */}
          <p className="rise-in text-sm font-bold tracking-wide sm:text-base">
            {MOK_DATE_LABEL} {MOK_TIME_LABEL}
            <span className="mt-1 block font-normal opacity-70">{MOK_PLACE} · 무료</span>
          </p>

          {/* 대형 타이포만 한자로 쓴다. 그대로 두면 스크린리더가 「나무 자르기」로 읽어
              말장난이 무너지므로 aria-label 로 「목자르기」를 읽히고 글자는 숨긴다. */}
          <h1
            className="rise-in rise-in-1 mt-6 font-sans text-[4.25rem] font-black leading-[0.9] tracking-[-0.04em] sm:text-8xl lg:text-[8.5rem]"
            aria-label={MOK_TITLE}
          >
            <span aria-hidden>{MOK_TITLE_HANJA}</span>
          </h1>

          {/* 포스터에서 두 줄이 어긋나게 놓여 있던 문장. 그 어긋남이 말장난의
              타이밍을 만든다 — 둘째 줄을 밀어 그대로 옮겼다. */}
          <p className="rise-in rise-in-2 mt-7 font-serif-display text-lg leading-relaxed break-keep sm:text-2xl">
            <span className="block">{MOK_SUBTITLE_LINES[0]}</span>
            <span className="mt-1 block pl-[2.5em]">{MOK_SUBTITLE_LINES[1]}</span>
          </p>

          <div className="rise-in rise-in-3 mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
            <a
              href="#lineup"
              className="inline-flex min-h-[52px] items-center rounded-full px-7 py-3.5 text-base font-bold text-white transition-opacity hover:opacity-85"
              style={{ backgroundColor: RED }}
            >
              함께하는 음악가 7팀
            </a>
            <Link
              href="/petition"
              className="inline-flex min-h-[52px] items-center border-b-2 px-1 text-base font-bold transition-opacity hover:opacity-70"
              style={{ borderColor: BONE }}
            >
              서명으로 함께하기
            </Link>
          </div>

          {/* D-day 를 붉은 덩어리로 키우면 제목과 싸운다. 톱자국과 같은 색의
              숫자 한 줄로 낮춰, 급한 정보이되 주인공은 아니게 둔다. */}
          {dday ? (
            <p className="rise-in rise-in-3 mt-8 text-sm font-bold tracking-wide">
              <span style={{ color: RED }}>{dday}</span>
              <span className="opacity-70"> · 아직 서 있는 나무 앞에서</span>
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
