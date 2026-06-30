import { EditableText } from "@/components/editable";
import { NewsCard } from "./NewsCard";
import type { NewsDisplayItem, NewsListConfig } from "./news-list-config";

export function NewsGrid({
  filteredItems,
  newsListConfig,
}: {
  filteredItems: NewsDisplayItem[];
  newsListConfig: NewsListConfig;
}) {
  return (
    <section className="max-w-4xl mx-auto px-4 pb-20">
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredItems.map((item) => (
            <NewsCard key={item.id} item={item} newsListConfig={newsListConfig} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-[var(--color-text-muted)] text-lg">
            <EditableText
              contentKey={newsListConfig.empty.contentKey}
              defaultValue={newsListConfig.empty.defaultValue}
              as="span"
              page={newsListConfig.page}
              section="empty"
            />
          </p>
        </div>
      )}
    </section>
  );
}
