export default function AdminSpecialPagesNotice() {
  return (
    <section className="mt-10 rounded-3xl border border-dashed border-[var(--color-admin-border)] px-6 py-5 text-sm leading-relaxed text-[var(--color-admin-muted)]">
      <strong className="text-[var(--color-admin-text)]">404 페이지</strong>와 세부
      문구처럼 사이트 빌더에 없는 특수 화면은 공개 페이지에서 인라인 편집 모드로
      수정합니다. 저장 후에는 새 탭에서 공개 화면을 한 번 확인하는 흐름을
      권장합니다.
    </section>
  );
}
