"use client";

import Link from "next/link";
import { EditableLink, EditableText } from "@/components/editable";
import { FOOTER_COPY, type ChromeLocale } from "@/lib/i18n/chrome";

interface FooterBottomBarProps {
  onTogglePrivacy: () => void;
  locale?: ChromeLocale;
}

const CAMPAIGN_HREF = "https://campaigns.do/campaigns/1328";
const LINK_CLASS = "min-h-[44px] inline-flex items-center hover:text-white transition-colors";

export default function FooterBottomBar({ onTogglePrivacy, locale = "ko" }: FooterBottomBarProps) {
  const copy = FOOTER_COPY[locale];

  return (
    <div className="mt-12 pt-8 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/60">
      <p>&copy; {new Date().getFullYear()} {copy.copyrightHolder}. All rights reserved.</p>
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
        <button type="button" onClick={onTogglePrivacy} className={LINK_CLASS}>
          {copy.privacy}
        </button>
        {/* 영문 구간은 편집 키를 공유하지 않는다(lib/i18n/chrome.ts). 언어 전환 링크도
            반대 방향(한국어 홈)을 가리켜야 한다. */}
        {locale === "en" ? (
          <>
            <a href={CAMPAIGN_HREF} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
              {copy.campaign}
            </a>
            <Link href={copy.otherLanguageHref} lang="ko" className={LINK_CLASS}>
              {copy.otherLanguage}
            </Link>
          </>
        ) : (
          <>
            <EditableLink
              contentKey="footer.bottom.campaignHref"
              defaultHref={CAMPAIGN_HREF}
              page="footer"
              section="bottom"
              className={LINK_CLASS}
            >
              {copy.campaign}
            </EditableLink>
            <EditableLink
              contentKey="footer.bottom.englishHref"
              defaultHref={copy.otherLanguageHref}
              page="footer"
              section="bottom"
              className={LINK_CLASS}
            >
              <EditableText
                contentKey="footer.bottom.englishLabel"
                defaultValue={copy.otherLanguage}
                as="span"
                page="footer"
                section="bottom"
              />
            </EditableLink>
          </>
        )}
      </div>
    </div>
  );
}
