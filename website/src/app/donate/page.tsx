"use client";

// 영문판(src/app/en/donate/page.tsx)은 이 페이지의 Donate*Section 컴포넌트들을
// 공유하지 않고 UI를 따로 구현한다 — 그 컴포넌트들이 한국어 defaultValue와
// donate.* contentKey 네임스페이스에 언어 종속돼 있어, 공유하려면 실사용 중인
// 후원 페이지의 콘텐츠 플러밍을 통째로 재작업해야 하기 때문(트레이드오프 부적절
// 판단, 의도적 분리). 이 페이지의 시각적 변경은 영문판에도 수동으로 반영해야 한다.
import { useState } from "react";
import DonateBankTransferSection, {
  DONATION_BANK_ACCOUNT,
} from "@/components/donate/DonateBankTransferSection";
import DonateCampaignSection from "@/components/donate/DonateCampaignSection";
import DonateContactSection from "@/components/donate/DonateContactSection";
import DonateFundsSection from "@/components/donate/DonateFundsSection";
import DonateHeroSection from "@/components/donate/DonateHeroSection";
import DonateMonthlySection from "@/components/donate/DonateMonthlySection";
import DonateQuoteSection from "@/components/donate/DonateQuoteSection";
import DonateToast from "@/components/donate/DonateToast";

export default function DonatePage() {
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  };

  const copyAccount = async () => {
    try {
      await navigator.clipboard.writeText(DONATION_BANK_ACCOUNT);
      showToast("복사되었습니다!");
    } catch {
      showToast("복사에 실패했습니다. 직접 복사해주세요.");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <DonateToast message={toastMessage} visible={toastVisible} />
      <DonateHeroSection />
      <DonateQuoteSection />

      <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 space-y-12">
        <DonateBankTransferSection onCopyAccount={copyAccount} />
        <DonateCampaignSection />
        <DonateFundsSection />
        <DonateMonthlySection />
        <DonateContactSection />
      </div>
    </div>
  );
}
