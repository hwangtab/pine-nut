"use client";

import { usePathname } from "next/navigation";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import CustomSectionsHost from "@/components/CustomSectionsHost";
import { needsNavTopPadding } from "@/lib/nav-routes";

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  // 히어로가 없는 콘텐츠 페이지는 플로팅 캡슐 내비 아래로 여백을 준다.
  const topPad = needsNavTopPadding(pathname) ? "pt-20 md:pt-24" : "";

  return (
    <>
      <Navigation />
      <main className={topPad}>
        {children}
        <CustomSectionsHost />
      </main>
      <Footer />
    </>
  );
}
