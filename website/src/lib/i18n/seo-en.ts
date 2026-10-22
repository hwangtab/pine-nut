import { OG_SITE_EN } from "@/lib/seo-alternates";

/**
 * 영문 구간 공유 카드 공통값.
 *
 * OG_SITE_EN 은 siteName 이 한국어 사이트명(SITE_NAME)이라, 그대로 펼치면 영문
 * 카드의 사이트 이름 줄이 "풍천리를 지켜주세요"로 나간다. 또 openGraph 는 깊게
 * 병합되지 않아 페이지가 openGraph 를 선언하면 /en 레이아웃의 images 가 사라진다 —
 * /en 홈과 영문 기사 카드에 og:image 가 없던 이유다. 영문 페이지는 이걸 펼친다.
 */
export const EN_SITE_NAME = "Save Pungcheon-ri";

export const EN_OG_IMAGE = {
  url: "https://hxcoeowfjanltwrsqhyz.supabase.co/storage/v1/object/public/images/press/ie003535387_std.jpg",
  width: 1200,
  height: 630,
  alt: "Aerial view of Pungcheon-ri",
};

export const OG_SITE_EN_BASE = {
  ...OG_SITE_EN,
  siteName: EN_SITE_NAME,
  images: [EN_OG_IMAGE],
};
