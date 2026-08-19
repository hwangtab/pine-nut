"use client";

import { EditableText } from "@/components/editable";

export default function DonateQuoteSection() {
  return (
    <div className="bg-[var(--color-bg)] py-8 px-4">
      <blockquote className="paper max-w-xl mx-auto px-6 py-5 text-center">
        <div className="relative z-[1] text-[var(--color-text)]">
          <EditableText
            contentKey="donate.quote.text"
            defaultValue={"\u201C여러분의 후원은 70대 어르신들이 매주 서울까지 버스를 타고 갈 수 있는 교통비가 됩니다\u201D"}
            as="p"
            page="donate"
            section="quote"
            className="text-[15px] sm:text-base leading-relaxed font-medium italic"
          />
          <EditableText
            contentKey="donate.quote.attribution"
            defaultValue="— 풍천리 주민"
            as="footer"
            page="donate"
            section="quote"
            className="mt-2 font-hand text-lg text-[var(--color-text-muted)]"
          />
        </div>
      </blockquote>
    </div>
  );
}
