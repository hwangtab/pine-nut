"use client";

import Link from "next/link";
import { EditableLink, EditableRichText, EditableText } from "@/components/editable";
import { FOOTER_COPY, type ChromeLocale } from "@/lib/i18n/chrome";

export default function FooterBrand({ locale = "ko" }: { locale?: ChromeLocale }) {
  const copy = FOOTER_COPY[locale];

  // 영문 구간은 편집 키를 공유하지 않는다(lib/i18n/chrome.ts).
  if (locale === "en") {
    return (
      <div>
        <Link href={copy.brandHref} className="mb-3 block text-xl font-bold">
          {copy.brandName}
        </Link>
        <p className="text-white/70 text-sm leading-relaxed">{copy.brandDescription}</p>
      </div>
    );
  }

  return (
    <div>
      <EditableLink
        contentKey="footer.brand.href"
        defaultHref={copy.brandHref}
        page="footer"
        section="brand"
        className="mb-3 block text-xl font-bold"
      >
        <EditableText
          contentKey="footer.brand.name"
          defaultValue={copy.brandName}
          as="span"
          page="footer"
          section="brand"
        />
      </EditableLink>
      <EditableRichText
        contentKey="footer.brand.description"
        defaultValue={copy.brandDescription}
        page="footer"
        section="brand"
      >
        {(value) => (
          <p className="text-white/70 text-sm leading-relaxed">
            {value}
          </p>
        )}
      </EditableRichText>
    </div>
  );
}
