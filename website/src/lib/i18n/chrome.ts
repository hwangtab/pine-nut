/**
 * 공개 화면 공통 크롬(내비·푸터)의 한/영 문구.
 *
 * 영문 구간(/en/*)에서도 내비·푸터는 같은 컴포넌트를 쓴다. 문구를 여기 한곳에
 * 모아두지 않으면 영문 페이지 본문만 영어이고 헤더·푸터는 한국어인 채로 남는다
 * (실제로 그랬다 — 로고는 "/"로, CTA "연대서명"은 한국어 폼으로 보냈다).
 *
 * 한국어 쪽은 관리자 인라인 편집(Editable*) 값이 우선하고, 여기 값은 기본값이다.
 * 영문 쪽은 편집 키를 공유하지 않는다 — 한국어로 편집된 값이 영문 화면에
 * 새어 나오지 않게 하려는 것이다.
 */

export type ChromeLocale = "ko" | "en";

export function isEnglishPath(pathname: string): boolean {
  return pathname === "/en" || pathname.startsWith("/en/");
}

export function chromeLocale(pathname: string): ChromeLocale {
  return isEnglishPath(pathname) ? "en" : "ko";
}

export const NAV_COPY = {
  ko: {
    navLabel: "주요 내비게이션",
    mobileNavLabel: "모바일 내비게이션",
    mobileMenuTitle: "모바일 메뉴",
    openMenu: "메뉴 열기",
    closeMenu: "메뉴 닫기",
    logo: "풍천리를 지켜주세요",
    logoHref: "/",
    cta: "연대서명",
    ctaHref: "/petition",
    donate: "후원하기",
    donateHref: "/donate",
  },
  en: {
    navLabel: "Main navigation",
    mobileNavLabel: "Mobile navigation",
    mobileMenuTitle: "Mobile menu",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    logo: "Save Pungcheon-ri",
    logoHref: "/en",
    cta: "Sign the petition",
    ctaHref: "/en/petition",
    donate: "Donate",
    donateHref: "/en/donate",
  },
} as const satisfies Record<ChromeLocale, Record<string, string>>;

export const FOOTER_COPY = {
  ko: {
    brandName: "풍천리를 지켜주세요",
    brandHref: "/",
    brandDescription:
      "풍천리양수발전소건설반대위원회는 마을과 자연을 지키기 위해 양수발전소 건설에 반대하는 주민들의 모임입니다.",
    quickLinksTitle: "바로가기",
    contactTitle: "연락처",
    phoneLabel: "전화 문의",
    phone: "010-8918-8933 (이창후 총무)",
    bankLabel: "후원 계좌",
    bankAccount: "농협 356-1559-4666-63 이창후",
    campaignLabel: "캠페인 페이지",
    campaignLink: "빠띠 캠페인 페이지 바로가기",
    copyrightHolder: "풍천리 주민회",
    privacy: "개인정보처리방침",
    privacyHref: "/privacy",
    campaign: "빠띠 캠페인",
    otherLanguage: "English",
    otherLanguageHref: "/en",
    close: "닫기",
    privacyFullPolicy: "전문 보기",
  },
  en: {
    brandName: "Save Pungcheon-ri",
    brandHref: "/en",
    brandDescription:
      "The Pungcheon-ri Pumped-Storage Opposition Committee is a group of residents opposing the construction of a pumped-storage power plant to protect their village and its forest.",
    quickLinksTitle: "Quick links",
    contactTitle: "Contact",
    phoneLabel: "Phone (Korean)",
    phone: "+82 10-8918-8933 (Lee Chang-hoo, campaign coordinator)",
    bankLabel: "Donation account",
    bankAccount: "NongHyup Bank 356-1559-4666-63 (Lee Chang-hoo)",
    campaignLabel: "Campaign page",
    campaignLink: "Campaign page on Parti (Korean)",
    copyrightHolder: "Pungcheon-ri Residents' Association",
    privacy: "Privacy Policy",
    privacyHref: "/en/privacy",
    campaign: "Parti campaign",
    otherLanguage: "한국어",
    otherLanguageHref: "/",
    close: "Close",
    privacyFullPolicy: "Read the full policy",
  },
} as const satisfies Record<ChromeLocale, Record<string, string>>;

/**
 * 푸터 개인정보 요약. /privacy(·/en/privacy) 전문과 같은 내용이어야 한다 —
 * 예전 요약은 "이름, 이메일 / 캠페인 종료 후 즉시 파기"라 전문(이름·지역·소속·
 * 이메일·제안 한마디, 목적 달성 후 지체 없이 파기)과 어긋났다.
 */
export const FOOTER_PRIVACY_ITEMS = {
  ko: [
    {
      label: "수집 항목",
      value:
        "이름 또는 닉네임·거주 지역(필수), 소속 단체·이메일·제안 한마디(선택), 이름 공개 동의 여부",
    },
    { label: "수집 목적", value: "연대서명 접수·집계, 성명서 발표 및 공론화 활동, 진행 상황 안내" },
    {
      label: "보유 기간",
      value: "연대서명 및 관련 공론화 활동의 목적 달성 후 지체 없이 파기 (삭제 요청 시 7일 이내)",
    },
  ],
  en: [
    {
      label: "Data collected",
      value:
        "Name or nickname and region (required); affiliation, email, and a message (optional); consent to publish your name",
    },
    {
      label: "Purpose",
      value: "Receiving and counting signatures, public advocacy, and campaign updates",
    },
    {
      label: "Retention",
      value:
        "Deleted without delay once the petition and related advocacy have achieved their purpose (within 7 days of a deletion request)",
    },
  ],
} satisfies Record<ChromeLocale, { label: string; value: string }[]>;

export const FOOTER_PRIVACY_NOTICE = {
  ko: "동의를 거부할 수 있으며, 거부 시 서명 참여가 제한됩니다.",
  en: "You may decline consent, but you will not be able to sign the petition without it.",
} as const satisfies Record<ChromeLocale, string>;
