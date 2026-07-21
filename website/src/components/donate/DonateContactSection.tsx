"use client";

import { ExternalLink } from "lucide-react";
import { EditableLink, EditableText } from "@/components/editable";

export default function DonateContactSection() {
  return (
    <section
      className="bg-white border border-[var(--color-border)] rounded-[var(--radius-panel)] p-6 sm:p-8 space-y-6 shadow-card"
      aria-label="안내사항"
    >
      <div>
        <EditableText
          contentKey="donate.contact.heading"
          defaultValue="후원 관련 문의"
          as="p"
          page="donate"
          section="contact"
          className="text-[15px] font-semibold text-[var(--color-text)] mb-3"
        />
        <div className="space-y-3">
          <EditableLink
            contentKey="donate.contact.phoneHref"
            defaultHref="tel:010-8918-8933"
            page="donate"
            section="contact"
            className="flex items-center gap-3 text-[15px] text-[var(--color-text)] hover:text-[var(--color-warm)] transition-colors min-h-[44px]"
          >
            <svg
              className="w-4 h-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.79 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            010-8918-8933 (이창후 총무)
          </EditableLink>
          <EditableLink
            contentKey="donate.contact.campaignHref"
            defaultHref="https://campaigns.do/campaigns/1328"
            page="donate"
            section="contact"
            className="flex items-center gap-3 text-[15px] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors min-h-[44px]"
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            빠띠 캠페인 페이지를 통해 문의해주세요
          </EditableLink>
        </div>
      </div>
    </section>
  );
}
