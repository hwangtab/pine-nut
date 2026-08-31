"use client";

import { useCallback } from "react";
import { Heart, PenLine, Share2 } from "lucide-react";
import { EditableLink, EditableList, EditableText } from "@/components/editable";
import { AnimatedCounter, FadeIn } from "@/components/home/HomeMotion";
import { PostmarkStamp } from "@/components/visuals/ForestLetterMotifs";
import { useAdminEdit } from "@/lib/contexts/AdminEditContext";

interface HomeCtaSectionProps {
  signatureCount: number | null;
}

export default function HomeCtaSection({ signatureCount }: HomeCtaSectionProps) {
  const { getContent } = useAdminEdit();
  const homeShareTitle = getContent("home.share.title") ?? "풍천리를 지켜주세요";
  const homeShareText =
    getContent("home.share.text") ?? "강원도 홍천 풍천리 주민들의 이야기를 들어주세요.";
  const homeShareCopyAlert =
    getContent("home.share.copyAlert") ?? "링크가 복사되었습니다.";

  const handleShare = useCallback(async () => {
    const shareData = { title: homeShareTitle, text: homeShareText, url: window.location.href };
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
      <FadeIn className="relative text-center mb-16 max-w-2xl mx-auto">
        <PostmarkStamp className="absolute -top-6 right-0 w-20 h-20 text-[var(--color-forest)]/35 rotate-12 hidden sm:block" />
        <EditableText
          contentKey="home.cta.heading"
          defaultValue="숲에 답장을 보내주세요"
          as="h2"
          page="home"
          section="cta"
          className="font-serif-display font-bold text-3xl sm:text-4xl md:text-5xl mb-4 text-[var(--color-text)]"
        />
        <EditableText
          contentKey="home.cta.subtitle"
          defaultValue="당신의 이름 하나가 숲을 지키는 연대서명에 힘을 더합니다"
          as="p"
          page="home"
          section="cta"
          className="text-balance text-lg text-[var(--color-text-muted)]"
        />
      </FadeIn>

      {signatureCount !== null && (
        <FadeIn className="mb-8 flex justify-center">
          <div className="stamp-badge inline-block">
            <div className="stamp-badge__inner">
              <EditableText
                contentKey="home.cta.countPrefix"
                defaultValue="현재"
                as="p"
                page="home"
                section="cta"
                className="text-sm text-[var(--color-text-muted)]"
              />
              <p className="font-serif-display font-bold text-4xl sm:text-5xl text-[var(--color-warm)] my-1">
                <AnimatedCounter target={signatureCount} suffix="명" />
              </p>
              <EditableText
                contentKey="home.cta.countSuffix"
                defaultValue="이 함께하고 있습니다"
                as="p"
                page="home"
                section="cta"
                className="text-sm text-[var(--color-text-muted)]"
              />
            </div>
          </div>
        </FadeIn>
      )}

      <FadeIn className="mb-12 flex justify-center">
        <EditableLink
          contentKey="home.cta.signatureLinkHref"
          defaultHref="/petition"
          page="home"
          section="cta"
          className="letter-btn letter-btn--primary min-h-[48px] px-8"
        >
          <EditableText
            contentKey="home.cta.signatureLinkLabel"
            defaultValue="연대서명 하러 가기"
            as="span"
            page="home"
            section="cta"
          />
        </EditableLink>
      </FadeIn>

      <EditableList
        contentKey="home.cta.cards"
        defaultItems={[
          { title: "서명하기", desc: "양수발전소 건설 반대 서명에 참여해주세요", href: "/petition" },
          { title: "후원하기", desc: "주민들의 법률 비용과 활동을 후원해주세요", href: "/donate" },
          { title: "공유하기", desc: "더 많은 사람들에게 풍천리의 이야기를 알려주세요", href: "#share" },
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
                    <div className="hover-lift paper p-8 text-center h-full flex flex-col">
                      <div className="relative z-[1] flex flex-col h-full">
                        <IconComp className="w-10 h-10 text-[var(--color-warm)] mx-auto mb-5" />
                        <h3 className="text-xl font-bold mb-3">{card.title}</h3>
                        <p className="text-[var(--color-text-muted)] leading-relaxed mb-6 flex-1">
                          {card.desc}
                        </p>
                        {card.href === "#share" ? (
                          <button onClick={handleShare} className="letter-btn letter-btn--primary">
                            {card.title}
                          </button>
                        ) : (
                          <EditableLink
                            contentKey={`home.cta.cardLink.${index}`}
                            defaultHref={card.href}
                            page="home"
                            section="cta"
                            className="letter-btn letter-btn--primary"
                          >
                            {card.title}
                          </EditableLink>
                        )}
                      </div>
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
