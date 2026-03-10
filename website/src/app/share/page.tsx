import type { Metadata } from "next";
import CardNews from "@/components/CardNews";

export const metadata: Metadata = {
  title: "공유용 카드뉴스 — 풍천리를 지켜주세요",
  description:
    "풍천리 이야기를 카드뉴스로 만들었습니다. 스크린샷으로 저장해서 SNS에 공유해주세요.",
};

export default function SharePage() {
  return (
    <article>
      {/* Hero */}
      <section className="bg-[var(--color-forest)] text-white py-20 md:py-28 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
            공유용 카드뉴스
          </h1>
          <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-4">
            풍천리 이야기를 더 많은 사람들에게 알려주세요
          </p>
          <div className="inline-block bg-white/10 border border-white/20 rounded-xl px-6 py-3 mt-4">
            <p className="text-sm text-white/70">
              스크린샷으로 저장해서 공유해주세요
            </p>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="bg-[var(--color-bg)]">
        <CardNews />
      </section>

      {/* Instructions */}
      <section className="py-16 md:py-20 px-4 sm:px-6 bg-[var(--color-bg-warm)]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-forest)] mb-8">
            공유 방법
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-[var(--color-border)]">
              <div className="text-3xl font-black text-[var(--color-forest)] mb-3">1</div>
              <p className="text-sm text-[var(--color-text-muted)]">
                원하는 카드를 선택하세요
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-[var(--color-border)]">
              <div className="text-3xl font-black text-[var(--color-forest)] mb-3">2</div>
              <p className="text-sm text-[var(--color-text-muted)]">
                스크린샷을 찍어 저장하세요
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-[var(--color-border)]">
              <div className="text-3xl font-black text-[var(--color-forest)] mb-3">3</div>
              <p className="text-sm text-[var(--color-text-muted)]">
                인스타그램, 카카오톡 등에 공유하세요
              </p>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}
