"use client";

import { useState } from "react";
import SubHero from "@/components/SubHero";
import { EditableText } from "@/components/editable";
import { NewsCategoryFilter } from "./NewsCategoryFilter";
import { NewsGrid } from "./NewsGrid";
import type { NewsDisplayItem, NewsListConfig } from "./news-list-config";

export function NewsListPage({
  newsItems,
  newsListConfig,
}: {
  newsItems: NewsDisplayItem[];
  newsListConfig: NewsListConfig;
}) {
  const [activeCategory, setActiveCategory] = useState(newsListConfig.allCategory);
  const filteredItems =
    activeCategory === newsListConfig.allCategory
      ? newsItems
      : newsItems.filter((item) => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-bg)] to-white">
      <SubHero
        imageUrl={newsListConfig.hero.imageUrl}
        imageContentKey={newsListConfig.hero.imageContentKey}
        imagePage={newsListConfig.page}
        imageSection={newsListConfig.hero.imageSection}
        title={
          <EditableText
            contentKey={newsListConfig.hero.titleKey}
            defaultValue={newsListConfig.hero.titleDefault}
            as="span"
            page={newsListConfig.page}
            section="hero"
          />
        }
        subtitle={
          <EditableText
            contentKey={newsListConfig.hero.subtitleKey}
            defaultValue={newsListConfig.hero.subtitleDefault}
            as="span"
            page={newsListConfig.page}
            section="hero"
          />
        }
        eyebrow={
          <EditableText
            contentKey={newsListConfig.hero.eyebrowKey}
            defaultValue={newsListConfig.hero.eyebrowDefault}
            as="span"
            page={newsListConfig.page}
            section="hero"
          />
        }
      />

      <EditableText
        contentKey={newsListConfig.intro.contentKey}
        defaultValue={newsListConfig.intro.defaultValue}
        as="p"
        page={newsListConfig.page}
        section="intro"
        className="text-center text-[var(--color-text-muted)] pt-12 md:pt-16 mb-8 px-4"
      />

      <NewsCategoryFilter
        newsItems={newsItems}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        newsListConfig={newsListConfig}
      />
      <NewsGrid filteredItems={filteredItems} newsListConfig={newsListConfig} />
    </div>
  );
}
