import type { Metadata } from "next";
import { Nanum_Myeongjo } from "next/font/google";
import "./globals.css";
import PublicShell from "@/components/PublicShell";

// 나눔명조 셀프호스팅(next/font가 빌드 시 다운로드해 자체 서빙 — 구글 CSS 체인 제거).
// Pretendard는 globals.css의 동적 서브셋(@font-face + unicode-range 92분할)로 서빙:
// 페이지에 실제 쓰인 글자 범위의 조각만 내려받아 전송량이 2MB → 수십 KB로 줄어든다.
const nanumMyeongjo = Nanum_Myeongjo({
  weight: ["400", "700", "800"],
  variable: "--font-nanum-myeongjo",
  display: "swap",
  preload: false,
});
import Analytics from "@/components/Analytics";
import AdminEditShell from "@/components/admin/AdminEditShell";
import { SITE_URL } from "@/lib/site-config";
import { getAllPageContent } from "@/lib/data/page-content";
import { getMyAdminMember } from "@/lib/data/admin-members";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const metadata: Metadata = {
  title: "풍천리를 지켜주세요 — 양수발전소 건설 반대",
  metadataBase: new URL(SITE_URL),
  description:
    "강원도 홍천군 화촌면 풍천리 주민들은 양수발전소 건설에 반대하며 7년 넘게 싸우고 있습니다. 705여 차례 집회, 70대 이상 고령 주민들의 생존권 투쟁에 함께해주세요.",
  openGraph: {
    title: "풍천리를 지켜주세요 — 양수발전소 건설 반대",
    description:
      "7년간 705번의 외침. 강원도 홍천 풍천리 주민들의 양수발전소 반대 투쟁에 함께해주세요.",
    siteName: "풍천리를 지켜주세요",
    // og:url을 여기서 고정하면 모든 하위 페이지의 공유 링크가 홈으로 수렴한다.
    // 각 페이지가 자기 경로를 openGraph.url / alternates.canonical로 선언한다.
    type: "website",
    locale: "ko_KR",
    images: [
      {
        url: "https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/1016/IE003535387_STD.jpg",
        width: 1200,
        height: 630,
        alt: "드론 촬영 풍천리 전경",
      },
    ],
  },
  alternates: {
    canonical: SITE_URL,
    // 영문 쪽에서만 선언하면 단방향이라 검색엔진이 언어 대체 관계를 무시한다.
    languages: {
      ko: SITE_URL,
      en: `${SITE_URL}/en`,
    },
  },
};

async function checkAdminFlags(): Promise<{
  isAdmin: boolean;
  isActiveAdmin: boolean;
}> {
  try {
    const me = await getMyAdminMember();
    return {
      isActiveAdmin: me != null,
      isAdmin: me?.role === "owner" || me?.role === "editor",
    };
  } catch {
    return { isAdmin: false, isActiveAdmin: false };
  }
}

async function checkIsLoggedIn(): Promise<boolean> {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return false;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return !!user;
  } catch {
    return false;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [{ isAdmin, isActiveAdmin }, isLoggedIn, initialContent] =
    await Promise.all([
      checkAdminFlags(),
      checkIsLoggedIn(),
      getAllPageContent(),
    ]);

  return (
    <html lang="ko" className={nanumMyeongjo.variable}>
      <body className="antialiased">
        <Analytics />
        <AdminEditShell
          isAdmin={isAdmin}
          isActiveAdmin={isActiveAdmin}
          isLoggedIn={isLoggedIn}
          initialContent={initialContent}
        >
          <PublicShell>{children}</PublicShell>
        </AdminEditShell>
      </body>
    </html>
  );
}
