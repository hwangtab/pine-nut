import type { ReactNode } from "react";

const buttonBase =
  "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 min-h-[44px]";

export function ShareButton({
  onClick,
  className,
  ariaLabel,
  icon,
  children,
}: {
  onClick: () => void;
  className: string;
  ariaLabel: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`${buttonBase} ${className}`}
      aria-label={ariaLabel}
    >
      {icon}
      {children}
    </button>
  );
}
