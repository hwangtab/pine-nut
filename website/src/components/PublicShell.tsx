"use client";

import { usePathname } from "next/navigation";
import { MotionConfig } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import CustomSectionsHost from "@/components/CustomSectionsHost";
import { needsNavTopPadding } from "@/lib/nav-routes";

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  // reducedMotion="user": OS의 '동작 줄이기' 설정 시 transform·layout 애니메이션 자동 비활성.
  if (isAdmin) {
    return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
  }

  // 히어로가 없는 콘텐츠 페이지는 플로팅 캡슐 내비 아래로 여백을 준다.
  const topPad = needsNavTopPadding(pathname) ? "pt-20 md:pt-24" : "";

  return (
    <MotionConfig reducedMotion="user">
      <Navigation />
      <main className={topPad}>
        {children}
        <CustomSectionsHost />
      </main>
      <Footer />
    </MotionConfig>
  );
}
