import type { Metadata } from "next";
import { ArrowRight, ExternalLink, FileText } from "lucide-react";
import SubHero from "@/components/SubHero";
import {
  EditableLink,
  EditableText,
  EditableRichText,
} from "@/components/editable";
import ManagedSection from "@/components/builder/ManagedSection";
import OrderedSectionGroup from "@/components/builder/OrderedSectionGroup";
import { SITE_URL } from "@/lib/site-config";
import { PressFactsSection } from "./PressSectionsClient";

const pressKitItems = [
  {
    title: "보도자료",
    description: "풍천리 양수발전소 반대 투쟁 보도자료",
    icon: FileText,
    color: "text-[var(--color-forest)] bg-[var(--color-bg-warm)]",
    href: "/press/release",
  },
  {
    title: "팩트시트",
    description: "풍천리 투쟁 핵심 정리 (1페이지)",
    icon: FileText,
    color: "text-[var(--color-warm)] bg-[var(--color-bg-warm)]",
    href: "/press/factsheet",
  },
];

export const metadata: Metadata = {
  title: "자료실 — 풍천리를 지켜주세요",
  description:
    "언론인, 연구자, 활동가를 위한 풍천리 양수발전소 반대 투쟁 관련 자료 모음. 보도자료, 팩트시트, 사진 자료를 다운로드하세요.",
};

const PRESS_SECTION_ORDER = ["kit", "facts", "contact", "cite"] as const;

export default function PressPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-bg)] to-white">
      <SubHero
        imageUrl="https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/1016/IE003535383_STD.jpg"
        fallbackImageUrl="https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/1016/IE003535387_STD.jpg"
        imageContentKey="press.hero.image"
        imagePage="press"
        imageSection="hero"
        title={<EditableText contentKey="press.hero.title" defaultValue="자료실" as="span" page="press" section="hero" />}
        subtitle={<EditableText contentKey="press.hero.subtitle" defaultValue="언론인·활동가를 위한 풍천리 관련 자료" as="span" page="press" section="hero" />}
        eyebrow={<EditableText contentKey="press.hero.eyebrow" defaultValue="자료 아카이브" as="span" page="press" section="hero" />}
      />

      <div className="max-w-4xl mx-auto px-4 pt-12 md:pt-16 pb-20 space-y-16">
        <OrderedSectionGroup page="press" defaultOrder={[...PRESS_SECTION_ORDER]}>
        <ManagedSection
          page="press"
          sectionId="kit"
          visibilityContentKey="press.kit.visibility"
          section="kit"
          defaultClassName=""
        >
            <EditableText
              contentKey="press.kit.title"
              defaultValue="보도 키트"
              as="h2"
              page="press"
              section="kit"
              className="text-xl md:text-2xl font-bold text-[var(--color-text)] mb-6"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pressKitItems.map((item, index) => {
                const Icon = item.icon;

                return (
                  <EditableLink
                    key={item.title}
                    contentKey={`press.kit.item.${index}.href`}
                    defaultHref={item.href}
                    page="press"
                    section="kit"
                    className="group flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-[var(--color-border)] shadow-sm hover:shadow-md hover:border-[var(--color-forest)]/20 transition-all"
                  >
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${item.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <EditableText
                      contentKey={`press.kit.item.${index}.title`}
                      defaultValue={item.title}
                      as="h3"
                      page="press"
                      section="kit"
                      className="text-base font-bold text-[var(--color-text)] mb-1"
                    />
                    <EditableText
                      contentKey={`press.kit.item.${index}.description`}
                      defaultValue={item.description}
                      as="p"
                      page="press"
                      section="kit"
                      className="text-sm text-[var(--color-text-muted)] mb-4 leading-relaxed"
                    />
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-forest)] group-hover:text-[var(--color-forest-light)] transition-colors">
                      <EditableText contentKey="press.kit.open" defaultValue="열기" as="span" page="press" section="kit" />
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </EditableLink>
                );
              })}
            </div>
        </ManagedSection>

        <ManagedSection
          page="press"
          sectionId="facts"
          visibilityContentKey="press.facts.visibility"
          section="facts"
          defaultClassName=""
        >
            <EditableText
              contentKey="press.facts.title"
              defaultValue="핵심 팩트시트"
              as="h2"
              page="press"
              section="facts"
              className="text-xl md:text-2xl font-bold text-[var(--color-text)] mb-6"
            />
            <PressFactsSection />
        </ManagedSection>

        <ManagedSection
          page="press"
          sectionId="contact"
          visibilityContentKey="press.contact.visibility"
          section="contact"
          defaultClassName=""
        >
            <EditableText
              contentKey="press.contact.title"
              defaultValue="언론 연락처"
              as="h2"
              page="press"
              section="contact"
              className="text-xl md:text-2xl font-bold text-[var(--color-text)] mb-6"
            />
            <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm p-6 md:p-8">
              <EditableRichText
                contentKey="press.contact.description"
                defaultValue="취재 및 자료 요청은 빠띠 캠페인 페이지를 통해 문의해 주세요. 빠른 시일 내에 답변드리겠습니다."
                page="press"
                section="contact"
                renderMode="paragraph"
                className="text-[var(--color-text-muted)] mb-6 leading-relaxed"
              />
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-start gap-3 p-4 bg-[var(--color-bg-warm)] rounded-xl">
                  <ExternalLink className="w-5 h-5 text-[var(--color-forest)] mt-0.5 shrink-0" />
                  <div>
                    <EditableText
                      contentKey="press.contact.campaignLabel"
                      defaultValue="캠페인 페이지"
                      as="p"
                      page="press"
                      section="contact"
                      className="text-sm font-semibold text-[var(--color-text-muted)] mb-0.5"
                    />
                    <EditableLink
                      contentKey="press.contact.campaignHref"
                      defaultHref="https://campaigns.do/campaigns/1328"
                      page="press"
                      section="contact"
                      className="text-base font-medium text-[var(--color-text)] hover:text-[var(--color-forest)] transition-colors"
                    >
                      <EditableText
                        contentKey="press.contact.campaignLink"
                        defaultValue="빠띠 캠페인 페이지에서 문의하기"
                        as="span"
                        page="press"
                        section="contact"
                      />
                    </EditableLink>
                  </div>
                </div>
              </div>
            </div>
        </ManagedSection>

        <ManagedSection
          page="press"
          sectionId="cite"
          visibilityContentKey="press.cite.visibility"
          section="cite"
          defaultClassName=""
        >
            <EditableText
              contentKey="press.cite.title"
              defaultValue="인용 안내"
              as="h2"
              page="press"
              section="cite"
              className="text-xl md:text-2xl font-bold text-[var(--color-text)] mb-6"
            />
            <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm p-6 md:p-8">
              <EditableRichText
                contentKey="press.cite.description"
                defaultValue="연구 및 보도 시 아래 형식으로 인용해 주시기 바랍니다."
                page="press"
                section="cite"
                renderMode="paragraph"
                className="text-[var(--color-text-muted)] mb-4 leading-relaxed"
              />
              <div className="bg-[var(--color-bg-warm)] rounded-xl p-5 border border-[var(--color-border)]">
                <EditableRichText
                  contentKey="press.cite.citation"
                  defaultValue={`풍천리 주민회. (2026). 풍천리 양수발전소 반대 투쟁 기록.\n${SITE_URL}`}
                  page="press"
                  section="cite"
                  renderMode="lines"
                  className="text-sm text-[var(--color-text)] leading-relaxed font-mono"
                />
              </div>
              <EditableText
                contentKey="press.cite.apaLabel"
                defaultValue="APA 형식 예시:"
                as="p"
                page="press"
                section="cite"
                className="text-sm text-[var(--color-text-muted)] mt-4 leading-relaxed"
              />
              <div className="bg-[var(--color-bg-warm)] rounded-xl p-5 border border-[var(--color-border)] mt-2">
                <EditableRichText
                  contentKey="press.cite.apaCitation"
                  defaultValue={`풍천리 주민회 (2026). 풍천리를 지켜주세요: 양수발전소 건설 반대 투쟁 기록. ${SITE_URL}`}
                  page="press"
                  section="cite"
                  renderMode="paragraph"
                  className="text-sm text-[var(--color-text)] leading-relaxed font-mono"
                />
              </div>
            </div>
        </ManagedSection>
        </OrderedSectionGroup>
      </div>
    </div>
  );
}
