"use client";

import { EditableLink, EditableText } from "@/components/editable";

interface FooterBottomBarProps {
  onTogglePrivacy: () => void;
}

export default function FooterBottomBar({ onTogglePrivacy }: FooterBottomBarProps) {
  return (
    <div className="mt-12 pt-8 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/50">
      <p>&copy; {new Date().getFullYear()} 풍천리 주민회. All rights reserved.</p>
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
        <button
          type="button"
          onClick={onTogglePrivacy}
          className="min-h-[44px] inline-flex items-center hover:text-white transition-colors"
        >
          개인정보처리방침
        </button>
        <EditableLink
          contentKey="footer.bottom.campaignHref"
          defaultHref="https://campaigns.do/campaigns/1328"
          page="footer"
          section="bottom"
          className="min-h-[44px] inline-flex items-center hover:text-white transition-colors"
        >
          빠띠 캠페인
        </EditableLink>
        <EditableLink
          contentKey="footer.bottom.englishHref"
          defaultHref="/en"
          page="footer"
          section="bottom"
          className="min-h-[44px] inline-flex items-center hover:text-white transition-colors"
        >
          <EditableText
            contentKey="footer.bottom.englishLabel"
            defaultValue="English"
            as="span"
            page="footer"
            section="bottom"
          />
        </EditableLink>
      </div>
    </div>
  );
}
