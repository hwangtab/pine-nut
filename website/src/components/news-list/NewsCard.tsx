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
  return (
    <Link
      href={`${newsListConfig.detailPathPrefix}/${item.slug}`}
      className="group block min-h-[44px] paper hover-lift border-t-2 border-t-[var(--color-text)] overflow-hidden"
    >
      <div className="relative z-[1]">
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
          <span className="ink-chip absolute top-3 left-3">{item.category}</span>
        </div>
        <div className="p-5">
          <h2 className="font-serif-display font-bold text-lg text-[var(--color-text)] mb-2 leading-snug group-hover:text-[var(--color-forest)] transition-colors line-clamp-2">
            {item.title}
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-4 line-clamp-2">
            {item.summary}
          </p>
          <div className="flex items-center gap-2 font-serif-display text-sm text-[var(--color-text-muted)]">
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
      </div>
    </Link>
  );
}
