import type { Metadata } from "next";
import CardNews from "@/components/CardNews";

export const metadata: Metadata = {
  title: "공유용 카드뉴스 — 풍천리를 지켜주세요",
  description:
    "풍천리 이야기를 카드뉴스로 만들었습니다. 이미지를 다운로드해서 SNS에 공유해주세요.",
};

export default function SharePage() {
  return (
    <article>
      {/* Hero */}
      <section className="relative text-white pt-32 md:pt-40 pb-16 md:pb-20 px-4 sm:px-6 overflow-hidden">
        <img
          src="https://www.pressian.com/_resources/10/2025/11/12/2025111117101271238_l.png"
          alt="" role="presentation"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[var(--color-forest)]/80" />
        <div className="relative max-w-3xl mx-auto text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-white/50 mb-4 font-medium">
            Share &amp; Spread
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
            카드뉴스로
            <br />
            함께 알려주세요
          </h1>
          <p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-xl mx-auto">
            각 카드의 다운로드 버튼을 눌러 이미지를 저장한 뒤,
            <br className="hidden sm:block" />
            인스타그램·카카오톡·트위터 등에 공유해주세요.
          </p>
        </div>
      </section>

      {/* Cards */}
      <section className="bg-[var(--color-bg)]">
        <CardNews />
      </section>

      {/* Mobile tip */}
      <section className="py-12 md:py-16 px-4 sm:px-6 bg-[var(--color-bg-warm)]">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
            모바일에서는 카드 이미지를 <strong>길게 눌러 저장</strong>할 수도 있습니다.
            <br />
            더 많은 사람에게 풍천리 이야기를 전해주세요.
          </p>
        </div>
      </section>
    </article>
  );
}
