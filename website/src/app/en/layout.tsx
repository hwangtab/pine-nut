import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * 영문 구간의 기본 메타데이터.
 *
 * 이게 없으면 metadata를 선언하지 않은 영문 페이지(petition·donate·gallery·
 * press/release·press/factsheet)가 루트 레이아웃의 한국어 title·description·
 * og:locale=ko_KR을 그대로 물려받아, 영문 URL의 공유 카드가 한국어로 나갔다.
 * 하위 페이지가 자체 metadata를 선언하면 그쪽이 우선한다.
 */
export const metadata: Metadata = {
  // template("%s | Save Pungcheon-ri")을 쓰면 안 된다. 영문 하위 페이지들은 이미
  // "Gallery — Save Pungcheon-ri"처럼 완결형 title을 선언하고 있어서, 템플릿이
  // 적용되면 접미사가 두 번 붙는다("… — Save Pungcheon-ri | Save Pungcheon-ri").
  title: "Save Pungcheon-ri — Stop the Pumped-Storage Plant",
  description:
    "Residents of Pungcheon-ri, Hongcheon County, Gangwon Province have opposed a pumped-storage hydroelectric plant for more than seven years — over 705 weekly protests to protect their homes, forests, and livelihoods.",
  openGraph: {
    title: "Save Pungcheon-ri — Stop the Pumped-Storage Plant",
    description:
      "Seven years, more than 705 protests. Stand with the residents of Pungcheon-ri.",
    siteName: "Save Pungcheon-ri",
    // url은 여기 두지 않는다. openGraph는 필드 단위로 깊게 병합되지 않고 가장 가까운
    // 선언으로 통째로 대체되므로, 여기서 /en으로 고정하면 모든 영문 하위 페이지의
    // 공유 링크가 영문 홈으로 수렴한다(루트 layout에서 똑같이 겪은 문제다).
    type: "website",
    locale: "en_US",
    // 같은 이유로 images도 여기서 명시해야 한다. 이 선언이 루트의 openGraph를
    // 대체해버려, 명시하지 않으면 영문 페이지에는 og:image가 아예 남지 않는다.
    images: [
      {
        url: "https://hxcoeowfjanltwrsqhyz.supabase.co/storage/v1/object/public/images/press/ie003535387_std.jpg",
        width: 1200,
        height: 630,
        alt: "Aerial view of Pungcheon-ri",
      },
    ],
  },
  alternates: {
    canonical: "/en",
    languages: {
      ko: "/",
      en: "/en",
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
