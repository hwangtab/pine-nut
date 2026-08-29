"use client";

import { useEffect, useRef, useState } from "react";
import { fetchSignatureSummary, fetchSignatureWall } from "@/lib/signatures/client";

const MAX_TOASTS = 5;
const INITIAL_DELAY_MS = 5000;
const TOAST_INTERVAL_MS = 8000;
const TOAST_DISPLAY_MS = 4000;

export function useHomeSignatureActivity() {
  const [signatureCount, setSignatureCount] = useState<number | null>(null);
  // 토스트가 돌려쓰는 이름 풀. 출처는 명단 벽과 동일한 `/api/signatures/wall`
  // 첫 페이지다 — 그 엔드포인트는 `.eq("name_public", true)`로 이름 공개에
  // 동의한 서명자만 돌려주므로, 예전의 마스킹(maskName) 방식보다 오히려
  // 안전하다. 여기서는 이름 외의 필드(지역·날짜)를 쓰지 않으므로 문자열
  // 배열로만 담아, 나중에 다른 필드가 실수로 홈 화면에 새어 나갈 여지를 없앤다.
  const [recentNames, setRecentNames] = useState<string[]>([]);
  const [toastName, setToastName] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const toastCountRef = useRef(0);

  useEffect(() => {
    fetchSignatureSummary()
      .then((data) => {
        setSignatureCount(data.count);
      })
      .catch(() => {
        /* graceful degradation: hide signature count and social proof */
      });
  }, []);

  useEffect(() => {
    fetchSignatureWall()
      .then((page) => {
        setRecentNames(page.entries.map((entry) => entry.name));
      })
      .catch(() => {
        /* graceful degradation: no social-proof toast */
      });
  }, []);

  useEffect(() => {
    if (recentNames.length === 0) return;

    const showToast = () => {
      if (toastCountRef.current >= MAX_TOASTS) return;
      setToastName(recentNames[Math.floor(Math.random() * recentNames.length)]);
      setToastVisible(true);
      toastCountRef.current += 1;

      setTimeout(() => {
        setToastVisible(false);
      }, TOAST_DISPLAY_MS);
    };

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const initialTimer = setTimeout(() => {
      showToast();
      intervalId = setInterval(() => {
        if (toastCountRef.current >= MAX_TOASTS) {
          if (intervalId) clearInterval(intervalId);
          return;
        }
        showToast();
      }, TOAST_INTERVAL_MS);
    }, INITIAL_DELAY_MS);

    return () => {
      clearTimeout(initialTimer);
      if (intervalId) clearInterval(intervalId);
    };
  }, [recentNames]);

  return {
    signatureCount,
    setSignatureCount,
    toastName,
    toastVisible,
  };
}
