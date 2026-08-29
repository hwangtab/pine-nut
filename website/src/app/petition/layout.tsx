import type { Metadata } from "next";
import { PETITION_FAQ } from "@/lib/petition-faq";
import { localeAlternates } from "@/lib/seo-alternates";
import { SIGNATURE_GOAL } from "@/lib/signatures/api/config";

export const metadata: Metadata = {
  alternates: localeAlternates("/petition", "/en/petition"),
  title: "국민 연대서명 — 우리가 나무다 | 풍천리를 지켜주세요",
  description: `홍천 풍천리 양수발전소 백지화와 숲·계곡 보전을 위한 국민 연대서명에 참여해주세요. 목표 ${SIGNATURE_GOAL.toLocaleString("ko-KR")}명.`,
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
