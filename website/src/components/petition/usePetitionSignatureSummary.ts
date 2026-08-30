"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchSignatureSummary, type FetchOptions } from "@/lib/signatures/client";
import type { SignatureSummary } from "@/lib/signatures/api/store";

const EMPTY_SUMMARY: SignatureSummary = { count: 0, regionCount: 0, recent24h: 0, goal: 0 };

// GET /api/signatures 요약만 다룬다. 개별 서명 목록(공개 동의자 명단)은
// /api/signatures/wall 전용 엔드포인트로 분리되어 SignatureWall이 직접
// fetchSignatureWall로 불러온다 — 이 훅은 더 이상 목록을 들고 있지 않는다.
export function usePetitionSignatureSummary() {
  const [summary, setSummary] = useState<SignatureSummary>(EMPTY_SUMMARY);
  const [loadingSummary, setLoadingSummary] = useState(true);
  // 조회 실패와 "정말 0명"을 화면이 구별할 수 있게 하는 유일한 통로.
  // 이게 없으면 EMPTY_SUMMARY의 0이 실제 집계처럼 렌더되고, 최악의 경우
  // 방금 서명한 시민에게 "0번째로 함께해주셨습니다"가 나간다.
  const [summaryError, setSummaryError] = useState(false);

  // 의도적으로 예외를 다시 던지지 않고 정상 resolve 한다 — 호출부 중 하나인
  // 폼 훅의 `onRefreshSignatures: () => void`가 반환값을 기다리지 않는
  // fire-and-forget이기 때문이다. 실패 사실은 던지는 대신 summaryError로
  // 내보내고, 화면은 그 값을 보고 "모름"을 표현한다.
  const refreshSummary = useCallback(async (options?: FetchOptions) => {
    try {
      const data = await fetchSignatureSummary(options);
      setSummary(data);
      setSummaryError(false);
    } catch (err) {
      // 문구는 check-production-fail-closed.mjs가 리터럴로 단언한다 — 바꾸지 말 것.
      console.error("Failed to fetch signatures:", err);
      setSummaryError(true);
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  useEffect(() => {
    refreshSummary();
  }, [refreshSummary]);

  return { summary, loadingSummary, summaryError, refreshSummary };
}
