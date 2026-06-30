"use client";

import { EditableText } from "@/components/editable";

export default function DonateMonthlySection() {
  return (
    <section aria-label="월별 후원금 내역">
      <EditableText
        contentKey="donate.monthly.heading"
        defaultValue="월별 후원금 내역"
        as="h2"
        page="donate"
        section="monthly"
        className="text-xl sm:text-2xl font-bold mb-6 text-[var(--color-text)]"
      />
      <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 sm:p-8">
        <div className="bg-[var(--color-bg-warm)] rounded-xl px-5 py-4 text-center">
          <EditableText
            contentKey="donate.monthly.statusTitle"
            defaultValue="후원금 사용 내역은 확정 후 공개 예정입니다."
            as="p"
            page="donate"
            section="monthly"
            className="text-[15px] text-[var(--color-text)] font-medium"
          />
          <EditableText
            contentKey="donate.monthly.statusDesc"
            defaultValue="후원금이 모이기 시작하면 매월 수입·지출 내역을 투명하게 공개하겠습니다."
            as="p"
            page="donate"
            section="monthly"
            className="text-sm text-[var(--color-text-muted)] mt-1"
          />
        </div>
      </div>
    </section>
  );
}
