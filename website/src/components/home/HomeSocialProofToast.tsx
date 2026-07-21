export default function HomeSocialProofToast({
  visible,
  name,
  prefix,
  suffix,
}: {
  visible: boolean;
  name: string | null;
  prefix: string;
  suffix: string;
}) {
  if (!visible || !name) return null;

  return (
    <div className="toast-in fixed bottom-20 left-4 z-40 max-w-xs px-4 py-3 rounded-2xl bg-[var(--color-text)]/95 backdrop-blur-md border border-white/10 text-white text-sm shadow-lg pointer-events-none">
      <span aria-hidden="true" className="mr-1.5">🎉</span>
      {prefix} {name}
      {suffix}
    </div>
  );
}
