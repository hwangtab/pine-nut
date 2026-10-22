import type { Metadata } from "next";
import { Nanum_Pen_Script } from "next/font/google";
import "./globals.css";
import PublicShell from "@/components/PublicShell";

// Pretendard(본문)와 MaruBuri(제목)는 globals.css의 동적 서브셋
// (@font-face + unicode-range 92분할)로 서빙한다: 페이지에 실제 쓰인 글자
// 범위의 조각만 내려받아 전송량이 통짜 대비 수십 KB로 줄어든다.
//
// 나눔명조는 여기서 뺐다. --font-serif-display 스택에서 MaruBuri 뒤 폴백이라
// 화면에 나오는 일이 없는데도, next/font가 3웨이트 × 92서브셋 = @font-face
// 277개를 렌더 차단 CSS에 실었다(gzip 43KB, 전 페이지 최대 CSS 덩어리).
// MaruBuri가 같은 92개 범위를 모두 덮는 것을 확인하고 제거했다.

// 나눔 펜 스크립트 셀프호스팅(손글씨 포인트 요소 전용, --font-hand)
const nanumPen = Nanum_Pen_Script({
  weight: "400",
  variable: "--font-nanum-pen",
  display: "swap",
  preload: false,
});
import Analytics from "@/components/Analytics";
import AdminEditShell from "@/components/admin/AdminEditShell";
import { SITE_NAME, SITE_URL } from "@/lib/site-config";
import { getAllPageContent } from "@/lib/data/page-content";

export const metadata: Metadata = {
  title: "풍천리를 지켜주세요 — 양수발전소 건설 반대",
  metadataBase: new URL(SITE_URL),
  description:
    "강원도 홍천 풍천리 주민들이 8년째 양수발전소 건설에 맞서고 있습니다. 705번이 넘는 집회, 평균 70세의 싸움에 함께해주세요.",
  openGraph: {
    title: "풍천리를 지켜주세요 — 양수발전소 건설 반대",
    description:
      "8년째, 705번의 외침. 강원도 홍천 풍천리 주민들의 양수발전소 반대 투쟁에 함께해주세요.",
    siteName: SITE_NAME,
    // og:url을 여기서 고정하면 모든 하위 페이지의 공유 링크가 홈으로 수렴한다.
    // 각 페이지가 자기 경로를 openGraph.url / alternates.canonical로 선언한다.
    type: "website",
    locale: "ko_KR",
    images: [
      {
        url: "https://hxcoeowfjanltwrsqhyz.supabase.co/storage/v1/object/public/images/press/ie003535387_std.jpg",
        width: 1200,
        height: 630,
        alt: "드론 촬영 풍천리 전경",
      },
    ],
  },
  // alternates(canonical·hreflang)를 여기 두면 안 된다. Next의 메타데이터 병합은
  // 하위가 선언하지 않은 필드를 그대로 상속시키므로, 모든 하위 페이지가
  // canonical=홈을 내보내 검색엔진이 전부 홈의 중복으로 판단한다.
  // 각 페이지가 자기 경로를 선언한다(홈은 src/app/page.tsx).
};

// 이 레이아웃은 방문자가 누구인지 묻지 않는다 — cookies()에 닿는 순간 그
// 아래 모든 페이지가 요청마다 서버 렌더로 고정되어 CDN 캐시에서 빠지기
// 때문이다. 로그인·권한 판정은 AdminEditProvider가 브라우저에서 하고
// (lib/contexts/admin-edit/useAdminSession.ts), 여기서 읽는 CMS 오버라이드는
// 방문자와 무관한 공개 데이터라 캐시된다.
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialContent = await getAllPageContent();

  return (
    // suppressHydrationWarning: 아래 인라인 스크립트가 하이드레이션 전에 <html>에
    // `js` 클래스를 붙이므로 서버 HTML과 className이 달라진다(이 요소 한 단계만 무시).
    <html lang="ko" className={nanumPen.variable} suppressHydrationWarning>
      <head>
        {/* 첫 페인트 전에 동기 실행 — .reveal 숨김 상태를 JS가 켜진 환경에서만 건다
            (globals.css `.js .reveal:not(.is-visible)`). JS가 꺼지면 내용이 그대로 보인다. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
        {/* 영문 구간(/en/*)이면 lang="en"으로 고친다. 서버에서 경로별로 내보내려면
            요청 헤더를 읽어야 해 전 페이지가 CDN에서 빠진다. 이후 클라이언트 이동은
            PublicShell의 useDocumentLang이 맞춘다. lang 차이도 위 suppressHydrationWarning이 덮는다. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "if(/^\\/en(\\/|$)/.test(location.pathname))document.documentElement.lang='en'",
          }}
        />
      </head>
      <body className="antialiased">
        <Analytics />
        <AdminEditShell initialContent={initialContent}>
          <PublicShell>{children}</PublicShell>
        </AdminEditShell>
      </body>
    </html>
  );
}
