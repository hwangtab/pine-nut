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
      {/* footer는 main의 형제라 flow 안에 두면 능선의 투명 여백에 body 배경(--color-bg)만 비친다 —
          어떤 페이지의 마지막 섹션이든 맞게 하려면 이 div는 레이아웃 높이를 차지하지 않고,
          능선을 앞 섹션 위에 겹쳐 그려 능선의 음각 자체가 앞 섹션 내용이 되게 한다.
          -bottom-px는 절대배치 경계에서 생기는 서브픽셀 이음매를 능선이 어두운 블록 위로 1px 겹치게 해 지운다. */}
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
