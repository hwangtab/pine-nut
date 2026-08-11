import type { Metadata } from "next";

/**
 * 페이지별 canonical + 한/영 hreflang 선언을 만든다.
 *
 * 루트 layout에 alternates를 두면 Next의 메타데이터 병합 규칙상 하위 페이지가
 * 그 값을 그대로 상속해, 모든 페이지가 canonical=홈을 내보낸다(검색엔진이 전부
 * 홈의 중복으로 판단). 그래서 각 페이지가 자기 경로를 직접 선언해야 한다.
 *
 * metadataBase가 루트에 있으므로 상대경로로 충분하다.
 *
 * @param koPath 한국어 경로 ("/story", "/" 등)
 * @param enPath 대응하는 영문 경로. 영문판이 없으면 생략한다.
 */
export function localeAlternates(koPath: string, enPath?: string): Metadata["alternates"] {
  const languages: Record<string, string> = { ko: koPath };
  if (enPath) languages.en = enPath;

  return {
    canonical: koPath,
    languages,
  };
}

/** 영문 페이지용. canonical은 영문 경로, 대체 언어로 한국어를 가리킨다. */
export function englishAlternates(enPath: string, koPath?: string): Metadata["alternates"] {
  const languages: Record<string, string> = { en: enPath };
  if (koPath) languages.ko = koPath;

  return {
    canonical: enPath,
    languages,
  };
}
