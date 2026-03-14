import UtilityHeader from "@/components/UtilityHeader";
import { EditableLink, EditableText } from "@/components/editable";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <UtilityHeader
        title={
          <EditableText
            contentKey="notfound.header.title"
            defaultValue="페이지를 찾을 수 없습니다"
            as="span"
            page="not-found"
            section="header"
          />
        }
        subtitle={
          <EditableText
            contentKey="notfound.header.subtitle"
            defaultValue="요청하신 페이지가 존재하지 않거나 이동되었습니다."
            as="span"
            page="not-found"
            section="header"
          />
        }
        eyebrow={<EditableText contentKey="notfound.header.eyebrow" defaultValue="오류 안내" as="span" page="not-found" section="header" />}
        tone="forest"
      />

      <section className="max-w-2xl mx-auto px-6 py-14 md:py-16 text-center">
        <EditableLink
          contentKey="notfound.primary.href"
          defaultHref="/"
          page="not-found"
          section="primary"
          className="inline-flex items-center justify-center bg-[var(--color-warm)] text-white font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity min-h-[44px]"
        >
          <EditableText
            contentKey="notfound.primary.label"
            defaultValue="홈으로 돌아가기"
            as="span"
            page="not-found"
            section="primary"
          />
        </EditableLink>

        <div className="mt-12">
          <EditableText
            contentKey="notfound.links.title"
            defaultValue="찾고 계신 내용이 아래에 있을 수 있습니다"
            as="p"
            page="not-found"
            section="links"
            className="mb-6 text-sm text-[var(--color-text-muted)]"
          />
          <div className="flex flex-wrap justify-center gap-4">
            <EditableLink
              contentKey="notfound.links.storyHref"
              defaultHref="/story"
              page="not-found"
              section="links"
              className="inline-flex items-center justify-center min-h-[44px] px-5 py-2 border border-[var(--color-forest)]/20 rounded-lg text-[var(--color-text)] hover:bg-[var(--color-forest)]/5 transition-colors"
            >
              <EditableText
                contentKey="notfound.links.storyLabel"
                defaultValue="이야기"
                as="span"
                page="not-found"
                section="links"
              />
            </EditableLink>
            <EditableLink
              contentKey="notfound.links.petitionHref"
              defaultHref="/petition"
              page="not-found"
              section="links"
              className="inline-flex items-center justify-center min-h-[44px] px-5 py-2 border border-[var(--color-forest)]/20 rounded-lg text-[var(--color-text)] hover:bg-[var(--color-forest)]/5 transition-colors"
            >
              <EditableText
                contentKey="notfound.links.petitionLabel"
                defaultValue="서명하기"
                as="span"
                page="not-found"
                section="links"
              />
            </EditableLink>
            <EditableLink
              contentKey="notfound.links.donateHref"
              defaultHref="/donate"
              page="not-found"
              section="links"
              className="inline-flex items-center justify-center min-h-[44px] px-5 py-2 border border-[var(--color-forest)]/20 rounded-lg text-[var(--color-text)] hover:bg-[var(--color-forest)]/5 transition-colors"
            >
              <EditableText
                contentKey="notfound.links.donateLabel"
                defaultValue="후원하기"
                as="span"
                page="not-found"
                section="links"
              />
            </EditableLink>
          </div>
        </div>
      </section>
    </div>
  );
}
