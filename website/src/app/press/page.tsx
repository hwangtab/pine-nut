import { FileText, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import SubHero from "@/components/SubHero";

export const metadata: Metadata = {
  title: "자료실 — 풍천리를 지켜주세요",
  description:
    "언론인, 연구자, 활동가를 위한 풍천리 양수발전소 반대 투쟁 관련 자료 모음. 보도자료, 팩트시트, 사진 자료를 다운로드하세요.",
};

const pressKitItems = [
  {
    title: "보도자료",
    description: "풍천리 양수발전소 반대 투쟁 보도자료",
    icon: FileText,
    color: "text-[var(--color-forest)] bg-[var(--color-bg-warm)]",
    href: "/press/release",
  },
  {
    title: "팩트시트",
    description: "풍천리 투쟁 핵심 정리 (1페이지)",
    icon: FileText,
    color: "text-[var(--color-warm)] bg-[var(--color-bg-warm)]",
    href: "/press/factsheet",
  },
];

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

export default function PressPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[var(--color-bg)] to-white">
      <SubHero
        imageUrl="https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/1016/IE003535383_STD.jpg"
        fallbackImageUrl="https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/1016/IE003535387_STD.jpg"
        title="자료실"
        subtitle="언론인·활동가를 위한 풍천리 관련 자료"
        eyebrow="자료 아카이브"
      />

      <div className="max-w-4xl mx-auto px-4 pt-12 md:pt-16 pb-20 space-y-16">
        {/* Press Kit Section */}
        <section>
          <h2 className="text-xl md:text-2xl font-bold text-[var(--color-text)] mb-6">
            보도 키트
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pressKitItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  target="_blank"
                  className="group flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-[var(--color-border)] shadow-sm hover:shadow-md hover:border-[var(--color-forest)]/20 transition-all"
                >
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${item.color}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-[var(--color-text)] mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)] mb-4 leading-relaxed">
                    {item.description}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-forest)] group-hover:text-[var(--color-forest-light)] transition-colors">
                    다운로드
                    <ExternalLink className="w-4 h-4" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Fact Sheet Section */}
        <section>
          <h2 className="text-xl md:text-2xl font-bold text-[var(--color-text)] mb-6">
            핵심 팩트시트
          </h2>
          <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm overflow-hidden">
            <div className="divide-y divide-[var(--color-border)]">
              {factSheetData.map((fact) => (
                <div
                  key={fact.label}
                  className="flex flex-col sm:flex-row sm:items-center px-6 py-4 gap-1 sm:gap-4"
                >
                  <dt className="text-sm font-bold text-[var(--color-text-muted)] sm:w-36 shrink-0">
                    {fact.label}
                  </dt>
                  <dd className="text-base text-[var(--color-text)] font-medium">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Media Contact Section */}
        <section>
          <h2 className="text-xl md:text-2xl font-bold text-[var(--color-text)] mb-6">
            언론 연락처
          </h2>
          <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm p-6 md:p-8">
            <p className="text-[var(--color-text-muted)] mb-6 leading-relaxed">
              취재 및 자료 요청은 빠띠 캠페인 페이지를 통해 문의해 주세요. 빠른 시일 내에
              답변드리겠습니다.
            </p>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-start gap-3 p-4 bg-[var(--color-bg-warm)] rounded-xl">
                <ExternalLink className="w-5 h-5 text-[var(--color-forest)] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text-muted)] mb-0.5">
                    캠페인 페이지
                  </p>
                  <a
                    href="https://campaigns.do/campaigns/1328"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-medium text-[var(--color-text)] hover:text-[var(--color-forest)] transition-colors"
                  >
                    빠띠 캠페인 페이지에서 문의하기
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How to Cite Section */}
        <section>
          <h2 className="text-xl md:text-2xl font-bold text-[var(--color-text)] mb-6">
            인용 안내
          </h2>
          <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm p-6 md:p-8">
            <p className="text-[var(--color-text-muted)] mb-4 leading-relaxed">
              연구 및 보도 시 아래 형식으로 인용해 주시기 바랍니다.
            </p>
            <div className="bg-[var(--color-bg-warm)] rounded-xl p-5 border border-[var(--color-border)]">
              <p className="text-sm text-[var(--color-text)] leading-relaxed font-mono">
                풍천리 주민회. (2026). 풍천리 양수발전소 반대 투쟁 기록.
                <br />
                https://pungcheon.kr
              </p>
            </div>
            <p className="text-sm text-[var(--color-text-muted)] mt-4 leading-relaxed">
              APA 형식 예시:
            </p>
            <div className="bg-[var(--color-bg-warm)] rounded-xl p-5 border border-[var(--color-border)] mt-2">
              <p className="text-sm text-[var(--color-text)] leading-relaxed font-mono">
                풍천리 주민회 (2026).{" "}
                <em>풍천리를 지켜주세요: 양수발전소 건설 반대 투쟁 기록</em>.
                https://pungcheon.kr
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
