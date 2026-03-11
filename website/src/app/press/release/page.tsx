"use client";

import UtilityHeader from "@/components/UtilityHeader";

export default function PressReleasePage() {
  return (
    <>
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .print-page {
            padding: 0 !important;
            max-width: 100% !important;
          }
        }
      `}</style>

      <div className="no-print">
        <UtilityHeader
          title="보도자료"
          subtitle="풍천리 주민, 양수발전소 백지화 촉구"
          eyebrow="보도자료"
          tone="slate"
        />
      </div>

      <div className="print-page max-w-3xl mx-auto px-6 py-12">
        {/* Print button */}
        <div className="no-print mb-8 flex items-center gap-4">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-forest)] text-white font-semibold rounded-xl hover:bg-[var(--color-forest-light)] transition-colors cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            PDF로 저장
          </button>
          <a
            href="/press"
            className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-forest)] transition-colors"
          >
            자료실로 돌아가기
          </a>
        </div>

        {/* Document header */}
        <header className="mb-10 border-b-2 border-[var(--color-forest)] pb-6">
          <p className="text-sm font-semibold text-[var(--color-forest)] tracking-wider uppercase mb-2">
            보도자료
          </p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--color-text)] leading-tight mb-4">
            풍천리 주민, 양수발전소 백지화 촉구
          </h1>
          <div className="text-sm text-[var(--color-text-muted)] space-y-1">
            <p>배포일: 2026년 3월</p>
            <p>발신: 풍천리 주민회</p>
            <p>문의: 010-8918-8933 (이창후 총무)</p>
          </div>
        </header>

        {/* Lead */}
        <section className="mb-8">
          <div className="bg-[var(--color-bg-warm)] rounded-xl p-5 border border-[var(--color-border)]">
            <p className="text-base text-[var(--color-text)] leading-relaxed font-medium">
              [홍천, 강원도] 강원도 홍천군 화촌면 풍천리 주민들이 한국수력원자력(한수원)의
              양수발전소 건설 계획의 전면 백지화를 촉구하고 나섰다. 2019년 3월 첫 반대 집회
              이후 7년이 넘도록 이어진 주민 투쟁은 680회가 넘는 집회를 기록하며, 대한민국
              환경·에너지 정책의 근본적 전환을 요구하고 있다.
            </p>
          </div>
        </section>

        {/* Body */}
        <section className="mb-8 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-3 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[var(--color-forest)] rounded-full inline-block" />
              사업 개요
            </h2>
            <p className="text-base text-[var(--color-text-muted)] leading-relaxed">
              홍천 양수발전소는 한수원이 풍천리 일대에 600MW(300MW x 2기) 규모로 추진 중인
              대형 국책사업이다. 총 사업비 1조 5,863억원이 투입되며, 사업 면적은
              1,530,279㎡(약 153ha)에 달한다. 시공은 대우건설 컨소시엄이 맡고 있다.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-3 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[var(--color-forest)] rounded-full inline-block" />
              7년간의 주민 투쟁
            </h2>
            <p className="text-base text-[var(--color-text-muted)] leading-relaxed">
              풍천리 주민들은 2019년 3월부터 현재까지 만장일치로 양수발전소 건설에 반대하고
              있다. 7년이 넘는 기간 동안 680회가 넘는 집회를 이어왔으며, 이는 대한민국 환경
              운동사에서 유례를 찾기 어려운 기록이다. 주민 대부분이 70대 이상의 고령임에도
              불구하고 한결같은 의지로 투쟁을 계속하고 있다.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-3 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[var(--color-warm)] rounded-full inline-block" />
              피해 규모
            </h2>
            <p className="text-base text-[var(--color-text-muted)] leading-relaxed mb-4">
              이 사업이 강행될 경우 예상되는 피해는 다음과 같다.
            </p>
            <ul className="space-y-2 text-base text-[var(--color-text-muted)] leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-[var(--color-warm)] font-bold mt-0.5">--</span>
                <span>
                  <strong>산림 파괴:</strong> 산림청이 &apos;100대 명품숲&apos;으로 지정한 1,800ha
                  잣나무 숲이 훼손되며, 약 11만 그루의 잣나무가 벌채될 예정
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--color-warm)] font-bold mt-0.5">--</span>
                <span>
                  <strong>생태계 파괴:</strong> 산양(천연기념물), 까막딱다구리, 수달 등 멸종위기종
                  서식지 파괴
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--color-warm)] font-bold mt-0.5">--</span>
                <span>
                  <strong>주민 생계 위협:</strong> 51가구가 수몰되며, 주민 약 70%가 잣 생산으로
                  생계를 유지하고 있어 경제적 기반이 완전히 붕괴
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--color-warm)] font-bold mt-0.5">--</span>
                <span>
                  <strong>공동체 와해:</strong> 수 세대에 걸쳐 형성된 마을 공동체가 소멸 위기에 처함
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--color-warm)] font-bold mt-0.5">--</span>
                <span>
                  <strong>환경 피해:</strong> 공사 기간 소음·분진으로 주민 건강 위협
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-3 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[var(--color-sky)] rounded-full inline-block" />
              주민 요구 사항
            </h2>
            <p className="text-base text-[var(--color-text-muted)] leading-relaxed">
              풍천리 주민회는 다음을 요구한다.
            </p>
            <ol className="mt-3 space-y-2 text-base text-[var(--color-text-muted)] leading-relaxed list-decimal list-inside">
              <li>홍천 양수발전소 건설 계획의 <strong>전면 백지화</strong></li>
              <li>풍천리 잣나무 숲의 <strong>영구 보전</strong> 및 생태계 보호 대책 수립</li>
              <li>주민 의사를 무시한 <strong>일방적 사업 추진 중단</strong></li>
              <li>
                지역 주민과의 <strong>실질적 대화</strong> 및 대안 에너지 정책 논의
              </li>
            </ol>
          </div>
        </section>

        {/* Quote */}
        <section className="mb-8">
          <blockquote className="border-l-4 border-[var(--color-forest)] pl-5 py-3 bg-[var(--color-bg)] rounded-r-xl">
            <p className="text-base text-[var(--color-text)] leading-relaxed italic">
              &ldquo;우리는 이 숲과 함께 태어나 이 숲과 함께 살아왔습니다. 잣나무 11만 그루가
              베어지는 것은 우리의 삶이 뿌리째 뽑히는 것과 같습니다. 7년 넘게 680번이
              넘는 집회를 해왔고, 끝까지 싸울 것입니다.&rdquo;
            </p>
            <cite className="text-sm text-[var(--color-text-muted)] mt-2 block not-italic">
              -- 풍천리 주민회
            </cite>
          </blockquote>
        </section>

        {/* Contact */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-[var(--color-text)] mb-3 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[var(--color-forest)] rounded-full inline-block" />
            문의처
          </h2>
          <div className="bg-[var(--color-bg)] rounded-xl p-5 border border-[var(--color-border)]">
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
              <strong>풍천리양수발전소건설반대위원회</strong>
              <br />
              담당: 이창후 총무 / 010-8918-8933
              <br />
              캠페인 페이지:{" "}
              <a
                href="https://campaigns.do/campaigns/1328"
                className="text-[var(--color-forest)] underline"
              >
                campaigns.do/campaigns/1328
              </a>
              <br />
              웹사이트: pungcheon.kr
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-6 border-t border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-text-muted)] text-center">
            본 보도자료는 자유롭게 인용 및 배포할 수 있습니다.
            <br />
            풍천리를 지켜주세요 | pungcheon.kr
          </p>
        </footer>
      </div>
    </>
  );
}
