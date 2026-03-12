import type { Metadata } from "next";
import { ArrowRight, ExternalLink, FileText } from "lucide-react";
import SubHero from "@/components/SubHero";
import { EditableLink, EditableRichText, EditableText } from "@/components/editable";
import { SITE_URL } from "@/lib/site-config";
import { EnglishPressFactsSection } from "./EnglishPressSectionsClient";

const pressKitItems = [
  {
    title: "Press Release",
    description: "Campaign overview for journalists and partner organizations",
    icon: FileText,
    color: "text-[var(--color-forest)] bg-[var(--color-bg-warm)]",
    href: "/en/press/release",
  },
  {
    title: "Fact Sheet",
    description: "One-page summary of the key facts and numbers",
    icon: FileText,
    color: "text-[var(--color-warm)] bg-[var(--color-bg-warm)]",
    href: "/en/press/factsheet",
  },
];

export const metadata: Metadata = {
  title: "Press Kit — Save Pungcheon-ri",
  description:
    "English-language materials for journalists, researchers, and solidarity groups covering the struggle in Pungcheon-ri.",
  alternates: {
    canonical: "/en/press",
    languages: {
      en: "/en/press",
      ko: "/press",
    },
  },
};

export default function EnglishPressPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-bg)] to-white">
      <SubHero
        imageUrl="https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/1016/IE003535383_STD.jpg"
        fallbackImageUrl="https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/1016/IE003535387_STD.jpg"
        imageContentKey="en.press.hero.image"
        imagePage="en/press"
        imageSection="hero"
        title={<EditableText contentKey="en.press.hero.title" defaultValue="Press Kit" as="span" page="en/press" section="hero" />}
        subtitle={<EditableText contentKey="en.press.hero.subtitle" defaultValue="English-language materials for journalists, researchers, and international supporters" as="span" page="en/press" section="hero" />}
        eyebrow={<EditableText contentKey="en.press.hero.eyebrow" defaultValue="Media Archive" as="span" page="en/press" section="hero" />}
      />

      <div className="max-w-4xl mx-auto px-4 pt-12 md:pt-16 pb-20 space-y-16">
        <section>
          <EditableText
            contentKey="en.press.kit.title"
            defaultValue="Press Materials"
            as="h2"
            page="en/press"
            section="kit"
            className="text-xl md:text-2xl font-bold text-[var(--color-text)] mb-6"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pressKitItems.map((item, index) => {
              const Icon = item.icon;

              return (
                <EditableLink
                  key={item.title}
                  contentKey={`en.press.kit.item.${index}.href`}
                  defaultHref={item.href}
                  page="en/press"
                  section="kit"
                  className="group flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-[var(--color-border)] shadow-sm hover:shadow-md hover:border-[var(--color-forest)]/20 transition-all"
                >
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${item.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <EditableText
                    contentKey={`en.press.kit.item.${index}.title`}
                    defaultValue={item.title}
                    as="h3"
                    page="en/press"
                    section="kit"
                    className="text-base font-bold text-[var(--color-text)] mb-1"
                  />
                  <EditableText
                    contentKey={`en.press.kit.item.${index}.description`}
                    defaultValue={item.description}
                    as="p"
                    page="en/press"
                    section="kit"
                    className="text-sm text-[var(--color-text-muted)] mb-4 leading-relaxed"
                  />
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-forest)] group-hover:text-[var(--color-forest-light)] transition-colors">
                    <EditableText contentKey="en.press.kit.open" defaultValue="Open" as="span" page="en/press" section="kit" />
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </EditableLink>
              );
            })}
          </div>
        </section>

        <section>
          <EditableText
            contentKey="en.press.facts.title"
            defaultValue="Core Facts"
            as="h2"
            page="en/press"
            section="facts"
            className="text-xl md:text-2xl font-bold text-[var(--color-text)] mb-6"
          />
          <EnglishPressFactsSection />
        </section>

        <section>
          <EditableText
            contentKey="en.press.contact.title"
            defaultValue="Media Contact"
            as="h2"
            page="en/press"
            section="contact"
            className="text-xl md:text-2xl font-bold text-[var(--color-text)] mb-6"
          />
          <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm p-6 md:p-8">
            <EditableRichText
              contentKey="en.press.contact.description"
              defaultValue="For reporting requests, interviews, and source materials, please contact the campaign through the official campaigns.do page."
              page="en/press"
              section="contact"
              renderMode="paragraph"
              className="text-[var(--color-text-muted)] mb-6 leading-relaxed"
            />
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-start gap-3 p-4 bg-[var(--color-bg-warm)] rounded-xl">
                <ExternalLink className="w-5 h-5 text-[var(--color-forest)] mt-0.5 shrink-0" />
                <div>
                  <EditableText
                    contentKey="en.press.contact.campaignLabel"
                    defaultValue="Campaign page"
                    as="p"
                    page="en/press"
                    section="contact"
                    className="text-sm font-semibold text-[var(--color-text-muted)] mb-0.5"
                  />
                  <EditableLink
                    contentKey="en.press.contact.campaignHref"
                    defaultHref="https://campaigns.do/campaigns/1328"
                    page="en/press"
                    section="contact"
                    className="text-base font-medium text-[var(--color-text)] hover:text-[var(--color-forest)] transition-colors"
                  >
                    <EditableText
                      contentKey="en.press.contact.campaignLink"
                      defaultValue="Open the official campaign page"
                      as="span"
                      page="en/press"
                      section="contact"
                    />
                  </EditableLink>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <EditableText
            contentKey="en.press.cite.title"
            defaultValue="Suggested Citation"
            as="h2"
            page="en/press"
            section="cite"
            className="text-xl md:text-2xl font-bold text-[var(--color-text)] mb-6"
          />
          <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm p-6 md:p-8">
            <EditableRichText
              contentKey="en.press.cite.description"
              defaultValue="If you cite this campaign in reporting or research, you may use the following format."
              page="en/press"
              section="cite"
              renderMode="paragraph"
              className="text-[var(--color-text-muted)] mb-4 leading-relaxed"
            />
            <div className="bg-[var(--color-bg-warm)] rounded-xl p-5 border border-[var(--color-border)]">
              <EditableRichText
                contentKey="en.press.cite.citation"
                defaultValue={`Pungcheon-ri Residents' Committee. (2026). Save Pungcheon-ri campaign materials.\n${SITE_URL}/en`}
                page="en/press"
                section="cite"
                renderMode="lines"
                className="text-sm text-[var(--color-text)] leading-relaxed font-mono"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
