const GUIDE_STEPS = [
  {
    step: "1",
    title: "인라인 편집",
    body: "공개 페이지에서 문구, 이미지, 링크, 섹션 표시 여부를 바로 수정합니다.",
  },
  {
    step: "2",
    title: "사이트 빌더",
    body: "내비/푸터 링크, 커스텀 섹션, 기존 섹션 순서와 배경/간격을 관리합니다.",
  },
  {
    step: "3",
    title: "히스토리 복원",
    body: "저장 후 문제가 생기면 히스토리에서 페이지 콘텐츠, 소식, 타임라인을 이전 상태로 되돌립니다.",
  },
];

export default function AdminDashboardGuide() {
  return (
    <section className="mb-8 rounded-3xl border border-[var(--color-admin-border)] bg-[var(--color-admin-surface)] p-6">
      <h2 className="text-lg font-bold text-[var(--color-admin-text)]">빠른 가이드</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {GUIDE_STEPS.map((item) => (
          <div key={item.step} className="rounded-2xl bg-[var(--color-bg)] p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-admin-muted)]">
              {item.step}
            </div>
            <div className="mt-2 text-base font-bold text-[var(--color-admin-text)]">
              {item.title}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-admin-muted)]">
              {item.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
