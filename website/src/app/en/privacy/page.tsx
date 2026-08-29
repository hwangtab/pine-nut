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
        subtitle={<EditableText contentKey="en.privacy.header.subtitle" defaultValue="Last updated: August 28, 2026" as="span" page="en/privacy" section="header" />}
        eyebrow={<EditableText contentKey="en.privacy.header.eyebrow" defaultValue="Legal Notice" as="span" page="en/privacy" section="header" />}
        tone="warm"
      />

      <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-panel)] shadow-card p-6 sm:p-8 md:p-10 space-y-10">
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
              <div className="bg-[var(--color-bg)] rounded-[var(--radius-card)] p-5">
                <EditableText contentKey="en.privacy.section1.signupTitle" defaultValue="When joining the National Solidarity Petition" as="h3" page="en/privacy" section="section1" className="font-semibold text-[var(--color-text)] mb-2" />
                <EditableRichText contentKey="en.privacy.section1.signupContent" defaultValue="We collect your name or nickname (required), region of residence — province/city and county/district (required), affiliated organization or group (optional), email address (optional), and a message or suggestion (optional), together with your consent on whether your name may be published (required). If you provide an email address, we use it only to update you on campaign progress. Participants must confirm they are at least 14 years old." page="en/privacy" section="section1" renderMode="paragraph" className="text-[var(--color-text-muted)] text-[15px] leading-relaxed" />
              </div>
              <div className="bg-[var(--color-bg)] rounded-[var(--radius-card)] p-5">
                <EditableText contentKey="en.privacy.section1.wallTitle" defaultValue="Publication of the signer list" as="h3" page="en/privacy" section="section1" className="font-semibold text-[var(--color-text)] mb-2" />
                <EditableRichText contentKey="en.privacy.section1.wallContent" defaultValue="If you consent to publish your name, your name or nickname, your region of residence (province/city and county/district), and the date you signed are shown in the signer list at the bottom of the /petition page. Your email address, affiliation, message, and access information are never published. If you do not consent, your signature still counts toward the total signature count but will not appear in the list. Signatures received before August 28, 2026 (65 signatures) did not collect region information and are not included in the list, though they remain counted in the total." page="en/privacy" section="section1" renderMode="paragraph" className="text-[var(--color-text-muted)] text-[15px] leading-relaxed" />
              </div>
              <div className="bg-[var(--color-bg)] rounded-[var(--radius-card)] p-5">
                <EditableText contentKey="en.privacy.section1.antiAbuseTitle" defaultValue="Automatically collected information for abuse prevention" as="h3" page="en/privacy" section="section1" className="font-semibold text-[var(--color-text)] mb-2" />
                <EditableRichText contentKey="en.privacy.section1.antiAbuseContent" defaultValue="If you provide an email address, we check it for duplicate signatures. Separately, to limit repeated submissions from the same IP address within a short window (60 seconds), we hash your IP address and store only the hash — the original IP address is never stored." page="en/privacy" section="section1" renderMode="paragraph" className="text-[var(--color-text-muted)] text-[15px] leading-relaxed" />
              </div>
              <div className="bg-[var(--color-bg)] rounded-[var(--radius-card)] p-5">
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
            <EditableRichText contentKey="en.privacy.section3.content" defaultValue="Personal information related to the solidarity petition is retained until the purposes of the petition and related public advocacy activities have been achieved, and is deleted without delay afterward. If a user requests deletion earlier, the data will be removed within seven days of the request." page="en/privacy" section="section3" renderMode="paragraph" className="text-[var(--color-text)] text-[15px] leading-relaxed" />
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
            <div className="bg-[var(--color-bg)] rounded-[var(--radius-card)] p-5 space-y-2">
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
