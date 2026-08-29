"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { PETITION_FAQ } from "@/lib/petition-faq";

/**
 * 답변은 접혀 있을 때도 DOM에 남는다 — 언마운트하지 않고 `aria-hidden`만
 * 토글하고 `grid-template-rows: 0fr ↔ 1fr`로 접는다. layout.tsx의 `FAQPage`
 * JSON-LD가 같은 상수(PETITION_FAQ)를 그대로 주장하기 때문에, 답변이 DOM에서
 * 사라지면 구조화 데이터가 "본문에 없는 내용"을 주장하는 상태가 된다.
 */
export default function PetitionFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section aria-label="자주 묻는 질문" className="space-y-3">
      <h2 className="text-left font-serif-display font-bold text-xl sm:text-2xl mb-2 text-[var(--color-text)]">
        자주 묻는 질문
      </h2>
      {PETITION_FAQ.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `petition-faq-panel-${index}`;
        const buttonId = `petition-faq-button-${index}`;

        return (
          <div key={item.q} className="paper px-5 py-4">
            <div className="relative z-[1]">
              <h3>
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-3 text-left font-semibold text-[var(--color-text)] min-h-[44px]"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 shrink-0 text-[var(--color-text-muted)] transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>
              </h3>
              <div
                className="grid transition-[grid-template-rows] duration-300 ease-out"
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
              >
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  aria-hidden={!isOpen}
                  className="overflow-hidden"
                >
                  <p className="pt-3 text-[15px] text-[var(--color-text-muted)] leading-relaxed break-keep">
                    {item.a}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
