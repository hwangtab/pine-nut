import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "개인정보처리방침 — 풍천리를 지켜주세요",
  description:
    "풍천리를 지켜주세요 웹사이트의 개인정보 수집, 이용, 보관에 관한 안내입니다.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <section className="bg-[var(--color-bg-warm)] py-16 md:py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-black text-[var(--color-text)] mb-3">
            개인정보처리방침
          </h1>
          <p className="text-[var(--color-text-muted)]">
            최종 수정일: 2026년 3월 10일
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 md:p-10 space-y-10">
          {/* 개요 */}
          <p className="text-[var(--color-text)] leading-relaxed">
            &ldquo;풍천리를 지켜주세요&rdquo; 웹사이트(이하
            &ldquo;서비스&rdquo;)는 이용자의 개인정보를 소중히 보호하며,
            관련 법령을 준수합니다. 본 방침은 서비스가 수집하는 개인정보의
            항목, 수집 목적, 보유 기간, 이용자의 권리 등을 안내합니다.
          </p>

          {/* 1. 수집하는 개인정보 */}
          <section>
            <h2 className="text-xl font-bold text-[var(--color-forest)] mb-4">
              1. 수집하는 개인정보
            </h2>
            <div className="space-y-4">
              <div className="bg-[var(--color-bg)] rounded-xl p-5">
                <h3 className="font-semibold text-[var(--color-text)] mb-2">
                  서명 참여 시
                </h3>
                <p className="text-[var(--color-text-muted)] text-[15px] leading-relaxed">
                  이름, 이메일 주소, 응원 메시지(선택)
                </p>
              </div>
              <div className="bg-[var(--color-bg)] rounded-xl p-5">
                <h3 className="font-semibold text-[var(--color-text)] mb-2">
                  뉴스레터 구독 시
                </h3>
                <p className="text-[var(--color-text-muted)] text-[15px] leading-relaxed">
                  이메일 주소
                </p>
              </div>
              <div className="bg-[var(--color-bg)] rounded-xl p-5">
                <h3 className="font-semibold text-[var(--color-text)] mb-2">
                  웹사이트 이용 시 자동 수집
                </h3>
                <p className="text-[var(--color-text-muted)] text-[15px] leading-relaxed">
                  방문 페이지, 이용 시간, 브라우저 정보 등 웹사이트 이용
                  통계 (Google Analytics를 통해 익명 수집)
                </p>
              </div>
            </div>
          </section>

          {/* 2. 수집 목적 */}
          <section>
            <h2 className="text-xl font-bold text-[var(--color-forest)] mb-4">
              2. 수집 목적
            </h2>
            <ul className="space-y-3">
              {[
                "서명 접수 및 서명 현황 관리",
                "뉴스레터 및 캠페인 소식 발송",
                "웹사이트 이용 통계 분석을 통한 서비스 개선",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-[var(--color-text)] text-[15px] leading-relaxed"
                >
                  <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--color-forest)]/10 text-[var(--color-forest)] flex items-center justify-center font-bold text-xs mt-0.5">
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* 3. 보유 기간 */}
          <section>
            <h2 className="text-xl font-bold text-[var(--color-forest)] mb-4">
              3. 보유 및 이용 기간
            </h2>
            <p className="text-[var(--color-text)] text-[15px] leading-relaxed">
              수집된 개인정보는{" "}
              <strong>캠페인 종료 시까지</strong> 보유하며,
              캠페인 종료 후 지체 없이 파기합니다. 이용자가 삭제를
              요청하는 경우 요청일로부터{" "}
              <strong>7일 이내에 해당 정보를 삭제</strong>합니다.
            </p>
          </section>

          {/* 4. 제3자 제공 */}
          <section>
            <h2 className="text-xl font-bold text-[var(--color-forest)] mb-4">
              4. 개인정보의 제3자 제공
            </h2>
            <p className="text-[var(--color-text)] text-[15px] leading-relaxed">
              수집한 개인정보는{" "}
              <strong>원칙적으로 제3자에게 제공하지 않습니다</strong>.
              다만, 법령에 의해 요구되는 경우 또는 이용자의 사전 동의를
              받은 경우에 한하여 제공할 수 있습니다.
            </p>
          </section>

          {/* 5. 정보주체 권리 */}
          <section>
            <h2 className="text-xl font-bold text-[var(--color-forest)] mb-4">
              5. 정보주체의 권리
            </h2>
            <p className="text-[var(--color-text)] text-[15px] leading-relaxed mb-4">
              이용자는 언제든지 다음의 권리를 행사할 수 있습니다.
            </p>
            <ul className="space-y-2">
              {[
                "개인정보 열람 요구",
                "오류 등이 있는 경우 정정 요구",
                "삭제 요구",
                "처리 정지 요구",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-[var(--color-text)] text-[15px]"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-forest)] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-[var(--color-text-muted)] text-sm mt-4 leading-relaxed">
              위 권리 행사는 아래 문의처를 통해 요청하실 수 있으며,
              지체 없이 조치하겠습니다.
            </p>
          </section>

          {/* 6. 문의 */}
          <section>
            <h2 className="text-xl font-bold text-[var(--color-forest)] mb-4">
              6. 문의
            </h2>
            <p className="text-[var(--color-text)] text-[15px] leading-relaxed mb-4">
              개인정보 관련 문의 및 권리 행사 요청은 아래를 통해
              접수해주세요.
            </p>
            <div className="bg-[var(--color-bg)] rounded-xl p-5 space-y-2">
              <p className="text-[var(--color-text)] text-[15px]">
                <strong>빠띠 캠페인 페이지:</strong>{" "}
                <a
                  href="https://campaigns.parti.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-sky)] underline underline-offset-2 hover:text-[var(--color-sky)]/80 transition-colors"
                >
                  campaigns.parti.xyz
                </a>
              </p>
              <p className="text-[var(--color-text)] text-[15px]">
                <strong>이메일:</strong>{" "}
                <a
                  href="mailto:pungcheon@example.com"
                  className="text-[var(--color-sky)] underline underline-offset-2 hover:text-[var(--color-sky)]/80 transition-colors"
                >
                  pungcheon@example.com
                </a>
              </p>
            </div>
          </section>
        </div>

        {/* Back link */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-[15px] underline underline-offset-4 transition-colors"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
