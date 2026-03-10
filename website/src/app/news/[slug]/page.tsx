import { notFound } from "next/navigation";
import Link from "next/link";
import { newsItems } from "@/data/news";
import ShareButtons from "@/components/ShareButtons";
import type { Metadata } from "next";

const categoryTagColors: Record<string, string> = {
  공지: "bg-[var(--color-sky)]/10 text-[var(--color-sky)]",
  집회: "bg-[var(--color-warm)]/10 text-[var(--color-warm)]",
  언론보도: "bg-[var(--color-earth)]/10 text-[var(--color-earth)]",
  연대: "bg-[var(--color-forest)]/10 text-[var(--color-forest)]",
};

// Sort by date descending for consistent prev/next ordering
const sortedItems = [...newsItems].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
);

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = newsItems.find((n) => n.slug === slug);
  if (!item) return { title: "소식을 찾을 수 없습니다" };

  return {
    title: `${item.title} — 풍천리를 지켜주세요`,
    description: item.summary,
    openGraph: {
      title: item.title,
      description: item.summary,
      type: "article",
      locale: "ko_KR",
    },
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const item = newsItems.find((n) => n.slug === slug);

  if (!item) {
    notFound();
  }

  const currentIndex = sortedItems.findIndex((n) => n.slug === slug);
  const prevItem = currentIndex < sortedItems.length - 1 ? sortedItems[currentIndex + 1] : null;
  const nextItem = currentIndex > 0 ? sortedItems[currentIndex - 1] : null;

  const paragraphs = item.content.split("\n\n").filter((p) => p.trim());

  return (
    <main className="min-h-screen bg-gradient-to-b from-[var(--color-bg)] to-white">
      <article className="max-w-3xl mx-auto px-4 pt-32 pb-20 md:pt-40">
        {/* Back link */}
        <Link
          href="/news"
          className="inline-flex items-center text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors mb-8"
        >
          ← 소식 목록으로
        </Link>

        {/* Category tag */}
        <span
          className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4 ${
            categoryTagColors[item.category] || "bg-[var(--color-bg)] text-[var(--color-text)]"
          }`}
        >
          {item.category}
        </span>

        {/* Title */}
        <h1 className="text-2xl md:text-4xl font-extrabold text-[var(--color-text)] mb-4 leading-tight">
          {item.title}
        </h1>

        {/* Date & Source */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--color-text-muted)] font-medium mb-10">
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
              {item.sourceUrl ? (
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-forest)] hover:underline"
                >
                  {item.sourceName} 원문 보기 ↗
                </a>
              ) : (
                <span>{item.sourceName}</span>
              )}
            </>
          )}
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none mb-12">
          {paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className="text-[var(--color-text-muted)] leading-relaxed mb-6 text-base md:text-lg"
            >
              {paragraph}
            </p>
          ))}
        </div>

        {/* Divider */}
        <hr className="border-[var(--color-border)] mb-8" />

        {/* Share buttons */}
        <div className="mb-12">
          <ShareButtons title={item.title} />
        </div>

        {/* Divider */}
        <hr className="border-[var(--color-border)] mb-8" />

        {/* Previous/Next navigation */}
        <nav className="grid grid-cols-1 sm:grid-cols-2 gap-4" aria-label="이전/다음 소식">
          {prevItem ? (
            <Link
              href={`/news/${prevItem.slug}`}
              className="group flex flex-col p-5 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-forest)] hover:shadow-md transition-all"
            >
              <span className="text-xs text-[var(--color-text-muted)] mb-1">← 이전 소식</span>
              <span className="text-sm font-semibold text-[var(--color-text)] group-hover:text-[var(--color-forest)] transition-colors line-clamp-2">
                {prevItem.title}
              </span>
            </Link>
          ) : (
            <div />
          )}
          {nextItem ? (
            <Link
              href={`/news/${nextItem.slug}`}
              className="group flex flex-col items-end text-right p-5 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-forest)] hover:shadow-md transition-all"
            >
              <span className="text-xs text-[var(--color-text-muted)] mb-1">다음 소식 →</span>
              <span className="text-sm font-semibold text-[var(--color-text)] group-hover:text-[var(--color-forest)] transition-colors line-clamp-2">
                {nextItem.title}
              </span>
            </Link>
          ) : (
            <div />
          )}
        </nav>
      </article>
    </main>
  );
}
