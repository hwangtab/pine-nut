"use client";

import { useState } from "react";
import {
  Check,
  ExternalLink,
  Copy,
  Bus,
  Scale,
  Megaphone,
  Settings,
} from "lucide-react";
import SubHero from "@/components/SubHero";

/* ──────────────────────── Demo transparency data ──────────────────────── */
const FUND_BREAKDOWN = [
  {
    label: "교통비 (집회·상경 투쟁)",
    percent: 40,
    color: "var(--color-warm)",
    icon: Bus,
  },
  {
    label: "법률 비용",
    percent: 30,
    color: "var(--color-forest)",
    icon: Scale,
  },
  {
    label: "홍보물 제작",
    percent: 15,
    color: "var(--color-sky)",
    icon: Megaphone,
  },
  {
    label: "운영비",
    percent: 15,
    color: "var(--color-earth)",
    icon: Settings,
  },
];

const BANK_ACCOUNT = "356-1559-4666-63";
const BANK_ACCOUNT_FULL = "농협 356-1559-4666-63 이창후";

/* ──────────────────────── Toast Notification ──────────────────────── */
function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
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

  const copyAccount = async () => {
    try {
      await navigator.clipboard.writeText(BANK_ACCOUNT);
      showToast("복사되었습니다!");
    } catch {
      showToast("복사에 실패했습니다. 직접 복사해주세요.");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Toast message={toastMessage} visible={toastVisible} />

      <SubHero
        imageUrl="https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/1016/IE003535383_STD.jpg"
        title="후원으로 함께해주세요"
        subtitle="주민들의 투쟁을 직접 도울 수 있습니다"
        eyebrow="후원 안내"
      />

      <div className="bg-[var(--color-bg-warm)] py-8 px-4">
        <blockquote className="max-w-xl mx-auto bg-white/80 backdrop-blur-sm border border-[var(--color-border)] rounded-2xl px-6 py-5 text-[var(--color-text)] text-center">
          <p className="text-[15px] sm:text-base leading-relaxed font-medium italic">
            {"\u201C"}여러분의 후원은 70대 어르신들이 매주 서울까지 버스를 타고
            갈 수 있는 교통비가 됩니다{"\u201D"}
          </p>
          <footer className="mt-2 text-sm text-[var(--color-text-muted)]">
            — 풍천리 주민
          </footer>
        </blockquote>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 space-y-12">
        {/* ── Primary CTA: Bank Transfer ── */}
        <section aria-label="계좌 이체로 후원하기">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-[var(--color-text)] text-center">
            지금 바로 후원하기
          </h2>
          <div className="bg-white border-2 border-[var(--color-warm)] rounded-2xl p-6 sm:p-8 shadow-sm">
            {/* Bank icon + label */}
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
              <p className="text-sm text-[var(--color-text-muted)] font-medium">
                계좌 이체
              </p>
            </div>

            {/* Account display */}
            <div className="bg-[var(--color-bg)] rounded-xl px-5 py-4 mb-4 text-center">
              <p className="text-sm text-[var(--color-text-muted)] mb-1">
                농협 | 이창후
              </p>
              <p className="text-2xl sm:text-3xl font-black text-[var(--color-text)] tracking-wide">
                {BANK_ACCOUNT}
              </p>
            </div>

            {/* Copy button */}
            <button
              onClick={copyAccount}
              className="w-full min-h-[56px] rounded-xl bg-[var(--color-warm)] hover:brightness-110 active:scale-[0.98] text-white font-bold text-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Copy className="w-5 h-5" />
              계좌번호 복사
            </button>

            <p className="text-center text-xs text-[var(--color-text-muted)] mt-3">
              {BANK_ACCOUNT_FULL}
            </p>
          </div>
        </section>

        {/* ── Quick Payment Links ── */}
        <section aria-label="간편 결제">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-[var(--color-text)] text-center">
            간편하게 후원하기
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 카카오페이 */}
            <a
              href="https://campaigns.do/campaigns/1328"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 min-h-[56px] rounded-xl font-bold text-lg transition-all hover:brightness-95 active:scale-[0.98]"
              style={{ backgroundColor: "#FEE500", color: "#191919" }}
            >
              <span className="text-xl" aria-hidden="true">
                💬
              </span>
              카카오페이 송금
              <ExternalLink className="w-4 h-4 opacity-50" />
            </a>

            {/* 토스 */}
            <a
              href="https://campaigns.do/campaigns/1328"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 min-h-[56px] rounded-xl font-bold text-lg transition-all hover:brightness-110 active:scale-[0.98]"
              style={{ backgroundColor: "#0064FF", color: "#FFFFFF" }}
            >
              <span className="text-xl" aria-hidden="true">
                💙
              </span>
              토스 송금
              <ExternalLink className="w-4 h-4 opacity-50" />
            </a>
          </div>
          <p className="text-center text-xs text-[var(--color-text-muted)] mt-3">
            현재 빠띠 캠페인 페이지를 통해 후원하실 수 있습니다
          </p>
        </section>

        {/* ── Campaign Page Link ── */}
        <section aria-label="빠띠 캠페인">
          <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 text-center">
            <p className="text-[15px] text-[var(--color-text)] font-medium mb-4">
              빠띠 캠페인 페이지에서도 후원 및 문의가 가능합니다
            </p>
            <a
              href="https://campaigns.do/campaigns/1328"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 min-h-[48px] px-8 rounded-xl bg-[var(--color-text)] hover:bg-[var(--color-text)]/90 text-white font-bold text-base transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
              빠띠 캠페인 페이지 방문
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
              * 아래는 후원금 사용 계획(안)이며, 실제 집행 시 변동될 수
              있습니다.
            </p>
            {/* Visual bar breakdown */}
            <div className="space-y-5 mb-8">
              {FUND_BREAKDOWN.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="flex items-center gap-2 text-[15px] font-medium text-[var(--color-text)]">
                        <Icon
                          className="w-4 h-4 shrink-0"
                          style={{ color: item.color }}
                        />
                        {item.label}
                      </span>
                      <span
                        className="text-[15px] font-bold"
                        style={{ color: item.color }}
                      >
                        {item.percent}%
                      </span>
                    </div>
                    <div
                      className="h-3 rounded-full bg-[var(--color-bg)] overflow-hidden"
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
                );
              })}
            </div>

            {/* Transparency note */}
            <div className="bg-[var(--color-bg-warm)] rounded-xl px-5 py-4">
              <p className="text-[15px] text-[var(--color-text)] font-medium">
                후원금 사용 내역은 정리 후 이 페이지에 공개됩니다.
              </p>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                주민 여러분의 소중한 후원금이 어디에 쓰이는지 확인 가능한
                형태로 투명하게 안내하겠습니다.
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
                후원금이 모이기 시작하면 매월 수입·지출 내역을 투명하게
                공개하겠습니다.
              </p>
            </div>
          </div>
        </section>

        {/* ── Bottom Notes ── */}
        <section
          className="bg-white border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 space-y-6"
          aria-label="안내사항"
        >
          <div>
            <p className="text-[15px] font-semibold text-[var(--color-text)] mb-3">
              후원 관련 문의
            </p>
            <div className="space-y-3">
              <a
                href="tel:010-8918-8933"
                className="flex items-center gap-3 text-[15px] text-[var(--color-text)] hover:text-[var(--color-warm)] transition-colors min-h-[44px]"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                010-8918-8933 (이창후 총무)
              </a>
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
