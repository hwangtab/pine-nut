import type { Metadata } from "next";
import CardNews from "@/components/CardNews";
import SubHero from "@/components/SubHero";
import { EditableText } from "@/components/editable";

export const metadata: Metadata = {
  title: "공유용 카드뉴스 — 풍천리를 지켜주세요",
  description:
    "풍천리 이야기를 카드뉴스로 만들었습니다. 이미지를 다운로드해서 SNS에 공유해주세요.",
};

export default function SharePage() {
  return (
    <article>
      {/* Hero */}
      <SubHero
        imageUrl="https://www.pressian.com/_resources/10/2025/11/12/2025111117101271238_l.png"
        title={<EditableText contentKey="share.hero.title" defaultValue="카드뉴스로 함께 알려주세요" as="span" page="share" section="hero" />}
        subtitle={<EditableText contentKey="share.hero.subtitle" defaultValue="각 카드의 다운로드 버튼을 눌러 이미지를 저장한 뒤, 인스타그램·카카오톡·트위터 등에 공유해주세요." as="span" page="share" section="hero" />}
        eyebrow="Share & Spread"
      />

      {/* Cards */}
      <section className="bg-[var(--color-bg)] pt-12 md:pt-16">
        <CardNews />
      </section>

      {/* Mobile tip */}
      <section className="py-12 md:py-16 px-4 sm:px-6 bg-[var(--color-bg-warm)]">
        <div className="max-w-xl mx-auto text-center">
          <EditableText
            contentKey="share.tip.text"
            defaultValue="모바일에서는 카드 이미지를 길게 눌러 저장할 수도 있습니다. 더 많은 사람에게 풍천리 이야기를 전해주세요."
            as="p"
            page="share"
            section="tip"
            className="text-sm text-[var(--color-text-muted)] leading-relaxed"
          />
        </div>
      </section>
    </article>
  );
}
