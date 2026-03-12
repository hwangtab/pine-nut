"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SubHero from "@/components/SubHero";
import { EditableText } from "@/components/editable";
import type { EnglishNewsCategory, EnglishNewsItem } from "@/lib/i18n/news-en";

type Category = "All" | EnglishNewsCategory;

const categoryFilterStyles: Record<
  EnglishNewsCategory,
  { color: string; activeColor: string }
> = {
  Notice: {
    color: "bg-[var(--color-sky)]/10 text-[var(--color-sky)]",
    activeColor: "bg-[var(--color-sky)] text-white",
  },
  Protest: {
    color: "bg-[var(--color-warm)]/10 text-[var(--color-warm)]",
    activeColor: "bg-[var(--color-warm)] text-white",
  },
  "Press Coverage": {
    color: "bg-[var(--color-earth)]/10 text-[var(--color-earth)]",
    activeColor: "bg-[var(--color-earth)] text-white",
  },
  Solidarity: {
    color: "bg-[var(--color-forest)]/10 text-[var(--color-forest)]",
    activeColor: "bg-[var(--color-forest)] text-white",
  },
};

const categoryTagColors: Record<EnglishNewsCategory, string> = {
  Notice: "bg-[var(--color-sky)]/10 text-[var(--color-sky)]",
  Protest: "bg-[var(--color-warm)]/10 text-[var(--color-warm)]",
  "Press Coverage": "bg-[var(--color-earth)]/10 text-[var(--color-earth)]",
  Solidarity: "bg-[var(--color-forest)]/10 text-[var(--color-forest)]",
};

export default function EnglishNewsListClient({
  newsItems,
}: {
  newsItems: EnglishNewsItem[];
}) {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const availableCategories = (
    ["Notice", "Protest", "Press Coverage", "Solidarity"] as const
  ).filter((category) => newsItems.some((item) => item.category === category));
  const categories: { label: Category; color: string; activeColor: string }[] = [
    {
      label: "All",
      color: "bg-[var(--color-bg)] text-[var(--color-text-muted)]",
      activeColor: "bg-[var(--color-text)] text-white",
    },
    ...availableCategories.map((category) => ({
      label: category,
      color: categoryFilterStyles[category].color,
      activeColor: categoryFilterStyles[category].activeColor,
    })),
  ];

  const filteredItems =
    activeCategory === "All"
      ? newsItems
      : newsItems.filter((item) => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-bg)] to-white">
      <SubHero
        imageUrl="https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/0722/IE003499236_STD.jpg"
        imageContentKey="en.news.hero.image"
        imagePage="en/news"
        imageSection="hero"
        title={<EditableText contentKey="en.news.hero.title" defaultValue="News" as="span" page="en/news" section="hero" />}
        subtitle={<EditableText contentKey="en.news.hero.subtitle" defaultValue="Updates and coverage from the ongoing struggle in Pungcheon-ri" as="span" page="en/news" section="hero" />}
        eyebrow={<EditableText contentKey="en.news.hero.eyebrow" defaultValue="Latest Updates" as="span" page="en/news" section="hero" />}
      />

      <EditableText
        contentKey="en.news.intro.text"
        defaultValue="The story of Pungcheon-ri is still unfolding. These are the reports, statements, and field updates shaping the record."
        as="p"
        page="en/news"
        section="intro"
        className="text-center text-[var(--color-text-muted)] pt-12 md:pt-16 mb-8 px-4"
      />

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

      <section className="max-w-4xl mx-auto px-4 pb-20">
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredItems.map((item) => (
              <Link
                key={item.id}
                href={`/en/news/${item.slug}`}
                className="group block min-h-[44px] bg-white rounded-2xl border border-[var(--color-border)] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden"
              >
                <div className="relative w-full h-48 bg-[var(--color-bg)]">
                  {item.thumbnailUrl ? (
                    <Image
                      src={item.thumbnailUrl}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      style={{ objectFit: "cover" }}
                      className="group-hover:scale-105 transition-transform duration-300"
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
                  <span
                    className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm ${
                      categoryTagColors[item.category]
                    }`}
                  >
                    {item.category}
                  </span>
                </div>
                <div className="p-5">
                  <h2 className="text-lg font-bold text-[var(--color-text)] mb-2 leading-snug group-hover:text-[var(--color-forest)] transition-colors line-clamp-2">
                    {item.title}
                  </h2>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-4 line-clamp-2">
                    {item.summary}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] font-medium">
                    <time dateTime={item.date}>
                      {new Date(item.date).toLocaleDateString("en-US", {
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
              <EditableText
                contentKey="en.news.empty.text"
                defaultValue="No updates are available in this category."
                as="span"
                page="en/news"
                section="empty"
              />
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
