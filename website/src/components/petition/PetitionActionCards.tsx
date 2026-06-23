"use client";

import type { ReactNode } from "react";
import { HeartHandshake, Megaphone, Send } from "lucide-react";
import { EditableLink, EditableList } from "@/components/editable";

export default function PetitionActionCards({
  onScrollToForm,
  ariaLabel = "함께할 방법",
  contentKey = "petition.cta.cards",
  page = "petition",
  defaultItems = [
    { title: "서명하기", desc: "이름을 남겨 주민들의 목소리에 힘을 보태주세요." },
    { title: "후원하기", desc: "교통비와 법률비용 등 투쟁에 필요한 실질적 힘을 보태주세요." },
    { title: "공유하기", desc: "카드뉴스를 저장해 더 많은 사람에게 풍천리 이야기를 알려주세요." },
  ],
  titleLabel = "제목",
  descLabel = "설명",
  donateHrefKey = "petition.cta.cards.1.href",
  donateDefaultHref = "/donate",
  shareHrefKey = "petition.cta.cards.2.href",
  shareDefaultHref = "/share",
}: {
  onScrollToForm: () => void;
  ariaLabel?: string;
  contentKey?: string;
  page?: string;
  defaultItems?: { title: string; desc: string }[];
  titleLabel?: string;
  descLabel?: string;
  donateHrefKey?: string;
  donateDefaultHref?: string;
  shareHrefKey?: string;
  shareDefaultHref?: string;
}) {
  return (
    <section aria-label={ariaLabel}>
      <EditableList
        contentKey={contentKey}
        defaultItems={defaultItems}
        page={page}
        section="cta"
        fields={[
          { key: "title", label: titleLabel },
          { key: "desc", label: descLabel, type: "textarea" },
        ]}
      >
        {(items) => {
          const icons = [
            { Icon: Send, colorClass: "bg-[var(--color-warm)]/10 text-[var(--color-warm)]" },
            { Icon: HeartHandshake, colorClass: "bg-[var(--color-forest)]/10 text-[var(--color-forest)]" },
            { Icon: Megaphone, colorClass: "bg-[var(--color-sky)]/10 text-[var(--color-sky)]" },
          ];
          const wrappers = [
            (children: ReactNode) => (
              <button
                key="cta-0"
                type="button"
                onClick={onScrollToForm}
                className="text-left bg-white border border-[var(--color-border)] rounded-2xl p-6 transition-colors hover:bg-[var(--color-bg-warm)] cursor-pointer"
              >
                {children}
              </button>
            ),
            (children: ReactNode) => (
              <EditableLink
                key="cta-1"
                contentKey={donateHrefKey}
                defaultHref={donateDefaultHref}
                page={page}
                section="cta"
                className="block rounded-2xl border border-[var(--color-border)] bg-white p-6 transition-colors hover:bg-[var(--color-bg-warm)]"
              >
                {children}
              </EditableLink>
            ),
            (children: ReactNode) => (
              <EditableLink
                key="cta-2"
                contentKey={shareHrefKey}
                defaultHref={shareDefaultHref}
                page={page}
                section="cta"
                className="block rounded-2xl border border-[var(--color-border)] bg-white p-6 transition-colors hover:bg-[var(--color-bg-warm)]"
              >
                {children}
              </EditableLink>
            ),
          ];

          return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {items.map((item, index) => {
                const icon = icons[index] || icons[0];
                const wrap = wrappers[index] || wrappers[0];
                return wrap(
                  <>
                    <div className={`w-11 h-11 rounded-full ${icon.colorClass} flex items-center justify-center mb-4`}>
                      <icon.Icon className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-bold text-[var(--color-text)] mb-2">
                      {item.title}
                    </h2>
                    <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                      {item.desc}
                    </p>
                  </>,
                );
              })}
            </div>
          );
        }}
      </EditableList>
    </section>
  );
}
