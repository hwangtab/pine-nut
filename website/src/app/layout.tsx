import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import PublicShell from "@/components/PublicShell";

// Pretendard 셀프호스팅(외부 CDN 의존 제거). 변수 폰트 1개로 전 weight 커버.
// preload:false + display:swap + next/font 자동 size-adjust 폴백으로 렌더 비차단·CLS 최소화.
const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  display: "swap",
  weight: "100 900",
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
    "강원도 홍천군 화촌면 풍천리 주민들은 양수발전소 건설에 반대하며 7년 넘게 싸우고 있습니다. 680여 차례 집회, 70대 이상 고령 주민들의 생존권 투쟁에 함께해주세요.",
  openGraph: {
    title: "풍천리를 지켜주세요 — 양수발전소 건설 반대",
    description:
      "7년간 680번의 외침. 강원도 홍천 풍천리 주민들의 양수발전소 반대 투쟁에 함께해주세요.",
    siteName: "풍천리를 지켜주세요",
    url: SITE_URL,
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
    <html lang="ko" className={pretendard.variable}>
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
