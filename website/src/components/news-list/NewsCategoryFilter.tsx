import type { NewsDisplayItem, NewsListConfig } from "./news-list-config";

export function NewsCategoryFilter({
  newsItems,
  activeCategory,
  onSelectCategory,
  newsListConfig,
}: {
  newsItems: NewsDisplayItem[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  newsListConfig: NewsListConfig;
}) {
  const availableCategories = newsListConfig.categories.filter((category) =>
    newsItems.some((item) => item.category === category),
  );
  const categories = [newsListConfig.allCategory, ...availableCategories];

  return (
    <div className="max-w-4xl mx-auto px-4 mb-10">
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 min-h-[44px] ${
              activeCategory === category
                ? "bg-[var(--color-forest)] text-white shadow-md"
                : "bg-white border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-moss)]"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}
