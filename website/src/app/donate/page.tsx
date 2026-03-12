"use client";

import { useState } from "react";
import {
  Bus,
  Check,
  Copy,
  ExternalLink,
  Megaphone,
  Scale,
  Settings,
} from "lucide-react";
import SubHero from "@/components/SubHero";
import { EditableLink, EditableList, EditableText } from "@/components/editable";

const BANK_ACCOUNT = "356-1559-4666-63";
const BANK_ACCOUNT_FULL = "농협 356-1559-4666-63 이창후";

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
        imageContentKey="donate.hero.image"
        imagePage="donate"
        imageSection="hero"
        title={<EditableText contentKey="donate.hero.title" defaultValue="후원으로 함께해주세요" as="span" page="donate" section="hero" />}
        subtitle={<EditableText contentKey="donate.hero.subtitle" defaultValue="계좌이체와 캠페인 페이지를 통해 주민들의 투쟁을 직접 도울 수 있습니다" as="span" page="donate" section="hero" />}
        eyebrow={<EditableText contentKey="donate.hero.eyebrow" defaultValue="후원 안내" as="span" page="donate" section="hero" />}
      />

      <div className="bg-[var(--color-bg-warm)] py-8 px-4">
        <blockquote className="max-w-xl mx-auto bg-white/80 backdrop-blur-sm border border-[var(--color-border)] rounded-2xl px-6 py-5 text-[var(--color-text)] text-center">
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
            className="mt-2 text-sm text-[var(--color-text-muted)]"
          />
        </blockquote>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 space-y-12">
        <section aria-label="계좌 이체로 후원하기">
          <EditableText
            contentKey="donate.bank.heading"
            defaultValue="계좌이체로 후원하기"
            as="h2"
            page="donate"
            section="bank"
            className="text-xl sm:text-2xl font-bold mb-6 text-[var(--color-text)] text-center"
          />
          <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 shadow-sm">
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

            <div className="bg-[var(--color-bg)] rounded-xl px-5 py-4 mb-4 text-center">
              <EditableText
                contentKey="donate.bank.accountLabel"
                defaultValue="후원 계좌"
                as="p"
                page="donate"
                section="bank"
                className="text-sm text-[var(--color-text-muted)] mb-1"
              />
              <p className="text-2xl sm:text-3xl font-black text-[var(--color-text)] tracking-wide">
                {BANK_ACCOUNT}
              </p>
            </div>

            <button
              onClick={copyAccount}
              className="w-full min-h-[56px] rounded-xl bg-[var(--color-warm)] hover:brightness-110 active:scale-[0.98] text-white font-bold text-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Copy className="w-5 h-5" />
              <EditableText contentKey="donate.bank.copy" defaultValue="계좌번호 복사" as="span" page="donate" section="bank" />
            </button>

            <p className="text-center text-xs text-[var(--color-text-muted)] mt-3">
              {BANK_ACCOUNT_FULL}
            </p>
          </div>
        </section>

        <section aria-label="다른 후원 경로">
          <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 text-center">
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
              className="inline-flex items-center justify-center gap-2 min-h-[48px] px-8 rounded-xl bg-[var(--color-text)] hover:bg-[var(--color-text)]/90 text-white font-bold text-base transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
              <EditableText contentKey="donate.campaign.link" defaultValue="빠띠 캠페인 페이지 방문" as="span" page="donate" section="campaign" />
            </EditableLink>
          </div>
        </section>

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
              {(items) => {
                const iconMap = [Bus, Scale, Megaphone, Settings];
                const colorMap = ["var(--color-warm)", "var(--color-forest)", "var(--color-sky)", "var(--color-earth)"];
                return (
                  <div className="space-y-5 mb-8">
                    {items.map((item, i) => {
                      const Icon = iconMap[i] || iconMap[0];
                      const color = colorMap[i] || colorMap[0];
                      const percent = parseInt(item.percent, 10) || 0;
                      return (
                        <div key={i}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="flex items-center gap-2 text-[15px] font-medium text-[var(--color-text)]">
                              <Icon className="w-4 h-4 shrink-0" style={{ color }} />
                              {item.label}
                            </span>
                            <span className="text-[15px] font-bold" style={{ color }}>
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
                );
              }}
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

        <section
          className="bg-white border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 space-y-6"
          aria-label="안내사항"
        >
          <div>
            <EditableText
              contentKey="donate.contact.heading"
              defaultValue="후원 관련 문의"
              as="p"
              page="donate"
              section="contact"
              className="text-[15px] font-semibold text-[var(--color-text)] mb-3"
            />
            <div className="space-y-3">
              <EditableLink
                contentKey="donate.contact.phoneHref"
                defaultHref="tel:010-8918-8933"
                page="donate"
                section="contact"
                className="flex items-center gap-3 text-[15px] text-[var(--color-text)] hover:text-[var(--color-warm)] transition-colors min-h-[44px]"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.79 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                010-8918-8933 (이창후 총무)
              </EditableLink>
              <EditableLink
                contentKey="donate.contact.campaignHref"
                defaultHref="https://campaigns.do/campaigns/1328"
                page="donate"
                section="contact"
                className="flex items-center gap-3 text-[15px] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors min-h-[44px]"
              >
                <ExternalLink className="w-4 h-4 shrink-0" />
                빠띠 캠페인 페이지를 통해 문의해주세요
              </EditableLink>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
