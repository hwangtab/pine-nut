import Image from "next/image";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import type { NewsDisplayItem, NewsListConfig } from "./news-list-config";

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

// "2026-08-20"처럼 날짜만 있는 값은 new Date()가 UTC 자정으로 읽는다. 그걸
// 방문자 로컬 시간대로 찍으면 미국 등 UTC보다 늦은 곳에선 하루 전 날짜가 된다.
// 날짜만 있는 값은 UTC 기준으로 포맷해 적힌 날짜 그대로 보이게 한다.
function formatNewsDate(value: string, locale: string): string {
  return new Date(value).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...(DATE_ONLY.test(value) ? { timeZone: "UTC" } : {}),
  });
}

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
        <div className="p-5" lang={item.isTranslated === false ? "ko" : undefined}>
          <h2 className="font-serif-display font-bold text-lg text-[var(--color-text)] mb-2 leading-snug group-hover:text-[var(--color-forest)] transition-colors line-clamp-2">
            {item.title}
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-4 line-clamp-2">
            {item.summary}
          </p>
          <div className="flex items-center gap-2 font-serif-display text-sm text-[var(--color-text-muted)]">
            <time dateTime={item.date}>
              {formatNewsDate(item.date, newsListConfig.dateLocale)}
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
