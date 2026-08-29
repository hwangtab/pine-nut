"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { fetchSignatureWall } from "@/lib/signatures/client";
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

  const loadFirstPage = useCallback(async () => {
    const generation = ++generationRef.current;
    setInitialLoading(true);
    setInitialError(false);
    try {
      const page = await fetchSignatureWall(null);
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
      // generation 게이트는 "쓰기"(entries/cursor/hasMore/error)에만 걸어야 한다.
      // 로딩 플래그 리셋까지 게이트에 가두면, stale 응답이 폐기되는 순간(위의
      // 조기 return들) finally 안의 이 줄도 함께 건너뛰어 initialLoading이
      // true로 영원히 굳는다 — 화면은 로딩 스피너에서 멈추고 복구 경로가 없다.
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFirstPage();
    // refreshToken 이 바뀌면(= 서명 제출 성공) 1페이지째부터 다시 불러온다.
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
      // 위 loadFirstPage와 같은 이유: generation이 바뀌어 stale 응답의 데이터를
      // 버리더라도(위의 조기 return들), 로딩 상태 리셋(loadMoreInFlightRef·
      // loadingMore)은 반드시 실행돼야 한다. 그렇지 않으면 refreshToken이 로딩
      // 도중 바뀔 때마다 "더 보기" 버튼이 disabled+aria-busy 상태로 영구히
      // 잠기고, 새로 불러온 1페이지에서 다음 페이지를 영영 못 보게 된다.
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
            onClick={loadFirstPage}
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
                <div className="relative z-[1] flex items-center justify-between gap-3">
                  <span className="font-semibold text-[var(--color-text)]">{entry.name}</span>
                  <span className="text-sm text-[var(--color-text-muted)] text-right">
                    {entry.regionTop} {entry.regionSub}
                    <br />
                    <time dateTime={entry.createdAt}>{formatWallDate(entry.createdAt)}</time>
                  </span>
                </div>
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
