import type { Metadata } from "next";
import type { ReactNode } from "react";
import { englishAlternates } from "@/lib/seo-alternates";
import { SITE_URL } from "@/lib/site-config";

const TITLE = "We Are the Trees — Save Pungcheon-ri";
const DESCRIPTION =
  "A national solidarity petition to stop the Pungcheon-ri pumped-storage project. Read the statement in English, then sign the Korean-language petition.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: englishAlternates("/en/petition", "/petition"),
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    // og:url을 선언하지 않으면 /en/layout.tsx의 openGraph를 통째로 물려받아
    // 공유 링크가 영문 홈(/en)으로 수렴한다 — 루트/en 레이아웃 주석과 같은 문제.
    url: "/en/petition",
    siteName: "Save Pungcheon-ri",
    type: "website",
    locale: "en_US",
    // 전용 영문 OG 이미지는 새로 만들지 않는다. 이 페이지는 영문 요약이고
    // 실제 서명은 한국어 폼(/petition)으로 보내므로("The petition form is in
    // Korean" 안내가 본문에 있다), 그 한국어 캠페인 카드를 그대로 재사용하는
    // 편이 새 라우트를 만드는 것보다 이 페이지의 실제 목적지와 더 맞는다.
    images: [
      {
        url: `${SITE_URL}/petition/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "We Are the Trees — Save Pungcheon-ri petition",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function EnPetitionLayout({ children }: { children: ReactNode }) {
  return children;
}
