import Image from "next/image";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import type { NewsDisplayItem, NewsListConfig } from "./news-list-config";

export function NewsCard({
  item,
  newsListConfig,
}: {
  item: NewsDisplayItem;
  newsListConfig: NewsListConfig;
}) {
  const categoryTagColors =
    newsListConfig.categoryTagColors[item.category] ?? newsListConfig.fallbackTagColor;

  return (
    <Link
      href={`${newsListConfig.detailPathPrefix}/${item.slug}`}
      className="group block min-h-[44px] bg-white rounded-[var(--radius-card)] border border-[var(--color-border)] shadow-card hover-lift overflow-hidden"
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
            <Newspaper
              className="w-12 h-12 text-[var(--color-text-muted)]"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </div>
        )}
        <span
          className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm ${categoryTagColors}`}
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
            {new Date(item.date).toLocaleDateString(newsListConfig.dateLocale, {
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
  );
}
