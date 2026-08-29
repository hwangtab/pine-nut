import type { Metadata } from "next";
import { PETITION_FAQ } from "@/lib/petition-faq";
import { localeAlternates } from "@/lib/seo-alternates";

// SERP 제목·설명과 소셜(og/twitter) 제목·설명은 목적이 다르다 — 검색 결과는
// 키워드가 먼저 와야 클릭되고("홍천 양수발전소" 같은 실제 검색어), 소셜 카드는
// 캠페인 정체성("우리가 나무다")이 먼저 와야 반응을 얻는다. 하나로 합치면
// 둘 다 어중간해지므로 title/description(SERP용)과 openGraph/twitter(소셜용)를
// 따로 선언한다. title/description은 문자열 리터럴로 직접 적는다 — 상수로
// 빼면 check-petition-faq.mjs가 "연대서명" 표기를 리터럴에서 직접 찾지 못해
// 깨진다(참조가 아니라 실제 텍스트를 보는 가드다). openGraph와 twitter는
// 같은 소셜 문구를 공유하므로(다른 채널일 뿐 목적은 같다) 상수로 한 번만 적는다.
const SOCIAL_TITLE = "우리가 나무다 — 풍천리 숲을 지키는 서명에 함께해주세요";
const SOCIAL_DESCRIPTION =
  "홍천 풍천리 양수발전소로 사라질 나무 111,999그루. 숲과 계곡을 그대로 지키는 국민 연대서명에 지금 함께해주세요.";

export const metadata: Metadata = {
  alternates: localeAlternates("/petition", "/en/petition"),
  title: "홍천 양수발전소 반대 연대서명 — 풍천리를 지켜주세요",
  description:
    "홍천 풍천리 양수발전소가 들어서면 나무 111,999그루가 사라지고 51가구가 떠나야 합니다. 지금 국민 연대서명에 참여해주세요.",
  openGraph: {
    title: SOCIAL_TITLE,
    description: SOCIAL_DESCRIPTION,
    // 루트 layout의 주석이 경고한 문제 그대로: og:url을 여기서 선언하지 않으면
    // 이 페이지가 루트의 openGraph를 통째로 상속해 공유 링크가 홈으로 수렴한다.
    url: "/petition",
    siteName: "풍천리를 지켜주세요",
    type: "website",
    locale: "ko_KR",
    // images는 일부러 선언하지 않는다 — 이 라우트에는 opengraph-image.tsx가 있고,
    // Next는 같은 세그먼트의 파일 컨벤션 이미지를 metadata.openGraph.images보다
    // 우선한다(홈에서 실측 확인). 여기서 images를 같이 적으면 실제로는 쓰이지
    // 않는 죽은 값이 된다.
  },
  twitter: {
    card: "summary_large_image",
    title: SOCIAL_TITLE,
    description: SOCIAL_DESCRIPTION,
  },
};

// 화면의 아코디언(PetitionFAQ)과 정확히 같은 상수를 읽는다. layout은 서버
// 컴포넌트라 CMS로 편집할 수 없으므로 FAQ 본문은 petition-faq.ts 한 곳에만
// 두고, 여기서는 그것을 구조화 데이터로 옮겨 적기만 한다 — 화면에 없는
// 답변을 JSON-LD가 주장하는 상태(invisible content)를 구조적으로 막는다.
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: PETITION_FAQ.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function PetitionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {children}
    </>
  );
}
