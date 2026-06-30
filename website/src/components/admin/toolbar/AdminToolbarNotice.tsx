export function AdminToolbarNotice() {
  return (
    <div className="fixed bottom-24 left-1/2 z-[9989] w-[min(92vw,38rem)] -translate-x-1/2 rounded-2xl border border-white/10 bg-gray-900/90 px-4 py-3 text-xs text-white/70 shadow-2xl backdrop-blur-xl">
      인라인 편집은 문구, 이미지, 링크, 섹션 표시 여부를 다룹니다. 내비/푸터 링크 세트,
      기존 섹션 순서, 커스텀 섹션은{" "}
      <strong className="text-white/90">사이트 빌더</strong>, 이전 상태 복원은{" "}
      <strong className="text-white/90">히스토리</strong>에서 관리합니다.
    </div>
  );
}
