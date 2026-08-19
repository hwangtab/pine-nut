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
    <footer role="contentinfo">
      {/* 배경은 투명 — 앞 섹션 배경이 비쳐야 한다 */}
      <RidgeDivider className="text-[var(--color-deep)] -mb-px" />
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
