"use client";

import { useState } from "react";
import Link from "next/link";
import { newsItems, type NewsItem } from "@/data/news";
import SubHero from "@/components/SubHero";

type Category = "전체" | NewsItem["category"];

const categories: { label: Category; color: string; activeColor: string }[] = [
  { label: "전체", color: "bg-[var(--color-bg)] text-[var(--color-text-muted)]", activeColor: "bg-[var(--color-text)] text-white" },
  { label: "공지", color: "bg-[var(--color-sky)]/10 text-[var(--color-sky)]", activeColor: "bg-[var(--color-sky)] text-white" },
  { label: "집회", color: "bg-[var(--color-warm)]/10 text-[var(--color-warm)]", activeColor: "bg-[var(--color-warm)] text-white" },
  { label: "언론보도", color: "bg-[var(--color-earth)]/10 text-[var(--color-earth)]", activeColor: "bg-[var(--color-earth)] text-white" },
  { label: "연대", color: "bg-[var(--color-forest)]/10 text-[var(--color-forest)]", activeColor: "bg-[var(--color-forest)] text-white" },
];

const categoryTagColors: Record<NewsItem["category"], string> = {
  공지: "bg-[var(--color-sky)]/10 text-[var(--color-sky)]",
  집회: "bg-[var(--color-warm)]/10 text-[var(--color-warm)]",
  언론보도: "bg-[var(--color-earth)]/10 text-[var(--color-earth)]",
  연대: "bg-[var(--color-forest)]/10 text-[var(--color-forest)]",
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
      <SubHero
        imageUrl="https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/0722/IE003499236_STD.jpg"
        title="소식"
        subtitle="풍천리의 최신 소식을 전합니다"
      />

      {/* Emotional context line */}
      <p className="text-center text-[var(--color-text-muted)] pt-12 md:pt-16 mb-8 px-4">
        풍천리의 이야기는 계속되고 있습니다. 언론이 주목하는 7년의 기록.
      </p>

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
                className="group block bg-white rounded-2xl border border-[var(--color-border)] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden"
              >
                {/* Thumbnail */}
                <div className="relative w-full h-48 bg-[var(--color-bg)]">
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--color-bg)] to-[var(--color-border)]">
                      <svg
                        className="w-12 h-12 text-[var(--color-text-muted)]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2zM7 8h4M7 12h10M7 16h6"
                        />
                      </svg>
                    </div>
                  )}
                  {/* Category badge overlay */}
                  <span
                    className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm ${
                      categoryTagColors[item.category]
                    }`}
                  >
                    {item.category}
                  </span>
                </div>
                <div className="p-5">
                  {/* Title */}
                  <h2 className="text-lg font-bold text-[var(--color-text)] mb-2 leading-snug group-hover:text-[var(--color-forest)] transition-colors line-clamp-2">
                    {item.title}
                  </h2>

                  {/* Summary (2 lines truncated) */}
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-4 line-clamp-2">
                    {item.summary}
                  </p>

                  {/* Date & Source */}
                  <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] font-medium">
                    <time>
                      {new Date(item.date).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                    {item.sourceName && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{item.sourceName}</span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-[var(--color-text-muted)] text-lg">
              해당 카테고리의 소식이 없습니다.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
