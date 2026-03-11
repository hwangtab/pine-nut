import Link from "next/link";
import UtilityHeader from "@/components/UtilityHeader";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <UtilityHeader
        title="페이지를 찾을 수 없습니다"
        subtitle="요청하신 페이지가 존재하지 않거나 이동되었습니다."
        eyebrow="오류 안내"
        tone="forest"
      />

      <section className="max-w-2xl mx-auto px-6 py-14 md:py-16 text-center">
        <Link
          href="/"
          className="inline-block bg-[var(--color-warm)] text-white font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
        >
          홈으로 돌아가기
        </Link>

        <div className="mt-12">
          <p className="text-sm text-[var(--color-text-muted)] mb-6">
            찾고 계신 내용이 아래에 있을 수 있습니다
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/story"
              className="px-5 py-2 border border-[var(--color-forest)]/20 rounded-lg text-[var(--color-text)] hover:bg-[var(--color-forest)]/5 transition-colors"
            >
              이야기
            </Link>
            <Link
              href="/petition"
              className="px-5 py-2 border border-[var(--color-forest)]/20 rounded-lg text-[var(--color-text)] hover:bg-[var(--color-forest)]/5 transition-colors"
            >
              서명하기
            </Link>
            <Link
              href="/donate"
              className="px-5 py-2 border border-[var(--color-forest)]/20 rounded-lg text-[var(--color-text)] hover:bg-[var(--color-forest)]/5 transition-colors"
            >
              후원하기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
