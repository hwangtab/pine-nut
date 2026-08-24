"use client";

import { usePathname } from "next/navigation";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import CustomSectionsHost from "@/components/CustomSectionsHost";
import { useAdminEdit } from "@/lib/contexts/AdminEditContext";
import { PATH_TO_BUILDER_PAGE, parseCustomSections } from "@/lib/custom-sections";
import { needsFooterRidgeGap, needsNavTopPadding, showsFooterRidge } from "@/lib/nav-routes";

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { getContent } = useAdminEdit();
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
  // 관리자가 추가한 섹션은 항상 main의 마지막 자식이 된다. 그 섹션은 밝은
  // 테마뿐이라, 어두운 꼬리로 분류된 라우트라도 섹션이 붙는 순간 꼬리가
  // 밝아진다 — 이때는 여백을 강제해야 능선에 잘리지 않는다.
  const builderPage = PATH_TO_BUILDER_PAGE[pathname];
  const hasCustomTail = builderPage
    ? parseCustomSections(getContent(`builder.${builderPage}.customSections`)).filter(
        (section) => section.visible,
      ).length > 0
    : false;
  const ridgeGap = needsFooterRidgeGap(pathname) || hasCustomTail;
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
