"use client";

import { EditableLink, EditableText } from "@/components/editable";

export default function FooterContact() {
  return (
    <div>
      <h3 className="text-base font-bold mb-4">연락처</h3>
      <ul className="space-y-3 text-sm text-white/70">
        <li>
          <EditableText
            contentKey="footer.contact.phoneLabel"
            defaultValue="전화 문의"
            as="span"
            page="footer"
            section="contact"
            className="block text-white/50 text-xs mb-0.5"
          />
          <EditableLink
            contentKey="footer.contact.phoneHref"
            defaultHref="tel:010-8918-8933"
            page="footer"
            section="contact"
            className="inline-flex min-h-[44px] items-center transition-colors hover:text-white"
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
            defaultValue="후원 계좌"
            as="span"
            page="footer"
            section="contact"
            className="block text-white/50 text-xs mb-0.5"
          />
          <EditableText
            contentKey="footer.contact.bankAccount"
            defaultValue="농협 356-1559-4666-63 이창후"
            as="span"
            page="footer"
            section="contact"
          />
        </li>
        <li>
          <EditableText
            contentKey="footer.contact.campaignLabel"
            defaultValue="캠페인 페이지"
            as="span"
            page="footer"
            section="contact"
            className="block text-white/50 text-xs mb-0.5"
          />
          <EditableLink
            contentKey="footer.contact.campaignHref"
            defaultHref="https://campaigns.do/campaigns/1328"
            page="footer"
            section="contact"
            className="inline-flex items-center min-h-[44px] hover:text-white transition-colors"
          >
            <EditableText
              contentKey="footer.contact.campaignLink"
              defaultValue="빠띠 캠페인 페이지 바로가기"
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
