"use client";

import { useCallback } from "react";
import { Heart, PenLine, Share2 } from "lucide-react";
import { EditableLink, EditableList, EditableText } from "@/components/editable";
import HomeInlineSignatureForm from "@/components/home/HomeInlineSignatureForm";
import { AnimatedCounter, FadeIn } from "@/components/home/HomeMotion";
import { useAdminEdit } from "@/lib/contexts/AdminEditContext";

interface HomeCtaSectionProps {
  signatureCount: number | null;
  onSignatureCountChange: (count: number) => void;
}

export default function HomeCtaSection({
  signatureCount,
  onSignatureCountChange,
}: HomeCtaSectionProps) {
  const { getContent } = useAdminEdit();
  const homeShareTitle = getContent("home.share.title") ?? "풍천리를 지켜주세요";
  const homeShareText =
    getContent("home.share.text") ?? "강원도 홍천 풍천리 주민들의 이야기를 들어주세요.";
  const homeShareCopyAlert =
    getContent("home.share.copyAlert") ?? "링크가 복사되었습니다.";

  const handleShare = useCallback(async () => {
    const shareData = {
      title: homeShareTitle,
      text: homeShareText,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert(homeShareCopyAlert);
      }
    } catch {
      /* user cancelled */
    }
  }, [homeShareCopyAlert, homeShareText, homeShareTitle]);

  return (
    <div className="max-w-5xl mx-auto">
      <FadeIn className="text-center mb-16">
        <EditableText
          contentKey="home.cta.heading"
          defaultValue="함께해주세요"
          as="h2"
          page="home"
          section="cta"
          className="text-3xl sm:text-4xl md:text-5xl font-black mb-4"
        />
        <EditableText
          contentKey="home.cta.subtitle"
          defaultValue="당신의 작은 마음 하나가, 숲을 지키는 큰 힘이 됩니다"
          as="p"
          page="home"
          section="cta"
          className="text-balance text-lg text-[var(--color-text-muted)]"
        />
      </FadeIn>

      {signatureCount !== null && (
        <FadeIn className="text-center mb-12">
          <EditableText
            contentKey="home.cta.countPrefix"
            defaultValue="현재"
            as="p"
            page="home"
            section="cta"
            className="text-lg text-[var(--color-text-muted)] mb-2"
          />
          <p className="text-5xl sm:text-6xl md:text-7xl font-black text-[var(--color-warm)]">
            <AnimatedCounter target={signatureCount} suffix="명" />
          </p>
          <EditableText
            contentKey="home.cta.countSuffix"
            defaultValue="이 함께하고 있습니다"
            as="p"
            page="home"
            section="cta"
            className="text-lg text-[var(--color-text-muted)] mt-2"
          />
        </FadeIn>
      )}

      <HomeInlineSignatureForm onSignatureCountChange={onSignatureCountChange} />

      <EditableList
        contentKey="home.cta.cards"
        defaultItems={[
          {
            title: "서명하기",
            desc: "양수발전소 건설 반대 서명에 참여해주세요",
            href: "/petition",
          },
          {
            title: "후원하기",
            desc: "주민들의 법률 비용과 활동을 후원해주세요",
            href: "/donate",
          },
          {
            title: "공유하기",
            desc: "더 많은 사람들에게 풍천리의 이야기를 알려주세요",
            href: "#share",
          },
        ]}
        page="home"
        section="cta"
        fields={[
          { key: "title", label: "제목" },
          { key: "desc", label: "설명", type: "textarea" },
          { key: "href", label: "링크" },
        ]}
      >
        {(items) => {
          const icons = [PenLine, Heart, Share2];
          return (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
              {items.map((card, index) => {
                const IconComp = icons[index] || icons[0];
                return (
                  <FadeIn key={card.title} delay={index * 0.1}>
                    <div className="hover-lift bg-white rounded-[var(--radius-card)] p-8 border border-[var(--color-border)] shadow-card text-center h-full flex flex-col">
                      <IconComp className="w-10 h-10 text-[var(--color-warm)] mx-auto mb-5" />
                      <h3 className="text-xl font-bold mb-3">{card.title}</h3>
                      <p className="text-[var(--color-text-muted)] leading-relaxed mb-6 flex-1">
                        {card.desc}
                      </p>
                      {card.href === "#share" ? (
                        <button
                          onClick={handleShare}
                          className="inline-block min-h-[44px] px-6 py-3 rounded-full bg-[var(--color-warm)] hover:bg-[var(--color-warm-light)] text-white font-bold transition-colors cursor-pointer"
                        >
                          {card.title}
                        </button>
                      ) : (
                        <EditableLink
                          contentKey={`home.cta.cardLink.${index}`}
                          defaultHref={card.href}
                          page="home"
                          section="cta"
                          className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 rounded-full bg-[var(--color-warm)] hover:bg-[var(--color-warm-light)] text-white font-bold transition-colors"
                        >
                          {card.title}
                        </EditableLink>
                      )}
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          );
        }}
      </EditableList>
    </div>
  );
}
