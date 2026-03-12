import type { Metadata } from "next";
import CardNews from "@/components/CardNews";
import SubHero from "@/components/SubHero";
import { EditableText } from "@/components/editable";

export const metadata: Metadata = {
  title: "Share Cards — Save Pungcheon-ri",
  description:
    "Download English-language campaign cards and share the story of Pungcheon-ri on social media.",
  alternates: {
    canonical: "/en/share",
    languages: {
      en: "/en/share",
      ko: "/share",
    },
  },
};

export default function EnglishSharePage() {
  return (
    <article>
      <SubHero
        imageUrl="https://www.pressian.com/_resources/10/2025/11/12/2025111117101271238_l.png"
        imageContentKey="en.share.hero.image"
        imagePage="en/share"
        imageSection="hero"
        title={<EditableText contentKey="en.share.hero.title" defaultValue="Share the Story" as="span" page="en/share" section="hero" />}
        subtitle={<EditableText contentKey="en.share.hero.subtitle" defaultValue="Download campaign cards and share them on Instagram, KakaoTalk, X, or anywhere your network can help." as="span" page="en/share" section="hero" />}
        eyebrow={<EditableText contentKey="en.share.hero.eyebrow" defaultValue="Share & Spread" as="span" page="en/share" section="hero" />}
      />

      <section className="bg-[var(--color-bg)] pt-12 md:pt-16">
        <CardNews locale="en" />
      </section>

      <section className="py-12 md:py-16 px-4 sm:px-6 bg-[var(--color-bg-warm)]">
        <div className="max-w-xl mx-auto text-center">
          <EditableText
            contentKey="en.share.tip.text"
            defaultValue="On mobile, you can also long-press a card image to save it. Every share helps more people learn what is happening in Pungcheon-ri."
            as="p"
            page="en/share"
            section="tip"
            className="text-sm text-[var(--color-text-muted)] leading-relaxed"
          />
        </div>
      </section>
    </article>
  );
}
