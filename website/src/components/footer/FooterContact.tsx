"use client";

import { EditableLink, EditableText } from "@/components/editable";
import { FOOTER_COPY, type ChromeLocale } from "@/lib/i18n/chrome";

const PHONE_HREF = "tel:010-8918-8933";
const CAMPAIGN_HREF = "https://campaigns.do/campaigns/1328";
const LINK_CLASS = "inline-flex min-h-[44px] items-center transition-colors hover:text-white";
const LABEL_CLASS = "block text-white/60 text-xs mb-0.5";

export default function FooterContact({ locale = "ko" }: { locale?: ChromeLocale }) {
  const copy = FOOTER_COPY[locale];

  // 영문 구간은 편집 키를 공유하지 않는다 — 한국어로 편집된 값이 새어 나온다.
  if (locale === "en") {
    return (
      <div>
        <h3 className="text-base font-bold mb-4">{copy.contactTitle}</h3>
        <ul className="space-y-3 text-sm text-white/70">
          <li>
            <span className={LABEL_CLASS}>{copy.phoneLabel}</span>
            <a href={PHONE_HREF} className={LINK_CLASS}>
              {copy.phone}
            </a>
          </li>
          <li>
            <span className={LABEL_CLASS}>{copy.bankLabel}</span>
            <span>{copy.bankAccount}</span>
          </li>
          <li>
            <span className={LABEL_CLASS}>{copy.campaignLabel}</span>
            <a href={CAMPAIGN_HREF} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
              {copy.campaignLink}
            </a>
          </li>
        </ul>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-base font-bold mb-4">{copy.contactTitle}</h3>
      <ul className="space-y-3 text-sm text-white/70">
        <li>
          <EditableText
            contentKey="footer.contact.phoneLabel"
            defaultValue={copy.phoneLabel}
            as="span"
            page="footer"
            section="contact"
            className={LABEL_CLASS}
          />
          <EditableLink
            contentKey="footer.contact.phoneHref"
            defaultHref={PHONE_HREF}
            page="footer"
            section="contact"
            className={LINK_CLASS}
          >
            <EditableText
              contentKey="footer.contact.phone"
              defaultValue="010-8918-8933 (이창후 총무)"
              as="span"
              page="footer"
              section="contact"
            />
          </EditableLink>
        </li>
        <li>
          <EditableText
            contentKey="footer.contact.bankLabel"
            defaultValue={copy.bankLabel}
            as="span"
            page="footer"
            section="contact"
            className={LABEL_CLASS}
          />
          <EditableText
            contentKey="footer.contact.bankAccount"
            defaultValue={copy.bankAccount}
            as="span"
            page="footer"
            section="contact"
          />
        </li>
        <li>
          <EditableText
            contentKey="footer.contact.campaignLabel"
            defaultValue={copy.campaignLabel}
            as="span"
            page="footer"
            section="contact"
            className={LABEL_CLASS}
          />
          <EditableLink
            contentKey="footer.contact.campaignHref"
            defaultHref={CAMPAIGN_HREF}
            page="footer"
            section="contact"
            className={LINK_CLASS}
          >
            <EditableText
              contentKey="footer.contact.campaignLink"
              defaultValue={copy.campaignLink}
              as="span"
              page="footer"
              section="contact"
            />
          </EditableLink>
        </li>
      </ul>
    </div>
  );
}
