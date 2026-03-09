"use client";

import { useState } from "react";
import { Check, ExternalLink } from "lucide-react";

/* ──────────────────────── Demo transparency data ──────────────────────── */
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
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
        {/* ── Donation Guide Card ── */}
        <section aria-label="후원 안내">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-[var(--color-text)]">
            후원 안내
          </h2>
          <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 sm:p-8">
            <div className="bg-[var(--color-bg-warm)] rounded-xl px-5 py-4 mb-6">
              <p className="text-[15px] text-[var(--color-text)] font-medium">
                후원 계좌 안내를 위해 대책위원회에 문의해주세요.
              </p>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                빠띠 캠페인 페이지를 통해 후원 및 문의가 가능합니다.
              </p>
            </div>
            <a
              href="https://campaigns.do/campaigns/1328"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[52px] rounded-xl bg-[var(--color-warm)] hover:bg-[var(--color-warm-light)] text-white font-bold text-lg flex items-center justify-center gap-2 transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
              빠띠 캠페인 페이지에서 후원하기
            </a>
          </div>
        </section>

        {/* ── How Funds Are Used ── */}
        <section aria-label="후원금 사용 계획">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-[var(--color-text)]">
            후원금은 이렇게 사용됩니다
          </h2>
          <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 sm:p-8">
            <p className="text-sm text-[var(--color-text-muted)] mb-6">
              * 아래는 후원금 사용 계획(안)이며, 실제 집행 시 변동될 수 있습니다.
            </p>
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

        {/* ── Transparency Table (placeholder) ── */}
        <section aria-label="월별 후원금 내역">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-[var(--color-text)]">
            월별 후원금 내역
          </h2>
          <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 sm:p-8">
            <div className="bg-[var(--color-bg-warm)] rounded-xl px-5 py-4 text-center">
              <p className="text-[15px] text-[var(--color-text)] font-medium">
                후원금 사용 내역은 확정 후 공개 예정입니다.
              </p>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                후원금이 모이기 시작하면 매월 수입·지출 내역을 투명하게 공개하겠습니다.
              </p>
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
                href="https://campaigns.do/campaigns/1328"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-[15px] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors min-h-[44px]"
              >
                <ExternalLink className="w-4 h-4 shrink-0" />
                빠띠 캠페인 페이지를 통해 문의해주세요
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
