import type { ComponentPropsWithoutRef, ReactNode } from "react";

/**
 * 사진 위 소형 뱃지(콘서트 D-day·카테고리·출처 등). 다크 틴트로 흰 잉크 대비 고정.
 * dot을 true로 주면 앞에 warm 포인트 점을 표시한다.
 */
interface GlassChipProps extends ComponentPropsWithoutRef<"span"> {
  dot?: boolean;
  children: ReactNode;
}

export default function GlassChip({
  dot = false,
  className = "",
  children,
  ...rest
}: GlassChipProps) {
  return (
    <span className={`glass-chip ${className}`.trim()} {...rest}>
      {dot && (
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 rounded-full bg-[var(--color-warm-light)]"
        />
      )}
      {children}
    </span>
  );
}
