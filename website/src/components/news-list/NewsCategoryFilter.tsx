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
  const categories = [
    {
      label: newsListConfig.allCategory,
      ...newsListConfig.fallbackFilterStyle,
    },
    ...availableCategories.map((category) => ({
      label: category,
      ...(newsListConfig.categoryFilterStyles[category] ??
        newsListConfig.fallbackFilterStyle),
    })),
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 mb-10">
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((category) => (
          <button
            key={category.label}
            onClick={() => onSelectCategory(category.label)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 min-h-[44px] ${
              activeCategory === category.label ? category.activeColor : category.color
            } hover:shadow-md`}
          >
            {category.label}
          </button>
        ))}
      </div>
    </div>
  );
}
