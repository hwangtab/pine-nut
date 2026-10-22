import type { SignatureToast } from "@/components/home/useHomeSignatureActivity";

export default function HomeSocialProofToast({
  visible,
  toast,
  suffix,
}: {
  visible: boolean;
  toast: SignatureToast | null;
  suffix: string;
}) {
  if (!visible || !toast) return null;
  const { name, ago } = toast;

  // z-30: 모바일 메뉴 시트(z-40)·내비게이션(z-50) 아래 — 메뉴를 연 화면을 덮지 않는다.
  // 알림이 아니라 부가 정보라 role="status"(polite)로 낭독을 끼어들게 하지 않는다.
  return (
    <div
      role="status"
      className="toast-in fixed bottom-20 left-4 z-30 max-w-xs px-4 py-3 rounded-2xl bg-[var(--color-text)]/95 backdrop-blur-md border border-white/10 text-white text-sm shadow-lg pointer-events-none"
    >
      <span aria-hidden="true" className="mr-1.5">🎉</span>
      {ago} {name}
      {suffix}
    </div>
  );
}
