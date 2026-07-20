"use client";

import FooterLink from "@/components/footer/FooterLink";
import type { BuilderLinkItem } from "@/lib/custom-sections";

interface FooterQuickLinksProps {
  quickLinks: BuilderLinkItem[];
}

export default function FooterQuickLinks({ quickLinks }: FooterQuickLinksProps) {
  return (
    <div>
      <h3 className="text-base font-bold mb-4">바로가기</h3>
      {/* 링크가 많아 1열이면 푸터가 지나치게 길어지므로 2열로 배치 */}
      <ul className="grid grid-cols-2 gap-x-6">
        {quickLinks.map((link) => (
          <li key={link.id}>
            <FooterLink
              href={link.href}
              className="inline-flex items-center min-h-[44px] text-white/70 hover:text-white text-sm transition-colors"
              label={link.label}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
