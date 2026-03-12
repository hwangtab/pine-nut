import type { Metadata } from "next";
import UtilityHeader from "@/components/UtilityHeader";
import { EditableLink, EditableRichText, EditableText } from "@/components/editable";
import {
  EnglishPrivacyPurposeList,
  EnglishPrivacyRightsList,
} from "./EnglishPrivacySectionsClient";

export const metadata: Metadata = {
  title: "Privacy Policy — Save Pungcheon-ri",
  description:
    "How the Save Pungcheon-ri website collects, uses, and stores personal information.",
  alternates: {
    canonical: "/en/privacy",
    languages: {
      en: "/en/privacy",
      ko: "/privacy",
    },
  },
};

export default function EnglishPrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <UtilityHeader
        title={<EditableText contentKey="en.privacy.header.title" defaultValue="Privacy Policy" as="span" page="en/privacy" section="header" />}
        subtitle={<EditableText contentKey="en.privacy.header.subtitle" defaultValue="Last updated: March 10, 2026" as="span" page="en/privacy" section="header" />}
        eyebrow={<EditableText contentKey="en.privacy.header.eyebrow" defaultValue="Legal Notice" as="span" page="en/privacy" section="header" />}
        tone="warm"
      />

      <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 md:p-10 space-y-10">
          <EditableRichText
            contentKey="en.privacy.intro"
            defaultValue={`The Save Pungcheon-ri website values and protects personal information. This policy explains what data we collect, why we collect it, how long we retain it, and what rights users have.`}
            page="en/privacy"
            section="intro"
            renderMode="paragraph"
            className="text-[var(--color-text)] leading-relaxed"
          />

          <section>
            <EditableText contentKey="en.privacy.section1.title" defaultValue="1. Information We Collect" as="h2" page="en/privacy" section="section1" className="text-xl font-bold text-[var(--color-forest)] mb-4" />
            <div className="space-y-4">
              <div className="bg-[var(--color-bg)] rounded-xl p-5">
                <EditableText contentKey="en.privacy.section1.signupTitle" defaultValue="When signing the petition" as="h3" page="en/privacy" section="section1" className="font-semibold text-[var(--color-text)] mb-2" />
                <EditableRichText contentKey="en.privacy.section1.signupContent" defaultValue="Name, email address, and an optional message of support" page="en/privacy" section="section1" renderMode="paragraph" className="text-[var(--color-text-muted)] text-[15px] leading-relaxed" />
              </div>
              <div className="bg-[var(--color-bg)] rounded-xl p-5">
                <EditableText contentKey="en.privacy.section1.autoTitle" defaultValue="Automatically collected website data" as="h3" page="en/privacy" section="section1" className="font-semibold text-[var(--color-text)] mb-2" />
                <EditableRichText contentKey="en.privacy.section1.autoContent" defaultValue="Pages visited, time spent, and browser information collected anonymously through analytics tools" page="en/privacy" section="section1" renderMode="paragraph" className="text-[var(--color-text-muted)] text-[15px] leading-relaxed" />
              </div>
            </div>
          </section>

          <section>
            <EditableText contentKey="en.privacy.section2.title" defaultValue="2. Purpose of Collection" as="h2" page="en/privacy" section="section2" className="text-xl font-bold text-[var(--color-forest)] mb-4" />
            <EnglishPrivacyPurposeList />
          </section>

          <section>
            <EditableText contentKey="en.privacy.section3.title" defaultValue="3. Retention Period" as="h2" page="en/privacy" section="section3" className="text-xl font-bold text-[var(--color-forest)] mb-4" />
            <EditableRichText contentKey="en.privacy.section3.content" defaultValue="Collected personal information is retained until the campaign ends and deleted without delay afterward. If a user requests deletion earlier, the data will be removed within seven days of the request." page="en/privacy" section="section3" renderMode="paragraph" className="text-[var(--color-text)] text-[15px] leading-relaxed" />
          </section>

          <section>
            <EditableText contentKey="en.privacy.section4.title" defaultValue="4. Third-Party Sharing" as="h2" page="en/privacy" section="section4" className="text-xl font-bold text-[var(--color-forest)] mb-4" />
            <EditableRichText contentKey="en.privacy.section4.content" defaultValue="We do not provide collected personal information to third parties except where required by law or where a user has given prior consent." page="en/privacy" section="section4" renderMode="paragraph" className="text-[var(--color-text)] text-[15px] leading-relaxed" />
          </section>

          <section>
            <EditableText contentKey="en.privacy.section5.title" defaultValue="5. Your Rights" as="h2" page="en/privacy" section="section5" className="text-xl font-bold text-[var(--color-forest)] mb-4" />
            <EditableRichText contentKey="en.privacy.section5.intro" defaultValue="Users may exercise the following rights at any time." page="en/privacy" section="section5" renderMode="paragraph" className="text-[var(--color-text)] text-[15px] leading-relaxed mb-4" />
            <EnglishPrivacyRightsList />
          </section>

          <section>
            <EditableText contentKey="en.privacy.section6.title" defaultValue="6. Contact" as="h2" page="en/privacy" section="section6" className="text-xl font-bold text-[var(--color-forest)] mb-4" />
            <EditableRichText contentKey="en.privacy.section6.intro" defaultValue="For privacy-related questions or requests, please contact us through the following channels." page="en/privacy" section="section6" renderMode="paragraph" className="text-[var(--color-text)] text-[15px] leading-relaxed mb-4" />
            <div className="bg-[var(--color-bg)] rounded-xl p-5 space-y-2">
              <p className="text-[var(--color-text)] text-[15px]">
                <strong>
                  <EditableText contentKey="en.privacy.section6.campaignLabel" defaultValue="Campaign page:" as="span" page="en/privacy" section="section6" />
                </strong>{" "}
                <EditableLink contentKey="en.privacy.section6.campaignHref" defaultHref="https://campaigns.do/campaigns/1328" page="en/privacy" section="section6" inline className="text-[var(--color-sky)] underline underline-offset-2 hover:text-[var(--color-sky)]/80 transition-colors">
                  campaigns.do/campaigns/1328
                </EditableLink>
              </p>
              <p className="text-[var(--color-text)] text-[15px]">
                <strong>
                  <EditableText contentKey="en.privacy.section6.phoneLabel" defaultValue="Phone:" as="span" page="en/privacy" section="section6" />
                </strong>{" "}
                <EditableLink contentKey="en.privacy.section6.phoneHref" defaultHref="tel:010-8918-8933" page="en/privacy" section="section6" inline className="text-[var(--color-sky)] underline underline-offset-2 hover:text-[var(--color-sky)]/80 transition-colors">
                  <EditableText contentKey="en.privacy.section6.phoneValue" defaultValue="010-8918-8933 (Lee Chang-hoo, campaign coordinator)" as="span" page="en/privacy" section="section6" />
                </EditableLink>
              </p>
            </div>
          </section>
        </div>

        <div className="mt-8 text-center">
          <EditableLink
            contentKey="en.privacy.backHref"
            defaultHref="/en"
            page="en/privacy"
            section="footer"
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-[15px] underline underline-offset-4 transition-colors"
          >
            <EditableText contentKey="en.privacy.back" defaultValue="Back to home" as="span" page="en/privacy" section="footer" />
          </EditableLink>
        </div>
      </div>
    </div>
  );
}
