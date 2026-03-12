"use client";

import { useState } from "react";
import { Bus, Check, Copy, ExternalLink, Megaphone, Scale, Settings } from "lucide-react";
import SubHero from "@/components/SubHero";
import { EditableLink, EditableList, EditableText } from "@/components/editable";

const BANK_ACCOUNT = "356-1559-4666-63";
const BANK_ACCOUNT_FULL = "NongHyup 356-1559-4666-63 Lee Chang-hoo";

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

export default function EnglishDonatePage() {
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  };

  const copyAccount = async () => {
    try {
      await navigator.clipboard.writeText(BANK_ACCOUNT);
      showToast("Copied.");
    } catch {
      showToast("Copy failed. Please copy it manually.");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Toast message={toastMessage} visible={toastVisible} />

      <SubHero
        imageUrl="https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/1016/IE003535383_STD.jpg"
        imageContentKey="en.donate.hero.image"
        imagePage="en/donate"
        imageSection="hero"
        title={<EditableText contentKey="en.donate.hero.title" defaultValue="Support the Residents Directly" as="span" page="en/donate" section="hero" />}
        subtitle={<EditableText contentKey="en.donate.hero.subtitle" defaultValue="Your donation helps cover transport, legal costs, and campaign work needed to keep this struggle going." as="span" page="en/donate" section="hero" />}
        eyebrow={<EditableText contentKey="en.donate.hero.eyebrow" defaultValue="Donate" as="span" page="en/donate" section="hero" />}
      />

      <div className="bg-[var(--color-bg-warm)] py-8 px-4">
        <blockquote className="max-w-xl mx-auto bg-white/80 backdrop-blur-sm border border-[var(--color-border)] rounded-2xl px-6 py-5 text-[var(--color-text)] text-center">
          <EditableText
            contentKey="en.donate.quote.text"
            defaultValue="Your support helps elderly residents travel to Seoul for protests and hearings."
            as="p"
            page="en/donate"
            section="quote"
            className="text-[15px] sm:text-base leading-relaxed font-medium italic"
          />
          <EditableText
            contentKey="en.donate.quote.attribution"
            defaultValue="— Resident of Pungcheon-ri"
            as="footer"
            page="en/donate"
            section="quote"
            className="mt-2 text-sm text-[var(--color-text-muted)]"
          />
        </blockquote>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 space-y-12">
        <section aria-label="Donate by bank transfer">
          <EditableText contentKey="en.donate.bank.heading" defaultValue="Donate by bank transfer" as="h2" page="en/donate" section="bank" className="text-xl sm:text-2xl font-bold mb-6 text-[var(--color-text)] text-center" />
          <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="text-center mb-5">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--color-bg-warm)] mb-3">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-warm)]">
                  <rect x="2" y="6" width="20" height="14" rx="2" />
                  <path d="M2 10h20" />
                  <path d="M6 14h.01" />
                  <path d="M10 14h4" />
                </svg>
              </div>
              <EditableText contentKey="en.donate.bank.label" defaultValue="NongHyup | Lee Chang-hoo" as="p" page="en/donate" section="bank" className="text-sm text-[var(--color-text-muted)] font-medium" />
            </div>

            <div className="bg-[var(--color-bg)] rounded-xl px-5 py-4 mb-4 text-center">
              <EditableText contentKey="en.donate.bank.accountLabel" defaultValue="Donation account" as="p" page="en/donate" section="bank" className="text-sm text-[var(--color-text-muted)] mb-1" />
              <p className="text-2xl sm:text-3xl font-black text-[var(--color-text)] tracking-wide">
                {BANK_ACCOUNT}
              </p>
            </div>

            <button
              onClick={copyAccount}
              className="w-full min-h-[56px] rounded-xl bg-[var(--color-warm)] hover:brightness-110 active:scale-[0.98] text-white font-bold text-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Copy className="w-5 h-5" />
              <EditableText contentKey="en.donate.bank.copy" defaultValue="Copy account number" as="span" page="en/donate" section="bank" />
            </button>

            <p className="text-center text-xs text-[var(--color-text-muted)] mt-3">
              {BANK_ACCOUNT_FULL}
            </p>
          </div>
        </section>

        <section aria-label="Alternative donation path">
          <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 text-center">
            <EditableText contentKey="en.donate.campaign.text" defaultValue="You can also donate or contact the campaign through the official campaigns.do page." as="p" page="en/donate" section="campaign" className="text-[15px] text-[var(--color-text)] font-medium mb-4" />
            <EditableLink contentKey="en.donate.campaign.href" defaultHref="https://campaigns.do/campaigns/1328" page="en/donate" section="campaign" className="inline-flex items-center justify-center gap-2 min-h-[48px] px-8 rounded-xl bg-[var(--color-text)] hover:bg-[var(--color-text)]/90 text-white font-bold text-base transition-colors">
              <ExternalLink className="w-5 h-5" />
              <EditableText contentKey="en.donate.campaign.link" defaultValue="Open campaign page" as="span" page="en/donate" section="campaign" />
            </EditableLink>
          </div>
        </section>

        <section aria-label="How donations will be used">
          <EditableText contentKey="en.donate.funds.heading" defaultValue="How donations are used" as="h2" page="en/donate" section="funds" className="text-xl sm:text-2xl font-bold mb-6 text-[var(--color-text)]" />
          <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 sm:p-8">
            <EditableText contentKey="en.donate.funds.disclaimer" defaultValue="The breakdown below is a proposed plan and may change depending on actual campaign needs." as="p" page="en/donate" section="funds" className="text-sm text-[var(--color-text-muted)] mb-6" />
            <EditableList
              contentKey="en.donate.funds.items"
              defaultItems={[
                { label: "Transport for protests and travel to Seoul", percent: "40" },
                { label: "Legal costs", percent: "30" },
                { label: "Printed campaign materials", percent: "15" },
                { label: "Basic operations", percent: "15" },
              ]}
              page="en/donate"
              section="funds"
              fields={[
                { key: "label", label: "Label" },
                { key: "percent", label: "Percent" },
              ]}
            >
              {(items) => {
                const iconMap = [Bus, Scale, Megaphone, Settings];
                const colorMap = ["var(--color-warm)", "var(--color-forest)", "var(--color-sky)", "var(--color-earth)"];

                return (
                  <div className="space-y-5 mb-8">
                    {items.map((item, index) => {
                      const Icon = iconMap[index] || iconMap[0];
                      const color = colorMap[index] || colorMap[0];
                      const percent = parseInt(item.percent, 10) || 0;

                      return (
                        <div key={index}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="flex items-center gap-2 text-[15px] font-medium text-[var(--color-text)]">
                              <Icon className="w-4 h-4 shrink-0" style={{ color }} />
                              {item.label}
                            </span>
                            <span className="text-[15px] font-bold" style={{ color }}>
                              {percent}%
                            </span>
                          </div>
                          <div className="h-3 rounded-full bg-[var(--color-bg)] overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${percent}%`, backgroundColor: color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              }}
            </EditableList>
          </div>
        </section>
      </div>
    </div>
  );
}
