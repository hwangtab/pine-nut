import type { ReactNode } from "react";

export function CardActionButton({
  onClick,
  className,
  children,
}: {
  onClick: () => void;
  className: string;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl text-xs font-semibold transition-colors cursor-pointer ${className}`}
    >
      {children}
    </button>
  );
}
