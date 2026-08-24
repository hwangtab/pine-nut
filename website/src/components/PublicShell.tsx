"use client";

import { usePathname } from "next/navigation";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import CustomSectionsHost from "@/components/CustomSectionsHost";
import { needsFooterRidgeGap, needsNavTopPadding, showsFooterRidge } from "@/lib/nav-routes";

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  // 히어로가 없는 콘텐츠 페이지는 전폭 페이퍼 내비 아래로 여백을 준다.
  const topPad = needsNavTopPadding(pathname) ? "pt-20 md:pt-24" : "";

  // 푸터 능선이 겹쳐 그리는 만큼 + 숨 쉴 틈을 여기서 한 번만 확보한다.
  // 페이지가 각자 pb-* 를 잡지 않는다 — 그 방식은 반복해서 어긋났고,
  // 관리자가 추가한 섹션에는 손댈 개발자가 없어 구조적으로 재발한다.
  // 높이 = 능선 마루(30/42/60px) + 여유(34/38/52px).
  const ridgeGap = needsFooterRidgeGap(pathname);
  // 능선은 푸터와 같은 색으로 끝나는 페이지에서만 생략한다(숲색 꼬리에서는 보인다).
  const showRidge = showsFooterRidge(pathname);

  return (
    <>
      <Navigation />
      <main className={topPad}>
        {children}
        <CustomSectionsHost />
        {ridgeGap && <div aria-hidden="true" className="h-16 sm:h-20 md:h-28" />}
      </main>
      <Footer showRidge={showRidge} />
    </>
  );
}
