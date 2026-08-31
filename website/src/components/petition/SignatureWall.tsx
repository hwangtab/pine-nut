"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { fetchSignatureWall, type FetchOptions } from "@/lib/signatures/client";
import type { WallEntry } from "@/lib/signatures/api/wall";

export interface SignatureWallProps {
  heading: string;
  emptyText: string;
  moreText: string;
  /** 값이 바뀌면 1페이지째부터 다시 불러온다. 서명 제출 직후 갱신용. */
  refreshToken?: number;
}

const WALL_ERROR_TEXT = "명단을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.";
const WALL_RETRY_TEXT = "다시 시도";
const WALL_LOAD_MORE_ERROR_TEXT = "추가 명단을 불러오지 못했습니다. 다시 시도해주세요.";

function formatWallDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export default function SignatureWall({ heading, emptyText, moreText, refreshToken = 0 }: SignatureWallProps) {
  const [entries, setEntries] = useState<WallEntry[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [initialError, setInitialError] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const [liveMessage, setLiveMessage] = useState("");

  // 중복 방지: 이 컴포넌트는 두 종류의 경쟁을 마주한다.
  //   1) "더 보기" 연타 — handleLoadMore가 짧은 시간에 두 번 불릴 수 있다.
  //      loadingMore state로 막지만, state는 다음 렌더에야 반영되므로 그
  //      사이에 들어오는 두 번째 호출까지 막으려면 동기적으로 즉시 갱신되는
  //      ref가 하나 더 필요하다.
  //   2) refreshToken이 로딩 도중 바뀌는 경우 — 서명 제출 직후 refreshToken이
  //      바뀌어 loadFirstPage가 다시 시작되는데, 그 시점에 이전 "더 보기"
  //      요청이 아직 진행 중이었다면 그 응답이 나중에 도착해 새로 불러온
  //      1페이지 뒤에 옛 페이지가 잘못 붙어버릴 수 있다. 매 로드 시작마다
  //      세대(generation) 번호를 올리고, 응답이 돌아왔을 때 자신이 시작될
  //      때의 세대와 현재 세대가 같은지 확인해 다르면(그사이 새 로드가
  //      시작됐으면) 응답을 조용히 버린다.
  const generationRef = useRef(0);
  const loadMoreInFlightRef = useRef(false);

  const loadFirstPage = useCallback(async (options?: FetchOptions) => {
    const generation = ++generationRef.current;
    setInitialLoading(true);
    setInitialError(false);
    try {
      const page = await fetchSignatureWall(null, options);
      if (generation !== generationRef.current) return; // stale — 그사이 새 로드가 시작됨
      setEntries(page.entries);
      setCursor(page.nextCursor);
      setHasMore(page.nextCursor !== null);
      setLiveMessage(`총 ${page.entries.length}건의 서명이 표시되고 있습니다.`);
    } catch (err) {
      console.error("Failed to fetch signature wall:", err);
      if (generation !== generationRef.current) return;
      setInitialError(true);
    } finally {
      // NOTE(리뷰 라운드3 — 비대칭 규칙): loadFirstPage는 자기 자신과 겹칠 수
      // 있다(React Strict Mode의 개발 모드 이펙트 이중 호출, 또는 refreshToken이
      // 한 왕복 안에 두 번 바뀌는 경우) — handleLoadMore와 달리 동기 in-flight
      // ref로 자기 중복 실행을 막고 있지 않기 때문이다. A(gen N)와 B(gen N+1)가
      // 겹쳤을 때 A가 먼저 끝나면, generation 게이트 없이 무조건
      // setInitialLoading(false)를 부르면 그 순간 entries는 아직 []이고
      // initialError도 false라 화면이 "아직 서명이 없습니다"로 잠깐 떨어진다
      // (B가 끝나면 채워지지만, 시민이 처음 보는 게 "아무도 서명 안 함"이 될 수
      // 있다). 그래서 여기서만 generation 게이트를 유지한다 — A가 리셋을
      // 건너뛰어도 B가 끝나며 결국 리셋하므로 고착이 생기지 않는다.
      if (generation === generationRef.current) setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    // 최초 로드는 엣지 캐시를 그대로 쓴다. refreshToken이 0보다 크면 방금
    // 서명이 접수됐다는 뜻이라, 그때만 캐시를 우회해 본인 이름이 바로
    // 보이게 한다 — 60초 캐시가 "내 이름이 없다"로 보이면 안 된다.
    loadFirstPage({ fresh: refreshToken > 0 });
  }, [loadFirstPage, refreshToken]);

  const handleLoadMore = useCallback(async () => {
    if (!cursor || loadingMore || loadMoreInFlightRef.current) return;
    loadMoreInFlightRef.current = true;
    const generation = generationRef.current;
    setLoadingMore(true);
    setLoadMoreError(false);
    try {
      const page = await fetchSignatureWall(cursor);
      if (generation !== generationRef.current) return; // stale — 그사이 refreshToken이 바뀌어 1페이지째부터 다시 불러옴
      setEntries((current) => [...current, ...page.entries]);
      setCursor(page.nextCursor);
      setHasMore(page.nextCursor !== null);
      setLiveMessage(`${page.entries.length}건이 추가로 표시되었습니다.`);
    } catch (err) {
      console.error("Failed to fetch more signatures:", err);
      if (generation !== generationRef.current) return;
      setLoadMoreError(true);
    } finally {
      // NOTE(리뷰 라운드3 — 비대칭 규칙, loadFirstPage와 반대): handleLoadMore는
      // 자기 자신과 절대 겹치지 않는다 — 함수 맨 위 `loadMoreInFlightRef.current`
      // 동기 체크가 두 번째 호출을 즉시 막고, generation은 handleLoadMore 자신이
      // 아니라 loadFirstPage만 올린다. 그러므로 여기서 generation이 바뀌어
      // stale 응답을 폐기하는 시점에는 다른 load-more가 진행 중일 수 없다 —
      // 로딩 상태 리셋을 generation으로 게이트할 이유가 없고, 게이트하면 오히려
      // refreshToken이 로딩 도중 바뀔 때마다 "더 보기" 버튼이 disabled+
      // aria-busy 상태로 영구히 잠겨 다음 페이지를 영영 못 보게 되는 결함이
      // 생긴다(라운드2에서 실제로 이 버그였다). 그래서 여기서는 무조건 리셋한다.
      loadMoreInFlightRef.current = false;
      setLoadingMore(false);
    }
  }, [cursor, loadingMore]);

  return (
    <section className="w-full" aria-label={heading}>
      <h2 className="text-left font-serif-display font-bold text-xl sm:text-2xl mb-6 text-[var(--color-text)]">
        {heading}
      </h2>

      {/* 항목이 추가될 때마다 전체 목록을 읽어주면 노년 사용자에게 소음이
          된다 — 요약 문장 하나만 담은 별도 라이브 리전으로 갱신을 알린다. */}
      <div aria-live="polite" className="sr-only">
        {liveMessage}
      </div>

      {initialLoading ? (
        <div className="flex items-center justify-center py-12 text-[var(--color-text-muted)]" aria-live="polite">
          <Loader2 className="w-5 h-5 animate-spin mr-2" aria-hidden="true" />
          <span className="sr-only">불러오는 중</span>
        </div>
      ) : initialError ? (
        <div className="text-center py-8 space-y-3" role="alert">
          <p className="text-[var(--color-text-muted)]">{WALL_ERROR_TEXT}</p>
          <button
            type="button"
            onClick={() => void loadFirstPage()}
            className="letter-btn letter-btn--outline-light"
          >
            {WALL_RETRY_TEXT}
          </button>
        </div>
      ) : entries.length === 0 ? (
        <p className="text-center py-8 text-[var(--color-text-muted)]">{emptyText}</p>
      ) : (
        <>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {entries.map((entry, index) => (
              <li
                key={`${entry.name}-${entry.regionTop}-${entry.regionSub}-${entry.createdAt}-${index}`}
                className={`paper px-5 py-4 ${index % 2 === 0 ? "paper-tilt-l" : "paper-tilt-r"}`}
              >
                <div className="relative z-[1] flex items-start justify-between gap-3">
                  {/* flex 자식의 기본 min-width는 auto라 내용의 min-content 폭 아래로
                      줄지 않는다. 이름/닉네임은 최대 50자, 해외 지역은 자유입력 40자까지
                      들어오므로 공백 없는 문자열이면 항목이 뷰포트를 밀어내 가로 스크롤이
                      생긴다(320px에서 127px 초과 실측). 줄바꿈 자체는 body의 전역
                      overflow-wrap: break-word가 이미 처리하므로 min-w-0로 폭 제약만
                      풀어주면 된다 — break-word는 min-content 폭을 줄이지 못해서
                      min-width: auto가 남아 있는 한 무력했던 것이다. */}
                  <span className="font-semibold text-[var(--color-text)] min-w-0">{entry.name}</span>
                  <span className="text-sm text-[var(--color-text-muted)] text-right min-w-0">
                    {entry.regionTop} {entry.regionSub}
                    <br />
                    <time dateTime={entry.createdAt}>{formatWallDate(entry.createdAt)}</time>
                  </span>
                </div>
                {/* 제안 한마디는 선택 입력이라 대부분의 항목에는 없다. 있는 항목만
                    이름 줄 아래에 인용으로 덧붙인다 — 빈 blockquote가 남으면 카드
                    높이만 들쭉날쭉해진다. API가 공백뿐인 값을 이미 null로 접어
                    보내므로 여기서는 존재 여부만 본다. */}
                {entry.message && (
                  <blockquote className="relative z-[1] mt-3 border-l-2 border-[var(--color-forest)]/25 pl-3 text-[15px] leading-relaxed text-[var(--color-text-muted)]">
                    {entry.message}
                  </blockquote>
                )}
              </li>
            ))}
          </ul>

          {loadMoreError && (
            <p className="text-center mt-4 text-sm text-[var(--color-text-muted)]" role="alert">
              {WALL_LOAD_MORE_ERROR_TEXT}
            </p>
          )}

          {hasMore && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
                aria-busy={loadingMore}
                className="letter-btn letter-btn--outline-light disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loadingMore && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
                {moreText}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
