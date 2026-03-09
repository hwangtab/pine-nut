import { Download, FileText, Image, Archive, Mail, Phone } from "lucide-react";
import type { Metadata } from "next";

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
    href: "#",
    color: "text-blue-600 bg-blue-50",
  },
  {
    title: "팩트시트",
    description: "풍천리 투쟁 핵심 정리 (1페이지)",
    icon: FileText,
    href: "#",
    color: "text-purple-600 bg-purple-50",
  },
  {
    title: "사진 자료",
    description: "고화질 사진 모음 (ZIP)",
    icon: Image,
    href: "#",
    color: "text-green-600 bg-green-50",
  },
];

const factSheetData = [
  { label: "위치", value: "강원도 홍천군 화촌면 풍천리" },
  { label: "투쟁 기간", value: "2019년 3월 ~ 현재 (7년+)" },
  { label: "집회 횟수", value: "680회 이상" },
  { label: "주민 참여", value: "만장일치 반대" },
  {
    label: "주요 쟁점",
    value: "생태계 파괴, 소음·분진, 잣 생산지 소멸, 공동체 와해",
  },
  { label: "사업자", value: "한국수력원자력" },
];

export default function PressPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[var(--color-bg)] to-white">
      {/* Header */}
      <section className="pt-16 pb-10 md:pt-24 md:pb-14 px-4 text-center">
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">
          자료실
        </h1>
        <p className="text-base md:text-lg text-[var(--color-text-muted)] max-w-xl mx-auto leading-relaxed">
          언론인·연구자·활동가를 위한 자료 모음
        </p>
      </section>

      <div className="max-w-4xl mx-auto px-4 pb-20 space-y-16">
        {/* Press Kit Section */}
        <section>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
            보도 키트
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {pressKitItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.title}
                  href={item.href}
                  className="group flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                >
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${item.color}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                    {item.description}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-forest)] group-hover:underline">
                    <Download className="w-4 h-4" />
                    다운로드
                  </span>
                </a>
              );
            })}
          </div>
        </section>

        {/* Fact Sheet Section */}
        <section>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
            핵심 팩트시트
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-100">
              {factSheetData.map((fact) => (
                <div
                  key={fact.label}
                  className="flex flex-col sm:flex-row sm:items-center px-6 py-4 gap-1 sm:gap-4"
                >
                  <dt className="text-sm font-bold text-gray-500 sm:w-32 shrink-0">
                    {fact.label}
                  </dt>
                  <dd className="text-base text-gray-900 font-medium">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Media Contact Section */}
        <section>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
            언론 연락처
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
            <p className="text-gray-600 mb-6 leading-relaxed">
              취재 및 자료 요청은 아래 연락처로 문의해 주세요. 빠른 시일 내에
              답변드리겠습니다.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <Mail className="w-5 h-5 text-[var(--color-forest)] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-0.5">
                    이메일
                  </p>
                  <a
                    href="mailto:press@pungcheon.kr"
                    className="text-base font-medium text-gray-900 hover:text-[var(--color-forest)] transition-colors"
                  >
                    press@pungcheon.kr
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <Phone className="w-5 h-5 text-[var(--color-forest)] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-0.5">
                    전화
                  </p>
                  <a
                    href="tel:000-0000-0000"
                    className="text-base font-medium text-gray-900 hover:text-[var(--color-forest)] transition-colors"
                  >
                    000-0000-0000
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How to Cite Section */}
        <section>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
            인용 안내
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
            <p className="text-gray-600 mb-4 leading-relaxed">
              연구 및 보도 시 아래 형식으로 인용해 주시기 바랍니다.
            </p>
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <p className="text-sm text-gray-800 leading-relaxed font-mono">
                풍천리 주민회. (2026). 풍천리 양수발전소 반대 투쟁 기록.
                <br />
                https://pungcheon.kr
              </p>
            </div>
            <p className="text-sm text-gray-500 mt-4 leading-relaxed">
              APA 형식 예시:
            </p>
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 mt-2">
              <p className="text-sm text-gray-800 leading-relaxed font-mono">
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
