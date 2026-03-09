"use client";

import { useState } from "react";
import { Copy, Check, Phone, Mail } from "lucide-react";

/* ──────────────────────── Demo transparency data ──────────────────────── */
const MONTHLY_DATA = [
  { month: "2026년 1월", income: "2,340,000", expense: "1,870,000", purpose: "상경 집회 교통비, 현수막 제작" },
  { month: "2025년 12월", income: "1,980,000", expense: "1,650,000", purpose: "변호사 상담료, 인쇄물 제작" },
  { month: "2025년 11월", income: "3,120,000", expense: "2,410,000", purpose: "행정소송 착수금, 교통비" },
  { month: "2025년 10월", income: "1,540,000", expense: "1,320,000", purpose: "피켓·현수막, 운영비" },
];

const FUND_BREAKDOWN = [
  { label: "교통비 (집회·상경 투쟁)", percent: 40, color: "var(--color-warm)" },
  { label: "법률 비용", percent: 30, color: "var(--color-forest)" },
  { label: "홍보물 제작", percent: 15, color: "var(--color-sky)" },
  { label: "운영비", percent: 15, color: "var(--color-earth)" },
];

/* ──────────────────────── Toast Notification ──────────────────────── */
function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 bg-[var(--color-text)] text-white px-5 py-3 rounded-xl shadow-lg text-[15px] font-medium">
        <Check className="w-4 h-4 shrink-0" />
        {message}
      </div>
    </div>
  );
}

/* ──────────────────────── Main Page ──────────────────────── */
export default function DonatePage() {
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const ACCOUNT_NUMBER = "000-0000-0000-00";

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  };

  const handleCopyAccount = async () => {
    try {
      await navigator.clipboard.writeText(ACCOUNT_NUMBER);
      showToast("계좌번호가 복사되었습니다.");
    } catch {
      showToast("복사에 실패했습니다. 직접 복사해주세요.");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Toast message={toastMessage} visible={toastVisible} />

      {/* ── Header ── */}
      <section className="bg-[var(--color-bg-warm)] py-16 sm:py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--color-text)] mb-3">
            후원으로 함께해주세요
          </h1>
          <p className="text-lg text-[var(--color-text-muted)]">
            주민들의 투쟁을 직접 도울 수 있습니다
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 space-y-16">
        {/* ── Bank Transfer Card ── */}
        <section aria-label="후원 계좌 안내">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-[var(--color-text)]">
            후원 계좌 안내
          </h2>
          <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 sm:p-8">
            <dl className="space-y-4">
              <div className="flex items-center gap-3">
                <dt className="text-[var(--color-text-muted)] text-[15px] w-20 shrink-0">
                  은행명
                </dt>
                <dd className="font-semibold text-[var(--color-text)]">농협은행</dd>
              </div>
              <div className="flex items-center gap-3">
                <dt className="text-[var(--color-text-muted)] text-[15px] w-20 shrink-0">
                  계좌번호
                </dt>
                <dd className="font-semibold text-[var(--color-text)] font-mono text-lg tracking-wide">
                  {ACCOUNT_NUMBER}
                </dd>
              </div>
              <div className="flex items-center gap-3">
                <dt className="text-[var(--color-text-muted)] text-[15px] w-20 shrink-0">
                  예금주
                </dt>
                <dd className="font-semibold text-[var(--color-text)]">풍천리 주민회</dd>
              </div>
            </dl>
            <button
              onClick={handleCopyAccount}
              className="mt-6 w-full min-h-[52px] rounded-xl bg-[var(--color-warm)] hover:bg-[var(--color-warm-light)] text-white font-bold text-lg flex items-center justify-center gap-2 transition-colors"
              aria-label="계좌번호 복사하기"
            >
              <Copy className="w-5 h-5" />
              계좌번호 복사
            </button>
          </div>
        </section>

        {/* ── How Funds Are Used ── */}
        <section aria-label="후원금 사용 내역">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-[var(--color-text)]">
            후원금은 이렇게 사용됩니다
          </h2>
          <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 sm:p-8">
            {/* Visual bar breakdown */}
            <div className="space-y-5 mb-8">
              {FUND_BREAKDOWN.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[15px] font-medium text-[var(--color-text)]">
                      {item.label}
                    </span>
                    <span className="text-[15px] font-bold" style={{ color: item.color }}>
                      {item.percent}%
                    </span>
                  </div>
                  <div
                    className="h-3 rounded-full bg-gray-100 overflow-hidden"
                    role="progressbar"
                    aria-valuenow={item.percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${item.label}: ${item.percent}%`}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${item.percent}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Transparency note */}
            <div className="bg-[var(--color-bg-warm)] rounded-xl px-5 py-4">
              <p className="text-[15px] text-[var(--color-text)] font-medium">
                후원금 사용 내역은 매월 이 페이지에 공개됩니다.
              </p>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                주민 여러분의 소중한 후원금이 어디에 쓰이는지 투명하게 공개합니다.
              </p>
            </div>
          </div>
        </section>

        {/* ── Transparency Table ── */}
        <section aria-label="월별 후원금 내역">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-[var(--color-text)]">
            월별 후원금 내역
          </h2>
          <div className="bg-white border border-[var(--color-border)] rounded-2xl overflow-hidden">
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
                    <th className="px-6 py-4 text-[15px] font-semibold text-[var(--color-text)]">
                      월
                    </th>
                    <th className="px-6 py-4 text-[15px] font-semibold text-[var(--color-text)] text-right">
                      수입 (원)
                    </th>
                    <th className="px-6 py-4 text-[15px] font-semibold text-[var(--color-text)] text-right">
                      지출 (원)
                    </th>
                    <th className="px-6 py-4 text-[15px] font-semibold text-[var(--color-text)]">
                      주요 용도
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {MONTHLY_DATA.map((row, i) => (
                    <tr
                      key={row.month}
                      className={
                        i < MONTHLY_DATA.length - 1
                          ? "border-b border-[var(--color-border)]"
                          : ""
                      }
                    >
                      <td className="px-6 py-4 text-[15px] text-[var(--color-text)] font-medium whitespace-nowrap">
                        {row.month}
                      </td>
                      <td className="px-6 py-4 text-[15px] text-[var(--color-forest)] font-semibold text-right font-mono">
                        {row.income}
                      </td>
                      <td className="px-6 py-4 text-[15px] text-[var(--color-warm)] font-semibold text-right font-mono">
                        {row.expense}
                      </td>
                      <td className="px-6 py-4 text-[15px] text-[var(--color-text-muted)]">
                        {row.purpose}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-[var(--color-border)]">
              {MONTHLY_DATA.map((row) => (
                <div key={row.month} className="px-5 py-5 space-y-3">
                  <p className="font-semibold text-[var(--color-text)]">{row.month}</p>
                  <div className="flex justify-between">
                    <span className="text-sm text-[var(--color-text-muted)]">수입</span>
                    <span className="font-semibold text-[var(--color-forest)] font-mono">
                      {row.income}원
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[var(--color-text-muted)]">지출</span>
                    <span className="font-semibold text-[var(--color-warm)] font-mono">
                      {row.expense}원
                    </span>
                  </div>
                  <p className="text-sm text-[var(--color-text-muted)]">{row.purpose}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Bottom Notes ── */}
        <section
          className="bg-white border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 space-y-6"
          aria-label="안내사항"
        >
          <div className="bg-[var(--color-bg)] rounded-xl px-5 py-4">
            <p className="text-[15px] text-[var(--color-text-muted)]">
              간편결제(카카오페이, 토스페이) 연동은 준비 중입니다.
              <br />
              빠른 시일 내에 더 편리한 후원 방법을 마련하겠습니다.
            </p>
          </div>

          <div>
            <p className="text-[15px] font-semibold text-[var(--color-text)] mb-3">
              후원 관련 문의
            </p>
            <div className="space-y-2">
              <a
                href="tel:010-0000-0000"
                className="flex items-center gap-3 text-[15px] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors min-h-[44px]"
              >
                <Phone className="w-4 h-4 shrink-0" />
                010-0000-0000 (풍천리 주민회)
              </a>
              <a
                href="mailto:pungcheon@example.com"
                className="flex items-center gap-3 text-[15px] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors min-h-[44px]"
              >
                <Mail className="w-4 h-4 shrink-0" />
                pungcheon@example.com
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
