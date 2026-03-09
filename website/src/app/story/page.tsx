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
              마을입니다. 사방이 울창한 <strong>잣나무 숲</strong>으로 둘러싸여
              있고, 맑은 물이 흐르며, 계절마다 색을 바꾸는 산등성이가 마을을
              감싸고 있습니다.
            </p>
            <p>
              주민들은 <strong>수십 년간 잣 채취와 농업</strong>으로 생계를
              이어왔습니다. 잣나무 숲은 단순한 풍경이 아니라, 가족을 먹여 살린
              삶의 터전입니다.
            </p>
            <p>
              마을 주민 대부분이 <strong>70대 이상 고령</strong>입니다. 평생을
              이곳에서 땀 흘리며 살아온 어르신들에게, 풍천리는 고향 그
              이상입니다. 자연과 함께 숨 쉬며 살아온, 조용하고 평화로운
              마을이었습니다.
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
              양수발전소는 <strong>산 위와 아래에 거대한 인공 저수지 2개</strong>
              를 만들어, 전기가 남는 밤에 아래 저수지의 물을 위로 퍼올리고,
              전기가 필요한 낮에 그 물을 다시 떨어뜨려 터빈을 돌리는
              발전소입니다. 말하자면 물을 이용한 거대한 배터리입니다.
            </p>
            <p>
              문제는 건설 과정입니다. 저수지를 만들기 위해{" "}
              <strong>산 전체를 깎아내야</strong> 합니다. 도로를 뚫고, 터널을
              파고, 댐을 세우는 대규모 토목 공사가 수년간 이어집니다.
            </p>
            <p>
              이 계획대로라면 풍천리 일대{" "}
              <strong>수십만 평의 산림이 파괴</strong>됩니다. 수백 년 된
              잣나무들이 뿌리째 뽑히고, 맑던 계곡물이 흙탕물로 변하게 됩니다.
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
                수백 년 된 잣나무 군락지가 통째로 사라집니다. 산양, 수달, 하늘다람쥐 등
                야생동물 서식지가 영구적으로 파괴됩니다.
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
                잣 생산지가 소멸하면 주민들의 주요 소득원이 사라집니다. 평생
                가꿔온 삶의 기반이 하루아침에 무너지는 것입니다.
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
                대규모 공사로 인한 소음, 분진, 진동이 수년간 이어집니다. 70대
                이상 고령 주민들의 건강이 심각하게 악화될 수 있습니다.
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
                마을 분위기가 파괴되고, 이주 압력이 거세지며, 수십 년간 함께해온
                공동체가 해체됩니다. 한 번 흩어지면 다시 모일 수 없습니다.
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
                text: "마을 주민 만장일치로 양수발전소 건설 반대를 결의했습니다. 단 한 사람의 이탈도 없었습니다.",
              },
              {
                year: "매주",
                text: "군청 앞에서 집회를 이어왔습니다. 비가 오나 눈이 오나, 무더위와 한파 속에서도 쉬지 않았습니다. 지금까지 680회 이상.",
              },
              {
                year: "상경",
                text: "국회와 정부 청사 앞까지 올라가 목소리를 냈습니다. 서울까지 몇 시간이 걸리는 길을, 70대 어르신들이 버스를 타고 오갔습니다.",
              },
              {
                year: "연대",
                text: "전국 환경단체들과 손을 잡았습니다. 혼자가 아니라는 사실이 주민들에게 큰 힘이 되었습니다.",
              },
              {
                year: "희생",
                text: "평생 법을 어긴 적 없는 어르신들이, 마을을 지키려다 전과자가 되었습니다. 그래도 물러서지 않았습니다.",
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
              "양수발전소 건설 계획 백지화",
              "주민 생존권 보장",
              "생태계 보전",
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
