"use client";

import { ExternalLink } from "lucide-react";
import { EditableLink, EditableText } from "@/components/editable";

export default function DonateCampaignSection() {
  return (
    <section aria-label="다른 후원 경로">
      <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-panel)] p-6 sm:p-8 text-center shadow-card">
        <EditableText
          contentKey="donate.campaign.text"
          defaultValue="빠띠 캠페인 페이지에서도 후원 및 문의가 가능합니다"
          as="p"
          page="donate"
          section="campaign"
          className="text-[15px] text-[var(--color-text)] font-medium mb-4"
        />
        <EditableLink
          contentKey="donate.campaign.href"
          defaultHref="https://campaigns.do/campaigns/1328"
          page="donate"
          section="campaign"
          className="inline-flex items-center justify-center gap-2 min-h-[48px] px-8 rounded-full bg-[var(--color-text)] hover:bg-[var(--color-text)]/90 text-white font-bold text-base transition-colors"
        >
          <ExternalLink className="w-5 h-5" />
          <EditableText
            contentKey="donate.campaign.link"
            defaultValue="빠띠 캠페인 페이지 방문"
            as="span"
            page="donate"
            section="campaign"
          />
        </EditableLink>
      </div>
    </section>
  );
}
