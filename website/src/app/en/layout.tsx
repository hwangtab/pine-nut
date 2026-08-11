import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SITE_URL } from "@/lib/site-config";

/**
 * 영문 구간의 기본 메타데이터.
 *
 * 이게 없으면 metadata를 선언하지 않은 영문 페이지(petition·donate·gallery·
 * press/release·press/factsheet)가 루트 레이아웃의 한국어 title·description·
 * og:locale=ko_KR을 그대로 물려받아, 영문 URL의 공유 카드가 한국어로 나갔다.
 * 하위 페이지가 자체 metadata를 선언하면 그쪽이 우선한다.
 */
export const metadata: Metadata = {
  title: {
    default: "Save Pungcheon-ri — Stop the Pumped-Storage Plant",
    template: "%s | Save Pungcheon-ri",
  },
  description:
    "Residents of Pungcheon-ri, Hongcheon County, Gangwon Province have opposed a pumped-storage hydroelectric plant for more than seven years — over 705 weekly protests to protect their homes, forests, and livelihoods.",
  openGraph: {
    title: "Save Pungcheon-ri — Stop the Pumped-Storage Plant",
    description:
      "Seven years, more than 705 protests. Stand with the residents of Pungcheon-ri.",
    siteName: "Save Pungcheon-ri",
    url: `${SITE_URL}/en`,
    type: "website",
    locale: "en_US",
  },
  alternates: {
    canonical: `${SITE_URL}/en`,
    languages: {
      ko: SITE_URL,
      en: `${SITE_URL}/en`,
    },
  },
};

export default function EnglishLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <div lang="en">{children}</div>;
}
