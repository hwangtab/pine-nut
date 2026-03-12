import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import ShareButtons from "@/components/ShareButtons";
import UtilityHeader from "@/components/UtilityHeader";
import { EditableLink, EditableText } from "@/components/editable";
import { getNewsBySlug, getPublishedNews } from "@/lib/data/news";
import {
  translateNewsItemToEnglish,
  translateNewsItemsToEnglish,
} from "@/lib/i18n/news-en";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);

  if (!item) {
    return { title: "Article Not Found" };
  }

  const translated = translateNewsItemToEnglish(item);

  return {
    title: `${translated.title} — Save Pungcheon-ri`,
    description: translated.summary,
    alternates: {
      canonical: `/en/news/${slug}`,
      languages: {
        en: `/en/news/${slug}`,
        ko: `/news/${slug}`,
      },
    },
    openGraph: {
      title: translated.title,
      description: translated.summary,
      type: "article",
      locale: "en_US",
      ...(translated.thumbnailUrl ? { images: [translated.thumbnailUrl] } : {}),
    },
  };
}

export default async function EnglishNewsDetailPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);

  if (!item) {
    notFound();
  }

  const translatedItem = translateNewsItemToEnglish(item);
  const allNews = translateNewsItemsToEnglish(await getPublishedNews());
  const currentIndex = allNews.findIndex((newsItem) => newsItem.slug === slug);
  const prevItem =
    currentIndex < allNews.length - 1 ? allNews[currentIndex + 1] : null;
  const nextItem = currentIndex > 0 ? allNews[currentIndex - 1] : null;

  const paragraphs = translatedItem.content
    .split("\n\n")
    .filter((paragraph) => paragraph.trim());
  const formattedDate = new Date(translatedItem.date).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-bg)] to-white">
      <UtilityHeader
        title={translatedItem.title}
        subtitle={translatedItem.summary}
        eyebrow={`${translatedItem.category} · ${formattedDate}`}
        tone="slate"
      />

      <article className="max-w-3xl mx-auto px-4 pt-10 md:pt-14 pb-20">
        <EditableLink
          contentKey="en.news.detail.backHref"
          defaultHref="/en/news"
          page="en/news"
          section="detail"
          className="inline-flex items-center min-h-[44px] text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors mb-8"
        >
          <EditableText
            contentKey="en.news.detail.backLabel"
            defaultValue="< Back to News"
            as="span"
            page="en/news"
            section="detail"
          />
        </EditableLink>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--color-text-muted)] font-medium mb-10">
          <time dateTime={translatedItem.date}>{formattedDate}</time>
          {translatedItem.sourceName && (
            <>
              <span aria-hidden="true">·</span>
              {translatedItem.sourceUrl ? (
                <a
                  href={translatedItem.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-forest)] hover:underline"
                >
                  <EditableText
                    contentKey="en.news.detail.sourcePrefix"
                    defaultValue="Read original at"
                    as="span"
                    page="en/news"
                    section="detail"
                  />{" "}
                  {translatedItem.sourceName} ↗
                </a>
              ) : (
                <span>{translatedItem.sourceName}</span>
              )}
            </>
          )}
        </div>

        {translatedItem.thumbnailUrl && (
          <div className="relative w-full aspect-[16/9] mb-10 rounded-xl overflow-hidden">
            <Image
              src={translatedItem.thumbnailUrl}
              alt={translatedItem.title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority
            />
          </div>
        )}

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

        <hr className="border-[var(--color-border)] mb-8" />

        <div className="mb-12">
          <ShareButtons
            title={translatedItem.title}
            page="en/news"
            section="detail"
            contentPrefix="en.news.detail.share"
          />
        </div>

        <hr className="border-[var(--color-border)] mb-8" />

        <nav className="grid grid-cols-1 sm:grid-cols-2 gap-4" aria-label="Previous and next news">
          {prevItem ? (
            <Link
              href={`/en/news/${prevItem.slug}`}
              className="group flex flex-col p-5 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-forest)] hover:shadow-md transition-all"
            >
              <EditableText
                contentKey="en.news.detail.prevLabel"
                defaultValue="← Previous"
                as="span"
                page="en/news"
                section="detail"
                className="text-xs text-[var(--color-text-muted)] mb-1"
              />
              <span className="text-sm font-semibold text-[var(--color-text)] group-hover:text-[var(--color-forest)] transition-colors line-clamp-2">
                {prevItem.title}
              </span>
            </Link>
          ) : (
            <div />
          )}
          {nextItem ? (
            <Link
              href={`/en/news/${nextItem.slug}`}
              className="group flex flex-col items-end text-right p-5 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-forest)] hover:shadow-md transition-all"
            >
              <EditableText
                contentKey="en.news.detail.nextLabel"
                defaultValue="Next →"
                as="span"
                page="en/news"
                section="detail"
                className="text-xs text-[var(--color-text-muted)] mb-1"
              />
              <span className="text-sm font-semibold text-[var(--color-text)] group-hover:text-[var(--color-forest)] transition-colors line-clamp-2">
                {nextItem.title}
              </span>
            </Link>
          ) : (
            <div />
          )}
        </nav>
      </article>
    </div>
  );
}
