"use client";

import { useState } from "react";
import FooterBottomBar from "@/components/footer/FooterBottomBar";
import FooterBrand from "@/components/footer/FooterBrand";
import FooterContact from "@/components/footer/FooterContact";
import FooterPrivacyPanel from "@/components/footer/FooterPrivacyPanel";
import FooterQuickLinks from "@/components/footer/FooterQuickLinks";
import { useAdminEdit } from "@/lib/contexts/AdminEditContext";
import { usePathname } from "next/navigation";
import { defaultEnFooterLinks, defaultFooterLinks, parseBuilderLinks } from "@/lib/custom-sections";
import { RidgeDivider } from "@/components/visuals/ForestLetterMotifs";

export default function Footer() {
  const { getContent } = useAdminEdit();
  const [showPrivacy, setShowPrivacy] = useState(false);
  const pathname = usePathname();
  // 영문 구간에서는 영문 링크 세트(Navigation과 동일한 이유).
  const isEnglish = pathname === "/en" || pathname.startsWith("/en/");
  const quickLinks = isEnglish
    ? defaultEnFooterLinks()
    : parseBuilderLinks(getContent("builder.global.footerLinks"), defaultFooterLinks());

  return (
    <footer role="contentinfo" className="relative">
      {/* 능선은 푸터 위로 겹쳐 그리는 높이 0의 오버레이다.
          in-flow 로 두면 <footer> 가 <main> 의 형제라서 앞 섹션 배경이 아니라
          body 크림만 비친다 — 그래서 절대 위치로 푸터 위에 얹고, 능선의 음각
          자체가 앞 섹션 내용이 되게 한다.
          -bottom-px 는 절대배치 경계의 서브픽셀 이음매를 1px 겹침으로 지운다.
          모든 라우트에서 그린다: 푸터와 같은 색으로 끝나는 페이지는 없다
          (홈 통계 밴드는 --color-deep-raised). */}
      <div className="relative h-0">
        <RidgeDivider className="absolute -bottom-px left-0 text-[var(--color-deep)]" />
      </div>
      <div className="bg-[var(--color-deep)] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
            <FooterBrand />
            <FooterQuickLinks quickLinks={quickLinks} />
            <FooterContact />
          </div>

          <FooterBottomBar onTogglePrivacy={() => setShowPrivacy((current) => !current)} />

          {showPrivacy && <FooterPrivacyPanel onClose={() => setShowPrivacy(false)} />}
        </div>
      </div>
    </footer>
  );
}
