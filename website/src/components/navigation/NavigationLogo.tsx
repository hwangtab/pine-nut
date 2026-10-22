"use client";

import Link from "next/link";
import { EditableLink, EditableText } from "@/components/editable";
import { NAV_COPY, type ChromeLocale } from "@/lib/i18n/chrome";

interface NavigationLogoProps {
  isTransparent: boolean;
  locale?: ChromeLocale;
}

export default function NavigationLogo({ isTransparent, locale = "ko" }: NavigationLogoProps) {
  const className = `text-lg font-bold shrink-0 min-h-[44px] flex items-center transition-colors duration-300 ${
    isTransparent ? "text-white" : "text-[var(--color-forest)]"
  }`;

  // 영문 구간에서는 편집 키를 쓰지 않는다 — 한국어로 편집된 로고가 새어 나오고,
  // 로고를 누르면 한국어 홈으로 빠져나간다.
  if (locale === "en") {
    return (
      <Link href={NAV_COPY.en.logoHref} className={className}>
        {NAV_COPY.en.logo}
      </Link>
    );
  }

  return (
    <EditableLink
      contentKey="nav.logoHref"
      defaultHref={NAV_COPY.ko.logoHref}
      page="nav"
      section="header"
      className={className}
    >
      <EditableText
        contentKey="nav.logo"
        defaultValue={NAV_COPY.ko.logo}
        as="span"
        page="nav"
        section="header"
      />
    </EditableLink>
  );
}
