"use client";

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
