"use client";

import { useState } from "react";
import FooterBottomBar from "@/components/footer/FooterBottomBar";
import FooterBrand from "@/components/footer/FooterBrand";
import FooterContact from "@/components/footer/FooterContact";
import FooterPrivacyPanel from "@/components/footer/FooterPrivacyPanel";
import FooterQuickLinks from "@/components/footer/FooterQuickLinks";
import { useAdminEdit } from "@/lib/contexts/AdminEditContext";
import { defaultFooterLinks, parseBuilderLinks } from "@/lib/custom-sections";

export default function Footer() {
  const { getContent } = useAdminEdit();
  const [showPrivacy, setShowPrivacy] = useState(false);
  const quickLinks = parseBuilderLinks(
    getContent("builder.global.footerLinks"),
    defaultFooterLinks(),
  );

  return (
    <footer className="bg-[var(--color-forest)] text-white" role="contentinfo">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          <FooterBrand />
          <FooterQuickLinks quickLinks={quickLinks} />
          <FooterContact />
        </div>

        <FooterBottomBar onTogglePrivacy={() => setShowPrivacy((current) => !current)} />

        {showPrivacy && <FooterPrivacyPanel onClose={() => setShowPrivacy(false)} />}
      </div>
    </footer>
  );
}
