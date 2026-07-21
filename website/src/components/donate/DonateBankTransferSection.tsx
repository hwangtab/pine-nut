"use client";

import { Copy } from "lucide-react";
import { EditableText } from "@/components/editable";

export const DONATION_BANK_ACCOUNT = "356-1559-4666-63";
export const DONATION_BANK_ACCOUNT_FULL = "농협 356-1559-4666-63 이창후";

interface DonateBankTransferSectionProps {
  onCopyAccount: () => void;
}

export default function DonateBankTransferSection({
  onCopyAccount,
}: DonateBankTransferSectionProps) {
  return (
    <section aria-label="계좌 이체로 후원하기">
      <EditableText
        contentKey="donate.bank.heading"
        defaultValue="계좌이체로 후원하기"
        as="h2"
        page="donate"
        section="bank"
        className="text-xl sm:text-2xl font-bold mb-6 text-[var(--color-text)] text-center"
      />
      <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-panel)] p-6 sm:p-8 shadow-card">
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--color-bg-warm)] mb-3">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[var(--color-warm)]"
            >
              <rect x="2" y="6" width="20" height="14" rx="2" />
              <path d="M2 10h20" />
              <path d="M6 14h.01" />
              <path d="M10 14h4" />
            </svg>
          </div>
          <EditableText
            contentKey="donate.bank.label"
            defaultValue="농협 | 이창후"
            as="p"
            page="donate"
            section="bank"
            className="text-sm text-[var(--color-text-muted)] font-medium"
          />
        </div>

        <div className="bg-[var(--color-bg)] rounded-[var(--radius-card)] px-5 py-4 mb-4 text-center">
          <EditableText
            contentKey="donate.bank.accountLabel"
            defaultValue="후원 계좌"
            as="p"
            page="donate"
            section="bank"
            className="text-sm text-[var(--color-text-muted)] mb-1"
          />
          <p className="text-2xl sm:text-3xl font-black text-[var(--color-text)] tracking-wide">
            {DONATION_BANK_ACCOUNT}
          </p>
        </div>

        <button
          type="button"
          onClick={onCopyAccount}
          className="w-full min-h-[56px] rounded-full bg-[var(--color-warm)] hover:bg-[var(--color-warm-light)] active:scale-[0.98] text-white font-bold text-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Copy className="w-5 h-5" />
          <EditableText
            contentKey="donate.bank.copy"
            defaultValue="계좌번호 복사"
            as="span"
            page="donate"
            section="bank"
          />
        </button>

        <p className="text-center text-xs text-[var(--color-text-muted)] mt-3">
          {DONATION_BANK_ACCOUNT_FULL}
        </p>
      </div>
    </section>
  );
}
