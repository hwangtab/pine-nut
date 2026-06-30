export const BUILDER_PAGES = [
  { id: "home", label: "홈" },
  { id: "story", label: "이야기" },
  { id: "timeline", label: "타임라인" },
  { id: "news", label: "소식" },
  { id: "press", label: "자료실" },
  { id: "petition", label: "서명" },
  { id: "donate", label: "후원" },
  { id: "share", label: "카드뉴스" },
  { id: "gallery", label: "갤러리" },
  { id: "privacy", label: "개인정보처리방침" },
  { id: "en", label: "영문 페이지" },
] as const;

export type BuilderPageId = (typeof BUILDER_PAGES)[number]["id"];

export const EXISTING_PAGE_SECTIONS: Partial<
  Record<BuilderPageId, { id: string; label: string }[]>
> = {
  home: [
    { id: "hero", label: "히어로" },
    { id: "about", label: "마을 소개" },
    { id: "impact", label: "위협" },
    { id: "hope", label: "희망" },
    { id: "quotes", label: "주민 목소리" },
    { id: "cta", label: "행동 요청" },
    { id: "stats", label: "숫자 요약" },
  ],
  story: [
    { id: "hero", label: "히어로" },
    { id: "village", label: "마을 소개" },
    { id: "plant", label: "양수발전소" },
    { id: "reasons", label: "반대 이유" },
    { id: "battle", label: "투쟁 기록" },
    { id: "demands", label: "주민 요구" },
    { id: "video", label: "영상" },
    { id: "location", label: "위치" },
    { id: "cta", label: "행동 요청" },
  ],
  press: [
    { id: "kit", label: "보도 키트" },
    { id: "facts", label: "팩트시트" },
    { id: "contact", label: "연락처" },
    { id: "cite", label: "인용 안내" },
  ],
  gallery: [
    { id: "beauty", label: "아름다움" },
    { id: "struggle", label: "투쟁" },
    { id: "solidarity", label: "연대" },
    { id: "cta", label: "제보 CTA" },
  ],
  en: [
    { id: "story", label: "Story" },
    { id: "numbers", label: "Numbers" },
    { id: "stake", label: "What's at Stake" },
    { id: "help", label: "How You Can Help" },
  ],
};
