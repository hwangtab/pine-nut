"use client";

const factSheetData = [
  { label: "위치", value: "강원도 홍천군 화촌면 풍천리" },
  { label: "사업자", value: "한국수력원자력(한수원)" },
  { label: "시공자", value: "대우건설 컨소시엄" },
  { label: "시설 규모", value: "600MW (300MW × 2기)" },
  { label: "사업 면적", value: "1,530,279㎡ (약 153ha)" },
  { label: "총 사업비", value: "1조 5,863억원" },
  { label: "벌채 예정 잣나무", value: "약 11만 그루" },
  { label: "잣나무 숲", value: "1,800ha (산림청 지정 '100대 명품숲')" },
  { label: "수몰 가구", value: "51가구" },
  { label: "주민 생계", value: "약 70%가 잣 생산으로 생계 유지" },
  { label: "멸종위기종", value: "산양(천연기념물), 까막딱다구리, 수달 서식" },
  { label: "투쟁 기간", value: "2019년 3월 ~ 현재 (7년+)" },
  { label: "집회 횟수", value: "680회 이상" },
  { label: "주민 참여", value: "만장일치 반대" },
  {
    label: "주요 쟁점",
    value: "생태계 파괴, 소음·분진, 잣 생산지 소멸, 공동체 와해",
  },
];

export default function FactsheetPage() {
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
            FACT SHEET
          </p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight mb-3">
            풍천리 양수발전소 반대 투쟁
            <br />
            핵심 팩트시트
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            발행: 풍천리 주민회 | 2026년 3월
          </p>
        </header>

        {/* Summary */}
        <section className="mb-8">
          <div className="bg-[var(--color-bg-warm)] rounded-xl p-5 border border-[var(--color-border)]">
            <p className="text-base text-gray-800 leading-relaxed">
              강원도 홍천군 풍천리 주민들은 2019년부터 한수원의 양수발전소 건설
              계획에 맞서 7년 넘게 투쟁하고 있습니다. 이 사업은 산림청이 지정한
              &apos;100대 명품숲&apos;을 파괴하고, 11만 그루의 잣나무를 벌채하며, 51가구의
              삶의 터전을 수몰시킵니다.
            </p>
          </div>
        </section>

        {/* Fact table */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[var(--color-forest)] rounded-full inline-block" />
            사업 개요 및 현황
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {factSheetData.map((fact, i) => (
                <div
                  key={fact.label}
                  className={`flex flex-col sm:flex-row sm:items-center px-5 py-3 gap-1 sm:gap-4 ${
                    i % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <dt className="text-sm font-bold text-[var(--color-forest)] sm:w-40 shrink-0">
                    {fact.label}
                  </dt>
                  <dd className="text-sm text-gray-900 font-medium">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Key numbers highlight */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[var(--color-warm)] rounded-full inline-block" />
            핵심 수치
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { number: "680+", label: "집회 횟수" },
              { number: "11만", label: "벌채 잣나무" },
              { number: "51", label: "수몰 가구" },
              { number: "7년+", label: "투쟁 기간" },
            ].map((item) => (
              <div
                key={item.label}
                className="text-center p-4 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]"
              >
                <p className="text-2xl font-extrabold text-[var(--color-forest)]">
                  {item.number}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[var(--color-sky)] rounded-full inline-block" />
            문의
          </h2>
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <p className="text-sm text-gray-700 leading-relaxed">
              <strong>풍천리 주민회</strong>
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
        <footer className="pt-6 border-t border-gray-200">
          <p className="text-xs text-[var(--color-text-muted)] text-center">
            풍천리를 지켜주세요 | pungcheon.kr | 2026년 3월 발행
          </p>
        </footer>
      </div>
    </>
  );
}
