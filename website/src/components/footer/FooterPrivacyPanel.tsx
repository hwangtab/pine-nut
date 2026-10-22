"use client";

import Link from "next/link";
import { EditableList, EditableRichText } from "@/components/editable";
import {
  FOOTER_COPY,
  FOOTER_PRIVACY_ITEMS,
  FOOTER_PRIVACY_NOTICE,
  type ChromeLocale,
} from "@/lib/i18n/chrome";

// 요약은 /privacy 전문(수집 항목·목적·보유 기간)과 같은 내용이어야 한다.
// 값은 lib/i18n/chrome.ts 에 한·영을 함께 둔다.
const privacyItems = FOOTER_PRIVACY_ITEMS.ko;

interface FooterPrivacyPanelProps {
  onClose: () => void;
  locale?: ChromeLocale;
}

function PrivacyItems({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <p key={i} className="mb-2">
          <strong>{item.label}:</strong> {item.value}
        </p>
      ))}
    </div>
  );
}

export default function FooterPrivacyPanel({ onClose, locale = "ko" }: FooterPrivacyPanelProps) {
  const copy = FOOTER_COPY[locale];

  return (
    <div className="mt-6 p-6 bg-white/10 rounded-xl text-sm text-white/80 leading-relaxed">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-white">{copy.privacy}</h4>
        <button
          type="button"
          onClick={onClose}
          className="min-h-[44px] inline-flex items-center text-white/60 hover:text-white transition-colors text-xs"
        >
          {copy.close}
        </button>
      </div>
      {/* 영문 구간은 편집 키를 공유하지 않는다(lib/i18n/chrome.ts). */}
      {locale === "en" ? (
        <>
          <PrivacyItems items={FOOTER_PRIVACY_ITEMS.en} />
          <p className="mt-2">{FOOTER_PRIVACY_NOTICE.en}</p>
        </>
      ) : (
        <>
          <EditableList
            contentKey="footer.privacy.items"
            defaultItems={privacyItems}
            page="footer"
            section="privacy"
            fields={[
              { key: "label", label: "항목" },
              { key: "value", label: "내용" },
            ]}
          >
            {(items) => <PrivacyItems items={items} />}
          </EditableList>
          <EditableRichText
            contentKey="footer.privacy.notice"
            defaultValue={FOOTER_PRIVACY_NOTICE.ko}
            page="footer"
            section="privacy"
          >
            {(value) => (
              <p className="mt-2">
                {value}
              </p>
            )}
          </EditableRichText>
        </>
      )}
      <Link
        href={copy.privacyHref}
        className="mt-2 inline-flex min-h-[44px] items-center font-semibold text-white underline underline-offset-4 hover:text-white/80 transition-colors"
      >
        {copy.privacyFullPolicy} →
      </Link>
    </div>
  );
}
