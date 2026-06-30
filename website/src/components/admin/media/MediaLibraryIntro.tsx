export function MediaLibraryIntro() {
  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-admin-text)]">
          미디어 라이브러리
        </h1>
        <p className="mt-2 text-[var(--color-admin-muted)]">
          업로드한 이미지를 한곳에서 관리하고 URL을 복사해 페이지 편집에 재사용합니다.
        </p>
      </div>

      <section className="rounded-3xl border border-[var(--color-admin-border)] bg-[var(--color-admin-surface)] p-5 text-sm leading-relaxed text-[var(--color-admin-muted)]">
        권장 흐름: <strong className="text-[var(--color-admin-text)]">업로드</strong> →{" "}
        <strong className="text-[var(--color-admin-text)]">URL 복사</strong> → 공개 페이지
        인라인 편집 또는 사이트 빌더에 붙여넣기. 현재 지원 형식은 JPG, PNG, WebP입니다.
      </section>
    </>
  );
}
