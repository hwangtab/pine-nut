"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchSignatureSummary } from "@/lib/signatures/client";
import type { SignatureSummary } from "@/lib/signatures/api/store";

const EMPTY_SUMMARY: SignatureSummary = { count: 0, regionCount: 0, recent24h: 0, goal: 0 };

// GET /api/signatures 요약만 다룬다. 개별 서명 목록(공개 동의자 명단)은
// /api/signatures/wall 전용 엔드포인트로 분리되어 SignatureWall이 직접
// fetchSignatureWall로 불러온다 — 이 훅은 더 이상 목록을 들고 있지 않는다.
export function usePetitionSignatureSummary() {
  const [summary, setSummary] = useState<SignatureSummary>(EMPTY_SUMMARY);
  const [loadingSummary, setLoadingSummary] = useState(true);

  const refreshSummary = useCallback(async () => {
    try {
      const data = await fetchSignatureSummary();
      setSummary(data);
    } catch (err) {
      // 문구는 check-production-fail-closed.mjs가 리터럴로 단언한다 — 바꾸지 말 것.
      console.error("Failed to fetch signatures:", err);
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  useEffect(() => {
    refreshSummary();
  }, [refreshSummary]);

  return { summary, loadingSummary, refreshSummary };
}
