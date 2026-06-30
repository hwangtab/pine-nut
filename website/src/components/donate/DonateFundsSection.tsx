"use client";

import { Bus, Megaphone, Scale, Settings } from "lucide-react";
import { EditableList, EditableText } from "@/components/editable";

const fundIcons = [Bus, Scale, Megaphone, Settings];
const fundColors = [
  "var(--color-warm)",
  "var(--color-forest)",
  "var(--color-sky)",
  "var(--color-earth)",
];

export default function DonateFundsSection() {
  return (
    <section aria-label="후원금 사용 계획">
      <EditableText
        contentKey="donate.funds.heading"
        defaultValue="후원금은 이렇게 사용됩니다"
        as="h2"
        page="donate"
        section="funds"
        className="text-xl sm:text-2xl font-bold mb-6 text-[var(--color-text)]"
      />
      <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 sm:p-8">
        <EditableText
          contentKey="donate.funds.disclaimer"
          defaultValue="* 아래는 후원금 사용 계획(안)이며, 실제 집행 시 변동될 수 있습니다."
          as="p"
          page="donate"
          section="funds"
          className="text-sm text-[var(--color-text-muted)] mb-6"
        />
        <EditableList
          contentKey="donate.funds.items"
          defaultItems={[
            { label: "교통비 (집회·상경 투쟁)", percent: "40" },
            { label: "법률 비용", percent: "30" },
            { label: "홍보물 제작", percent: "15" },
            { label: "운영비", percent: "15" },
          ]}
          page="donate"
          section="funds"
          fields={[
            { key: "label", label: "항목명" },
            { key: "percent", label: "비율 (%)" },
          ]}
        >
          {(items) => (
            <div className="space-y-5 mb-8">
              {items.map((item, i) => {
                const Icon = fundIcons[i] || fundIcons[0];
                const color = fundColors[i] || fundColors[0];
                const percent = parseInt(item.percent, 10) || 0;

                return (
                  <div key={`${item.label}-${i}`}>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="flex items-center gap-2 min-w-0 flex-1 text-[15px] font-medium text-[var(--color-text)]">
                        <Icon className="w-4 h-4 shrink-0" style={{ color }} />
                        <span className="truncate">{item.label}</span>
                      </span>
                      <span className="shrink-0 text-[15px] font-bold" style={{ color }}>
                        {percent}%
                      </span>
                    </div>
                    <div
                      className="h-3 rounded-full bg-[var(--color-bg)] overflow-hidden"
                      role="progressbar"
                      aria-valuenow={percent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${item.label}: ${percent}%`}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${percent}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </EditableList>

        <div className="bg-[var(--color-bg-warm)] rounded-xl px-5 py-4">
          <EditableText
            contentKey="donate.funds.transparencyTitle"
            defaultValue="후원금 사용 내역은 정리 후 이 페이지에 공개됩니다."
            as="p"
            page="donate"
            section="funds"
            className="text-[15px] text-[var(--color-text)] font-medium"
          />
          <EditableText
            contentKey="donate.funds.transparencyDesc"
            defaultValue="주민 여러분의 소중한 후원금이 어디에 쓰이는지 확인 가능한 형태로 투명하게 안내하겠습니다."
            as="p"
            page="donate"
            section="funds"
            className="text-sm text-[var(--color-text-muted)] mt-1"
          />
        </div>
      </div>
    </section>
  );
}
