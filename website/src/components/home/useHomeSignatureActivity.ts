"use client";

import { useEffect, useRef, useState } from "react";
import { fetchSignatureSummary, fetchSignatureWall } from "@/lib/signatures/client";

const MAX_TOASTS = 5;
const INITIAL_DELAY_MS = 5000;
const TOAST_INTERVAL_MS = 8000;
const TOAST_DISPLAY_MS = 4000;

// 토스트 앞머리 시각 — 서명의 실제 createdAt 기준. "방금"은 5분 이내에만 쓴다
// (명단 첫 페이지는 몇 시간 전 서명일 수 있어 일괄 "방금"은 사실과 다르다).
export function formatSignedAgo(createdAt: string, now: number): string | null {
  const signedAt = Date.parse(createdAt);
  if (Number.isNaN(signedAt)) return null;
  const minutes = Math.floor(Math.max(0, now - signedAt) / 60_000);
  if (minutes < 5) return "방금";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

interface RecentSigner {
  name: string;
  createdAt: string;
}

export interface SignatureToast {
  name: string;
  /** "방금" · "12분 전" · "3시간 전" · "2일 전" */
  ago: string;
}

export function useHomeSignatureActivity() {
  const [signatureCount, setSignatureCount] = useState<number | null>(null);
  // 토스트가 돌려쓰는 서명자 풀. 출처는 명단 벽과 동일한 `/api/signatures/wall`
  // 첫 페이지다 — 그 엔드포인트는 `.eq("name_public", true)`로 이름 공개에
  // 동의한 서명자만 돌려주므로, 예전의 마스킹(maskName) 방식보다 오히려
  // 안전하다. 이름과 서명 시각(상대 시간 표기용)만 담는다 — 지역·한마디 등
  // 다른 필드가 실수로 홈 화면에 새어 나갈 여지를 없앤다.
  const [recentSigners, setRecentSigners] = useState<RecentSigner[]>([]);
  const [toast, setToast] = useState<SignatureToast | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const toastCountRef = useRef(0);
  const lastNameRef = useRef<string | null>(null);

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
        setRecentSigners(
          page.entries.map((entry) => ({ name: entry.name, createdAt: entry.createdAt })),
        );
      })
      .catch(() => {
        /* graceful degradation: no social-proof toast */
      });
  }, []);

  useEffect(() => {
    if (recentSigners.length === 0) return;
    let hideTimer: ReturnType<typeof setTimeout> | null = null;

    const showToast = () => {
      if (toastCountRef.current >= MAX_TOASTS) return;
      // 같은 이름이 연달아 뜨지 않게 직전 이름은 후보에서 뺀다(후보가 하나뿐이면 그대로).
      const others = recentSigners.filter((signer) => signer.name !== lastNameRef.current);
      const pool = others.length > 0 ? others : recentSigners;
      const signer = pool[Math.floor(Math.random() * pool.length)];
      const ago = formatSignedAgo(signer.createdAt, Date.now());
      if (!ago) return;
      lastNameRef.current = signer.name;
      setToast({ name: signer.name, ago });
      setToastVisible(true);
      toastCountRef.current += 1;

      hideTimer = setTimeout(() => {
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
      if (hideTimer) clearTimeout(hideTimer);
      if (intervalId) clearInterval(intervalId);
    };
  }, [recentSigners]);

  return {
    signatureCount,
    setSignatureCount,
    toast,
    toastVisible,
  };
}
