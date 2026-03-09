import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "풍천리 이야기 — 잣나무 숲과 마을을 지키려는 7년간의 싸움",
  description:
    "강원도 홍천군 풍천리 주민들이 양수발전소 건설에 맞서 마을과 자연을 지켜온 이야기를 전합니다.",
};

export default function StoryPage() {
  return (
    <article>
      {/* ── Hero ── */}
      <section className="bg-[var(--color-forest)] text-white py-24 md:py-36 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
            풍천리 이야기
          </h1>
          <p className="text-lg md:text-xl text-white/80 leading-relaxed">
            잣나무 숲과 마을을 지키려는 7년간의 싸움
          </p>
        </div>
      </section>

      {/* ── 풍천리는 어떤 마을인가요 ── */}
      <section className="py-20 md:py-28 px-4 sm:px-6 bg-[var(--color-bg)]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-forest)] mb-10">
            풍천리는 어떤 마을인가요
          </h2>
          <div className="space-y-5 text-[var(--color-text)] leading-relaxed text-base md:text-lg">
            <p>
              풍천리는 <strong>강원도 홍천군 화촌면</strong>에 자리한 작은 산촌
              마을입니다. 산림청 지정{" "}
              <strong>&lsquo;100대 명품숲&rsquo;</strong> 중 하나인{" "}
              <strong>1,800ha 규모의 국내 최대 잣나무 숲</strong>에 둘러싸인
              곳으로, 100년 된 잣나무들이 자라는{" "}
              <strong>가리산 자락</strong>에 위치해 있습니다.
            </p>
            <p>
              <strong>주민의 약 70%가 잣 생산으로 생계를 유지</strong>하고
              있습니다. 잣나무 숲은 단순한 풍경이 아니라, 가족을 먹여 살린
              삶의 터전입니다.
            </p>
            <p>
              이 숲에는{" "}
              <strong>산양(천연기념물), 까막딱다구리, 수달</strong> 등
              멸종위기종이 서식하고 있습니다. 자연과 사람이 함께 숨 쉬며
              살아온, 조용하고 평화로운 마을이었습니다.
            </p>
          </div>
        </div>
      </section>

      {/* ── 양수발전소란 무엇인가요 ── */}
      <section className="py-20 md:py-28 px-4 sm:px-6 bg-[var(--color-bg-warm)]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-forest)] mb-10">
            양수발전소란 무엇인가요
          </h2>
          <div className="space-y-5 text-[var(--color-text)] leading-relaxed text-base md:text-lg">
            <p>
              <strong>한국수력원자력(한수원)</strong>이 추진하는{" "}
              <strong>600MW 규모(300MW × 2기)</strong> 양수발전소입니다.
              산 위와 아래에 <strong>상·하부 댐</strong>을 건설하여, 전기가
              남는 밤에 아래 저수지의 물을 위로 퍼올리고, 전기가 필요한 낮에
              그 물을 다시 떨어뜨려 터빈을 돌리는 발전소입니다.
            </p>
            <p>
              총 사업비 <strong>1조 5,863억원</strong>, 사업 면적 약{" "}
              <strong>153ha(1,530,279㎡)</strong>에 달하는 대규모 사업입니다.
              시공은 <strong>대우건설 컨소시엄(대우건설, DL건설, 효성)</strong>이
              6,155억원 규모로 맡고 있습니다.
            </p>
            <p>
              2019년 홍천군이 유치 신청하여 한수원이 후보지로 선정했습니다.
              이 계획대로라면 <strong>51가구가 수몰·이주</strong> 예정이며,
              잣나무들이 뿌리째 뽑히고 맑던 계곡물이 흙탕물로 변하게 됩니다.
            </p>
          </div>
        </div>
      </section>

      {/* ── 왜 반대하는가 ── */}
      <section className="py-20 md:py-28 px-4 sm:px-6 bg-[var(--color-bg)]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-forest)] mb-12 text-center">
            왜 반대하는가
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl p-8 border-2 border-[var(--color-forest)]/15 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-forest)]/10 flex items-center justify-center mb-5">
                <svg
                  className="w-6 h-6 text-[var(--color-forest)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[var(--color-text)] mb-3">
                생태계 파괴
              </h3>
              <p className="text-[var(--color-text-muted)] leading-relaxed">
                잣나무 <strong>약 11만 그루</strong> 벌채 예정.{" "}
                <strong>1,800ha 명품숲</strong>이 파괴되고, 산양(천연기념물)·까막딱다구리·수달 등
                멸종위기종 서식지가 영구적으로 파괴됩니다.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl p-8 border-2 border-[var(--color-earth)]/15 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-earth)]/10 flex items-center justify-center mb-5">
                <svg
                  className="w-6 h-6 text-[var(--color-earth)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[var(--color-text)] mb-3">
                생계 위협
              </h3>
              <p className="text-[var(--color-text-muted)] leading-relaxed">
                주민 <strong>70%가 잣 생산으로 생계 유지</strong>. 이미 2024년
                10월 이설도로 건설로 <strong>2,256그루(10.96ha)</strong> 벌채가
                시작되었습니다.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl p-8 border-2 border-[var(--color-warm)]/15 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-warm)]/10 flex items-center justify-center mb-5">
                <svg
                  className="w-6 h-6 text-[var(--color-warm)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[var(--color-text)] mb-3">
                건강 위협
              </h3>
              <p className="text-[var(--color-text-muted)] leading-relaxed">
                대규모 공사(<strong>84개월 예정</strong>)로 인한 소음, 분진,
                진동이 7년간 이어집니다. 60~80대 고령 주민들의 건강이 심각하게
                악화될 수 있습니다.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-2xl p-8 border-2 border-[var(--color-sky)]/15 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-sky)]/10 flex items-center justify-center mb-5">
                <svg
                  className="w-6 h-6 text-[var(--color-sky)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[var(--color-text)] mb-3">
                공동체 와해
              </h3>
              <p className="text-[var(--color-text-muted)] leading-relaxed">
                <strong>51가구가 수몰·이주</strong> 예정. 수십 년간 함께해온
                마을 공동체가 해체됩니다. 한 번 흩어지면 다시 모일 수 없습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 주민들은 어떻게 싸워왔나 ── */}
      <section className="py-20 md:py-28 px-4 sm:px-6 bg-[var(--color-bg-warm)]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-forest)] mb-10">
            주민들은 어떻게 싸워왔나
          </h2>
          <div className="space-y-8">
            {[
              {
                year: "2019",
                text: "풍천리양수발전소건설반대대책위원회를 결성했습니다. 이창후 총무, 허순이 주민 등이 중심이 되어 주민 만장일치로 건설 반대를 결의했습니다.",
              },
              {
                year: "매주",
                text: "홍천군청 앞에서 집회를 이어왔습니다. 비가 오나 눈이 오나, 무더위와 한파 속에서도 쉬지 않았습니다. 2025년 말 기준 680여 차.",
              },
              {
                year: "2024.7",
                text: "홍천군청 2층에서 경찰과 대치하는 사건이 발생했습니다. 이 과정에서 7명의 주민(60~80대)이 퇴거불응 혐의로 기소되어, 벌금 200~300만원이 구형되었습니다. 총 1,800만원.",
              },
              {
                year: "연대",
                text: "전국 140여 개 단체가 연대했습니다. 양수발전소신규건설반대전국네트워크, 기독교환경운동연대, 원주녹색연합, 청소년직접행동 등이 함께하고 있습니다.",
              },
              {
                year: "상경",
                text: "국회와 정부 청사 앞까지 올라가 목소리를 냈습니다. 서울까지 몇 시간이 걸리는 길을, 60~80대 어르신들이 버스를 타고 오갔습니다.",
              },
              {
                year: "원칙",
                text: "모든 투쟁은 민주적 절차에 따른 합법적 방법으로 이루어졌습니다. 주민들은 폭력이 아니라 목소리로 싸웠습니다.",
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-5 md:gap-8">
                <div className="shrink-0 w-16 md:w-20">
                  <span className="inline-block bg-[var(--color-forest)] text-white text-xs md:text-sm font-bold px-3 py-1.5 rounded-full">
                    {item.year}
                  </span>
                </div>
                <p className="text-[var(--color-text)] leading-relaxed text-base md:text-lg pt-0.5">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 우리가 요구하는 것 ── */}
      <section className="py-20 md:py-28 px-4 sm:px-6 bg-[var(--color-bg)]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-forest)] mb-10">
            우리가 요구하는 것
          </h2>
          <ul className="space-y-4 mb-16">
            {[
              "양수발전소 건설 계획 전면 백지화",
              "2025년 8월 29일 산업통상자원부 실시계획인가 고시(제2025-151호) 취소",
              "잣나무 숲과 생태계 보전",
              "주민 생존권 보장",
            ].map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-4 text-base md:text-lg text-[var(--color-text)]"
              >
                <span className="shrink-0 w-8 h-8 rounded-full bg-[var(--color-forest)]/10 text-[var(--color-forest)] flex items-center justify-center font-bold text-sm mt-0.5">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
          <blockquote className="border-l-4 border-[var(--color-forest)] pl-6 md:pl-8 py-2">
            <p className="text-xl md:text-2xl lg:text-3xl font-bold text-[var(--color-forest)] leading-snug">
              &ldquo;우리는 우리의 숲, 우리의 마을,
              <br className="hidden sm:inline" /> 우리의 삶을 지키고
              싶습니다.&rdquo;
            </p>
          </blockquote>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 md:py-28 px-4 sm:px-6 bg-[var(--color-forest)] text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-6">
            함께해주세요
          </h2>
          <p className="text-white/80 text-lg md:text-xl mb-10 leading-relaxed">
            풍천리 주민들의 싸움은 우리 모두의 싸움입니다.
            <br />
            작은 관심과 참여가 큰 힘이 됩니다.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/petition"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-[var(--color-forest)] font-bold text-lg hover:bg-white/90 transition-colors min-h-[52px]"
            >
              서명하기
            </Link>
            <Link
              href="/donate"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white/15 border-2 border-white/30 text-white font-bold text-lg hover:bg-white/25 transition-colors min-h-[52px]"
            >
              후원하기
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
