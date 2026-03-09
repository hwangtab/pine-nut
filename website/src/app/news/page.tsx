"use client";

import { useState } from "react";
import Link from "next/link";
import { newsItems, type NewsItem } from "@/data/news";

type Category = "전체" | NewsItem["category"];

const categories: { label: Category; color: string; activeColor: string }[] = [
  { label: "전체", color: "bg-gray-100 text-gray-700", activeColor: "bg-gray-800 text-white" },
  { label: "공지", color: "bg-blue-50 text-blue-700", activeColor: "bg-blue-600 text-white" },
  { label: "집회", color: "bg-orange-50 text-orange-700", activeColor: "bg-orange-600 text-white" },
  { label: "언론보도", color: "bg-purple-50 text-purple-700", activeColor: "bg-purple-600 text-white" },
  { label: "연대", color: "bg-green-50 text-green-700", activeColor: "bg-green-600 text-white" },
];

const categoryTagColors: Record<NewsItem["category"], string> = {
  공지: "bg-blue-100 text-blue-800",
  집회: "bg-orange-100 text-orange-800",
  언론보도: "bg-purple-100 text-purple-800",
  연대: "bg-green-100 text-green-800",
};

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("전체");

  const sortedItems = [...newsItems].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const filteredItems =
    activeCategory === "전체"
      ? sortedItems
      : sortedItems.filter((item) => item.category === activeCategory);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[var(--color-bg)] to-white">
      {/* Header */}
      <section className="pt-16 pb-10 md:pt-24 md:pb-14 px-4 text-center">
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">
          소식
        </h1>
        <p className="text-base md:text-lg text-[var(--color-text-muted)] max-w-xl mx-auto leading-relaxed">
          풍천리의 최신 소식을 전합니다
        </p>
      </section>

      {/* Category filter pills */}
      <div className="max-w-4xl mx-auto px-4 mb-10">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setActiveCategory(cat.label)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 min-h-[44px] ${
                activeCategory === cat.label ? cat.activeColor : cat.color
              } hover:shadow-md`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* News cards grid */}
      <section className="max-w-4xl mx-auto px-4 pb-20">
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredItems.map((item) => (
              <Link
                key={item.id}
                href={`/news/${item.slug}`}
                className="group block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden"
              >
                <div className="p-6">
                  {/* Category tag */}
                  <span
                    className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${
                      categoryTagColors[item.category]
                    }`}
                  >
                    {item.category}
                  </span>

                  {/* Title */}
                  <h2 className="text-lg font-bold text-gray-900 mb-2 leading-snug group-hover:text-[var(--color-forest)] transition-colors">
                    {item.title}
                  </h2>

                  {/* Summary (2 lines truncated) */}
                  <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2">
                    {item.summary}
                  </p>

                  {/* Date */}
                  <time className="text-xs text-gray-400 font-medium">
                    {new Date(item.date).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">
              해당 카테고리의 소식이 없습니다.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
