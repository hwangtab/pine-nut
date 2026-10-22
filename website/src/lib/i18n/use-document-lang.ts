"use client";

import { useEffect } from "react";
import { chromeLocale } from "@/lib/i18n/chrome";

/**
 * <html lang>을 현재 경로의 언어에 맞춘다.
 *
 * 루트 레이아웃은 정적으로 lang="ko"를 내보낸다 — 경로마다 다르게 내보내려면
 * 요청 헤더를 읽어야 하고, 그 순간 전 페이지가 CDN에서 빠진다. 첫 로드는
 * 루트 레이아웃 <head>의 인라인 스크립트가 페인트 전에 고치고, 그 뒤 클라이언트
 * 내비게이션(한국어↔영문 이동)은 레이아웃이 다시 그려지지 않으므로 여기서 맞춘다.
 */
export function useDocumentLang(pathname: string) {
  useEffect(() => {
    const lang = chromeLocale(pathname);
    if (document.documentElement.lang !== lang) {
      document.documentElement.lang = lang;
    }
  }, [pathname]);
}
