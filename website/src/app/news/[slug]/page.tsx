import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getNewsBySlug, getPublishedNewsSummaries } from "@/lib/data/news";
import ShareButtons from "@/components/ShareButtons";
import UtilityHeader from "@/components/UtilityHeader";
import type { Metadata } from "next";
import { localeAlternates } from "@/lib/seo-alternates";
import { EditableLink, EditableText } from "@/components/editable";

/**
 * 정적 프리렌더 + 태그 무효화로 서빙한다. 관리자가 소식을 저장·삭제하면
 * revalidateNewsPaths()가 이 경로를 즉시 무효화하므로(lib/actions/news/revalidation.ts)
 * 아래 시간값은 그 경로를 타지 않는 변경(DB 직접 수정 등)에 대비한 안전판이다.
 * 예전에는 force-dynamic이 걸려 있었는데, 이 페이지들은 방문자가 누구든 같은
 * 내용을 보여주면서도 조회 1회마다 서버 렌더 + Supabase 왕복을 냈다.
 */
export const revalidate = 3600;

type Params = Promise<{ slug: string }>;

/**
 * 발행된 기사를 빌드 때 미리 렌더한다. 여기 없는 slug(빌드 뒤 등록된 기사)는
 * 첫 요청 때 렌더돼 캐시된다 — 관리자 저장 시 revalidatePath가 함께 돌므로
 * 목록과 상세가 어긋나지 않는다.
 *
 * 조회가 실패해도 빈 목록을 돌려주고 넘어간다. 이 함수는 "미리 만들어 둘 것"을
 * 고르는 최적화일 뿐이라, 실패하면 전부 요청 시점 렌더로 떨어지면 그만이다.
 * 여기서 예외를 던지면 Supabase가 잠깐 흔들리거나 자격증명 없는 새 클론에서
 * 빌드 자체가 멈춘다 — 최적화가 배포를 막아서는 안 된다. 없는 기사를 404로
 * 돌리는 fail-closed 동작은 요청 시점의 getNewsBySlug가 그대로 담당한다.
 */
export async function generateStaticParams() {
  try {
    const items = await getPublishedNewsSummaries();
    return items.map((item) => ({ slug: item.slug }));
  } catch (error) {
    console.error("generateStaticParams: 기사 목록을 읽지 못해 사전 렌더를 건너뛴다", error);
    return [];
  }
}


export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);
  if (!item) return { title: "소식을 찾을 수 없습니다" };

  return {
    alternates: localeAlternates(`/news/${slug}`),
    title: `${item.title} — 풍천리를 지켜주세요`,
    description: item.summary,
    openGraph: {
      title: item.title,
      description: item.summary,
      type: "article",
      locale: "ko_KR",
      ...(item.thumbnailUrl ? { images: [item.thumbnailUrl] } : {}),
    },
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);

  if (!item) {
    notFound();
  }

  const allNews = await getPublishedNewsSummaries();
  const currentIndex = allNews.findIndex((n) => n.slug === slug);
  const prevItem = currentIndex < allNews.length - 1 ? allNews[currentIndex + 1] : null;
  const nextItem = currentIndex > 0 ? allNews[currentIndex - 1] : null;

  const paragraphs = item.content.split("\n\n").filter((p) => p.trim());
  const formattedDate = new Date(item.date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-bg)] to-white">
      <UtilityHeader
        title={item.title}
        subtitle={item.summary}
        eyebrow={`${item.category} · ${formattedDate}`}
        tone="slate"
      />

      <article className="max-w-3xl mx-auto px-4 pt-10 md:pt-14 pb-20">
        <EditableLink
          contentKey="news.detail.backHref"
          defaultHref="/news"
          page="news"
          section="detail"
          className="inline-flex items-center min-h-[44px] text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors mb-8"
        >
          <EditableText
            contentKey="news.detail.backLabel"
            defaultValue="← 소식 목록으로"
            as="span"
            page="news"
            section="detail"
          />
        </EditableLink>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-serif-display text-sm text-[var(--color-text-muted)] mb-10">
          <time dateTime={item.date}>{formattedDate}</time>
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
                  {item.sourceName}{" "}
                  <EditableText
                    contentKey="news.detail.sourceSuffix"
                    defaultValue="원문 보기 ↗"
                    as="span"
                    page="news"
                    section="detail"
                  />
                </a>
              ) : (
                <span>{item.sourceName}</span>
              )}
            </>
          )}
        </div>

        {item.thumbnailUrl && (
          <div className="relative w-full aspect-[16/9] mb-10 rounded-[var(--radius-card)] overflow-hidden">
            <Image
              src={item.thumbnailUrl}
              alt={item.title}
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
              className="whitespace-pre-line text-[var(--color-text-muted)] leading-relaxed mb-6 text-base md:text-lg"
            >
              {paragraph}
            </p>
          ))}
        </div>

        <hr className="border-[var(--color-border)] mb-8" />

        <div className="mb-12">
          <ShareButtons
            title={item.title}
            page="news"
            section="detail"
            contentPrefix="news.detail.share"
          />
        </div>

        <hr className="border-[var(--color-border)] mb-8" />

        <nav className="grid grid-cols-1 sm:grid-cols-2 gap-4" aria-label="이전/다음 소식">
          {prevItem ? (
            <Link href={`/news/${prevItem.slug}`} className="group block paper hover-lift">
              <div className="relative z-[1] flex flex-col p-5">
                <EditableText
                  contentKey="news.detail.prevLabel"
                  defaultValue="← 이전 소식"
                  as="span"
                  page="news"
                  section="detail"
                  className="text-xs text-[var(--color-text-muted)] mb-1"
                />
                <span className="font-serif-display font-bold text-sm text-[var(--color-text)] group-hover:text-[var(--color-forest)] transition-colors line-clamp-2">
                  {prevItem.title}
                </span>
              </div>
            </Link>
          ) : (
            <div />
          )}
          {nextItem ? (
            <Link href={`/news/${nextItem.slug}`} className="group block paper hover-lift">
              <div className="relative z-[1] flex flex-col items-end text-right p-5">
                <EditableText
                  contentKey="news.detail.nextLabel"
                  defaultValue="다음 소식 →"
                  as="span"
                  page="news"
                  section="detail"
                  className="text-xs text-[var(--color-text-muted)] mb-1"
                />
                <span className="font-serif-display font-bold text-sm text-[var(--color-text)] group-hover:text-[var(--color-forest)] transition-colors line-clamp-2">
                  {nextItem.title}
                </span>
              </div>
            </Link>
          ) : (
            <div />
          )}
        </nav>
      </article>
    </div>
  );
}
